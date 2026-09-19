"""PyroLens API: ingestion, intelligence and decision-support endpoints."""
from datetime import datetime, timedelta, timezone
import csv
from io import StringIO
from pathlib import Path
from uuid import uuid4

try:
    import jwt
except ImportError:  # Allows the demo API to start before optional auth extras are installed.
    jwt = None
from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .config import get_settings
from .processing import assess_impact, assess_risk, classify
from .providers import FirmsNotConfiguredError, firms_provider, osm_provider, weather_provider
from .repository import repository
from .storage import object_storage
from .validation import validate_events
from .workers import ingest_firms
from .alerts import send_alert
from .schemas import (
    ClassificationResponse, HealthResponse, ImpactResponse, IngestionRequest,
    IngestionResponse, JobResponse, RiskResponse, ThermalEvent, AlertRequest, AlertResponse,
)

settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0", openapi_url="/api/v1/openapi.json", docs_url="/docs")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
security = HTTPBearer(auto_error=False)
_jobs: dict[str, JobResponse] = {}


class TokenRequest(BaseModel):
    username: str
    role: str = "analyst"


def require_role(*allowed_roles: str):
    async def dependency(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> dict:
        if settings.environment == "development" and credentials is None:
            return {"sub": "demo-analyst", "role": "analyst"}
        if settings.public_read_api and credentials is None and "viewer" in allowed_roles:
            return {"sub": "public-dashboard", "role": "viewer"}
        if credentials is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
        if jwt is None:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="PyJWT is required for authenticated requests")
        try:
            if settings.oidc_jwks_url:
                signing_key = jwt.PyJWKClient(settings.oidc_jwks_url).get_signing_key_from_jwt(credentials.credentials)
                claims = jwt.decode(
                    credentials.credentials,
                    signing_key.key,
                    algorithms=["RS256"],
                    audience=settings.oidc_audience,
                    issuer=settings.oidc_issuer,
                    options={"verify_aud": bool(settings.oidc_audience), "verify_iss": bool(settings.oidc_issuer)},
                )
            else:
                claims = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        except jwt.PyJWTError as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
        roles = claims.get("roles", [claims.get("role")])
        if not any(role in allowed_roles for role in roles):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return claims
    return dependency


@app.on_event("startup")
async def startup() -> None:
    # Database migrations belong in Alembic; demo data remains available while offline.
    return None


@app.get("/health", response_model=HealthResponse, tags=["system"])
async def health() -> HealthResponse:
    return HealthResponse(status="ok", environment=settings.environment, model_version=settings.model_version)


@app.post("/api/v1/auth/token", tags=["auth"])
async def create_token(request: TokenRequest) -> dict:
    if settings.environment != "development":
        raise HTTPException(status_code=501, detail="Production tokens must be issued by the configured identity provider")
    if jwt is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="PyJWT is not installed")
    if request.role not in {"viewer", "analyst", "admin"}:
        raise HTTPException(status_code=422, detail="role must be viewer, analyst, or admin")
    expires = datetime.now(timezone.utc) + timedelta(hours=8)
    token = jwt.encode({"sub": request.username, "role": request.role, "exp": expires}, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return {"access_token": token, "token_type": "bearer", "expires_at": expires}


@app.get("/api/v1/events", response_model=list[ThermalEvent], tags=["events"])
async def list_events(
    min_risk: float = Query(0, ge=0, le=100),
    event_type: str | None = None,
    status_filter: str | None = Query(None, alias="status"),
    _: dict = Depends(require_role("viewer", "analyst", "admin")),
) -> list[ThermalEvent]:
    # The original FE-* records are development fixtures. They are never sent
    # to the Africa operational UI, where an empty feed is more truthful.
    events = [event for event in repository.list() if not event.id.startswith("FE-") and event.risk_score >= min_risk]
    return [
        event for event in events
        if (not event_type or event.event_type.lower() == event_type.lower())
        and (not status_filter or event.status.lower() == status_filter.lower())
    ]


@app.get("/api/v1/events/{event_id}", response_model=ThermalEvent, tags=["events"])
async def get_event(event_id: str, _: dict = Depends(require_role("viewer", "analyst", "admin"))) -> ThermalEvent:
    event = repository.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Thermal event not found")
    return event


@app.post("/api/v1/ingestions", response_model=IngestionResponse, status_code=202, tags=["ingestion"])
async def ingest(request: IngestionRequest, _: dict = Depends(require_role("analyst", "admin"))) -> IngestionResponse:
    job_id = str(uuid4())
    job = JobResponse(job_id=job_id, status="queued", task=f"ingest:{request.source}", created_at=datetime.now(timezone.utc))
    _jobs[job_id] = job
    if request.records is not None:
        events, rejected = validate_events(request.records)
        accepted = repository.save_many(events)
        repository.record_ingestion(request.source, len(request.records), accepted)
        _jobs[job_id] = job.model_copy(update={"status": "completed"})
        return IngestionResponse(
            job_id=job_id, source=request.source, accepted_records=accepted,
            rejected_records=rejected, status="completed",
            validation={"received": len(request.records), "valid": len(events), "stored": accepted},
        )

    if request.source == "firms":
        if not settings.firms_api_key:
            raise HTTPException(status_code=503, detail="FIRMS_API_KEY is not configured. Add a NASA FIRMS MAP key to backend/.env.")
        if settings.use_celery:
            ingest_firms.apply_async(task_id=job_id)
            return IngestionResponse(job_id=job_id, source=request.source, accepted_records=0, rejected_records=0, status="queued")
        try:
            events = await firms_provider.fetch(request.model_dump())
            accepted = repository.save_many(events)
            repository.record_ingestion(request.source, len(events), accepted)
            _jobs[job_id] = job.model_copy(update={"status": "completed"})
            return IngestionResponse(job_id=job_id, source=request.source, accepted_records=accepted, rejected_records=0, status="completed")
        except FirmsNotConfiguredError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        except Exception as exc:
            repository.record_ingestion(request.source, 0, 0, status="failed", error=str(exc))
            _jobs[job_id] = job.model_copy(update={"status": "failed"})
            raise HTTPException(status_code=502, detail="NASA FIRMS ingestion failed") from exc

    events = repository.list()
    _jobs[job_id] = job.model_copy(update={"status": "completed"})
    return IngestionResponse(job_id=job_id, source=request.source, accepted_records=0, rejected_records=0, status="completed", validation={"available_demo_events": len(events)})


@app.get("/api/v1/jobs/{job_id}", response_model=JobResponse, tags=["jobs"])
async def get_job(job_id: str, _: dict = Depends(require_role("viewer", "analyst", "admin"))) -> JobResponse:
    if job := _jobs.get(job_id):
        return job
    raise HTTPException(status_code=404, detail="Job not found")


@app.get("/api/v1/geo/events/nearby", response_model=list[ThermalEvent], tags=["geospatial"])
async def nearby_events(
    lat: float = Query(ge=-90, le=90),
    lng: float = Query(ge=-180, le=180),
    radius_km: float = Query(3, gt=0, le=100),
    _: dict = Depends(require_role("viewer", "analyst", "admin")),
) -> list[ThermalEvent]:
    return repository.nearby(lat, lng, radius_km)


@app.post("/api/v1/assets", status_code=201, tags=["storage"])
async def upload_asset(
    file: UploadFile = File(...),
    _: dict = Depends(require_role("analyst", "admin")),
) -> dict[str, str]:
    """Store source imagery, rasters, generated maps, or model artifacts in MinIO."""
    content = await file.read()
    if not content:
        raise HTTPException(status_code=422, detail="The uploaded file is empty")
    if len(content) > 100 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Maximum upload size is 100 MB")
    try:
        return object_storage.upload(file.filename or "asset.bin", content, file.content_type)
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Object storage is unavailable") from exc


@app.get("/api/v1/events/{event_id}/classification", response_model=ClassificationResponse, tags=["intelligence"])
async def event_classification(event_id: str, _: dict = Depends(require_role("viewer", "analyst", "admin"))) -> ClassificationResponse:
    return await classify(await get_event(event_id))


@app.get("/api/v1/events/{event_id}/impact", response_model=ImpactResponse, tags=["intelligence"])
async def event_impact(event_id: str, _: dict = Depends(require_role("viewer", "analyst", "admin"))) -> ImpactResponse:
    return await assess_impact(await get_event(event_id))


@app.get("/api/v1/events/{event_id}/risk", response_model=RiskResponse, tags=["intelligence"])
async def event_risk(event_id: str, _: dict = Depends(require_role("viewer", "analyst", "admin"))) -> RiskResponse:
    return await assess_risk(await get_event(event_id))


@app.get("/api/v1/events/{event_id}/weather", tags=["layers"])
async def event_weather(event_id: str, _: dict = Depends(require_role("viewer", "analyst", "admin"))) -> dict:
    return await weather_provider.for_event(await get_event(event_id))


@app.get("/api/v1/events/{event_id}/exposure", tags=["layers"])
async def event_exposure(event_id: str, _: dict = Depends(require_role("viewer", "analyst", "admin"))) -> dict:
    return await osm_provider.exposure(await get_event(event_id))


@app.post("/api/v1/events/{event_id}/alerts", response_model=AlertResponse, tags=["alerts"])
async def issue_alert(event_id: str, request: AlertRequest, _: dict = Depends(require_role("analyst", "admin"))) -> AlertResponse:
    event = await get_event(event_id)
    deliveries = await send_alert(event, request.channels, request.recipients, request.message)
    status_value = "sent" if any(delivery["status"] == "sent" for delivery in deliveries) else "recorded"
    return AlertResponse(event_id=event.id, status=status_value, deliveries=deliveries)


@app.get("/api/v1/layers/infrastructure", tags=["layers"])
async def infrastructure_layers(_: dict = Depends(require_role("viewer", "analyst", "admin"))) -> dict:
    return await osm_provider.infrastructure_summary()


@app.get("/api/v1/operational-area", tags=["system"])
async def operational_area(_: dict = Depends(require_role("viewer", "analyst", "admin"))) -> dict:
    """Live status of the Africa pilot's operational sources, without secrets."""
    probe = ThermalEvent(
        id="africa-operational-probe", name=settings.monitoring_area_name,
        lat=settings.monitoring_latitude, lng=settings.monitoring_longitude,
        confidence=100, frp_mw=0, brightness_kelvin=0,
    )
    weather = await weather_provider.for_event(probe)
    infrastructure = await osm_provider.infrastructure_summary()
    latest = repository.latest_ingestion("firms")
    return {
        "area": {"name": settings.monitoring_area_name, "latitude": settings.monitoring_latitude, "longitude": settings.monitoring_longitude, "bbox": settings.firms_default_bbox},
        "sources": {
            "firms": {"configured": bool(settings.firms_api_key), "source": settings.firms_source, "latest_ingestion": latest},
            "weather": weather,
            "openstreetmap": infrastructure,
            "imagery": {"status": "public-wmts", "provider": "NASA GIBS", "layer": "VIIRS SNPP Corrected Reflectance True Color"},
            "terrain": {"status": "ready" if settings.terrain_raster_path and Path(settings.terrain_raster_path).is_file() else "raster-required", "path_configured": bool(settings.terrain_raster_path)},
            "landcover": {"status": "ready" if settings.landcover_raster_path and Path(settings.landcover_raster_path).is_file() else "raster-required", "path_configured": bool(settings.landcover_raster_path)},
            "classification": {"status": "trained-model" if not settings.model_version.endswith("synthetic-v1") else "rule-based", "model_version": settings.model_version},
            "alerts": {"sms": "configured" if all([settings.twilio_account_sid, settings.twilio_auth_token, settings.twilio_from_number]) else "credentials-required", "email": "configured" if settings.smtp_host and settings.smtp_from_address else "credentials-required"},
            "identity": {"status": "configured" if settings.oidc_jwks_url else "development-only"},
        },
    }


@app.get("/api/v1/feeds/status", tags=["ingestion"])
async def feed_status(_: dict = Depends(require_role("viewer", "analyst", "admin"))) -> dict:
    events = repository.list()
    firms_events = [event for event in events if event.id.startswith("FIRMS-")]
    latest_firms_run = repository.latest_ingestion("firms")
    latest_count = latest_firms_run["records_seen"] if latest_firms_run else None
    freshness = "live key not configured"
    if settings.firms_api_key:
        freshness = "NASA FIRMS has not been refreshed yet"
        if latest_firms_run and latest_firms_run["status"] == "completed":
            freshness = (
                "No NASA FIRMS detections in the selected area/time window"
                if latest_count == 0
                else "live NASA FIRMS feed"
            )
        elif latest_firms_run:
            freshness = "NASA FIRMS refresh failed; review the latest ingestion run"
    return {
        "lastSync": (
            f"scheduled every {settings.firms_refresh_seconds // 60} min"
            if settings.use_celery
            else "on-demand refresh"
        ),
        "detections24h": len(firms_events),
        "frpObservations": round(sum(event.frp_mw for event in firms_events)),
        "avgConfidence": round(sum(event.confidence for event in firms_events) / len(firms_events)) if firms_events else 0,
        "satelliteObservations": sum(event.observations for event in firms_events),
        "recordsProcessed": latest_count if latest_count is not None else 0,
        "dataFreshness": freshness,
        "sources": [
            {"name": "NASA FIRMS — VIIRS", "status": "Live — no detections" if settings.firms_api_key and latest_count == 0 else "Live" if settings.firms_api_key else "Key required"},
            {"name": "OpenStreetMap / Overpass", "status": "Live query available" if settings.osm_live_enabled else "Disabled"},
            {"name": "Open-Meteo weather", "status": "Live query available"},
        ],
    }


@app.get("/api/v1/firms/status", tags=["ingestion"])
async def firms_status(_: dict = Depends(require_role("viewer", "analyst", "admin"))) -> dict:
    """Expose configuration state without returning the NASA MAP key."""
    return {
        "configured": bool(settings.firms_api_key),
        "source": settings.firms_source,
        "bbox": settings.firms_default_bbox,
        "days": settings.firms_days,
        "refresh_seconds": settings.firms_refresh_seconds,
        "mode": "celery" if settings.use_celery else "on-demand",
    }


@app.get("/api/v1/reports/incidents.csv", tags=["reports"])
async def export_incidents(_: dict = Depends(require_role("analyst", "admin"))) -> StreamingResponse:
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["id", "name", "latitude", "longitude", "classification", "risk_score", "risk_level", "status", "observed_at"])
    for event in repository.list():
        writer.writerow([event.id, event.name, event.latitude, event.longitude, event.event_type, event.risk_score, event.risk_level, event.status, event.observed_at.isoformat()])
    return StreamingResponse(iter([buffer.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=pyrolens-incidents.csv"})


@app.get("/api/v1/providers", tags=["system"])
async def providers(_: dict = Depends(require_role("viewer", "analyst", "admin"))) -> dict:
    return {
        "operational_area": settings.monitoring_area_name,
        "firms": {"status": "configured" if settings.firms_api_key else "credentials-required", "mode": "NASA FIRMS adapter"},
        "weather": {"status": "configured", "mode": "Open-Meteo live weather adapter"},
        "osm": {"status": "configured" if settings.osm_live_enabled else "disabled", "mode": "OpenStreetMap Overpass adapter"},
        "model": {"status": "rule-based" if settings.model_version.endswith("synthetic-v1") else "active", "version": settings.model_version},
    }
