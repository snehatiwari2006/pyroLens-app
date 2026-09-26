from __future__ import annotations
from datetime import datetime, timezone
from math import asin, cos, radians, sin, sqrt

from sqlalchemy import select, text

from .database import Base, SessionLocal, engine
from .models import Incident, IngestionRun
from .schemas import ThermalEvent

# Replace this repository with SQLAlchemy/PostGIS persistence without changing routes.
_SEED_EVENTS = [
    ThermalEvent(id="FE-2291", name="Industrial Zone A - Tank Farm 3", location="Industrial Zone A, Sector 12", lat=19.076, lng=72.877, event_type="Industrial Fire", confidence=94, frp_mw=186, brightness_kelvin=412, observations=14, persistence_score=82, risk_score=87, risk_level="CRITICAL", status="Warning Issued"),
    ThermalEvent(id="FE-2288", name="Riverside Chemical Storage", location="Riverside Industrial Belt", lat=19.12, lng=72.85, event_type="Persistent Thermal Source", confidence=88, frp_mw=94, brightness_kelvin=378, observations=38, persistence_score=91, risk_score=71, risk_level="HIGH", status="Responding"),
    ThermalEvent(id="FE-2276", name="Northern Agri Belt Burn", location="Northern Agricultural Zone", lat=19.20, lng=72.83, event_type="Agricultural Burning", confidence=81, frp_mw=22, brightness_kelvin=331, observations=6, persistence_score=26, risk_score=44, risk_level="MEDIUM", status="Monitoring"),
    ThermalEvent(id="FE-2299", name="Eastside Warehousing Cluster", location="Eastside Logistics Park", lat=19.09, lng=72.93, event_type="Possible False Positive", confidence=52, frp_mw=6, brightness_kelvin=302, observations=1, persistence_score=12, risk_score=18, risk_level="LOW", status="Active"),
]

class EventRepository:
    def __init__(self):
        Base.metadata.create_all(bind=engine)
        self._seed()

    def _seed(self) -> None:
        with SessionLocal() as db:
            if db.scalar(select(Incident.id).limit(1)):
                return
            for event in _SEED_EVENTS:
                db.add(self._to_model(event))
            db.commit()

    @staticmethod
    def _to_model(event: ThermalEvent) -> Incident:
        return Incident(
            id=event.id, name=event.name, location=event.location, lat=event.latitude, lng=event.longitude,
            type=event.event_type, confidence=round(event.confidence), risk=event.risk_level,
            risk_score=round(event.risk_score), status=event.status, detection_time=event.observed_at.isoformat(),
            satellite=event.source, frp=f"{event.frp_mw:g} MW", brightness=f"{event.brightness_kelvin:g} K",
            persistence=f"{event.persistence_score:g}", persistence_score=round(event.persistence_score),
            impact_direction="North-East", impact_zone=f"{max(0.1, event.frp_mw / 60):.1f} km2",
            impact_confidence=round(min(95, event.confidence * 0.82)), exposure={}, environmental={},
            raw_payload=event.model_dump(mode="json"),
        )

    @staticmethod
    def _to_schema(model: Incident) -> ThermalEvent:
        return ThermalEvent(
            id=model.id, name=model.name, location=model.location, lat=model.lat, lng=model.lng,
            source=model.satellite, event_type=model.type, confidence=model.confidence,
            frp_mw=float(model.frp.split()[0]), brightness_kelvin=float(model.brightness.split()[0]),
            observed_at=model.created_at.replace(tzinfo=timezone.utc), observations=1,
            persistence_score=model.persistence_score, risk_score=model.risk_score,
            risk_level=model.risk, status=model.status,
        )

    def list(self) -> list[ThermalEvent]:
        with SessionLocal() as db:
            return [self._to_schema(model) for model in db.scalars(select(Incident).order_by(Incident.created_at.desc())).all()]

    def get(self, event_id: str) -> ThermalEvent | None:
        with SessionLocal() as db:
            model = db.get(Incident, event_id)
            return self._to_schema(model) if model else None

    def save_many(self, events: list[ThermalEvent]) -> int:
        with SessionLocal() as db:
            written = 0
            for event in events:
                existing = db.get(Incident, event.id)
                if existing:
                    refreshed = self._to_model(event)
                    for column in Incident.__table__.columns.keys():
                        if column not in {"id", "created_at"}:
                            setattr(existing, column, getattr(refreshed, column))
                    existing.updated_at = datetime.utcnow()
                    continue
                db.add(self._to_model(event))
                written += 1
            db.commit()
            return written

    def nearby(self, latitude: float, longitude: float, radius_km: float) -> list[ThermalEvent]:
        """Use PostGIS in production and a geographic fallback for SQLite demos."""
        with SessionLocal() as db:
            if engine.dialect.name == "postgresql":
                statement = text("""
                    SELECT * FROM incidents
                    WHERE ST_DWithin(
                      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
                      ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                      :radius_meters
                    )
                    ORDER BY created_at DESC
                """)
                models = db.query(Incident).from_statement(statement).params(
                    latitude=latitude, longitude=longitude, radius_meters=radius_km * 1000
                ).all()
                return [self._to_schema(model) for model in models]

            def distance_km(model: Incident) -> float:
                lat_delta = radians(model.lat - latitude)
                lng_delta = radians(model.lng - longitude)
                a = sin(lat_delta / 2) ** 2 + cos(radians(latitude)) * cos(radians(model.lat)) * sin(lng_delta / 2) ** 2
                return 6371 * 2 * asin(sqrt(a))

            return [self._to_schema(model) for model in db.scalars(select(Incident)).all() if distance_km(model) <= radius_km]

    def record_ingestion(self, source: str, seen: int, written: int, status: str = "completed", error: str | None = None) -> int:
        with SessionLocal() as db:
            run = IngestionRun(source=source, status=status, records_seen=seen, records_accepted=written, completed_at=datetime.utcnow())
            db.add(run)
            db.commit()
            db.refresh(run)
            return run.id

    def latest_ingestion(self, source: str) -> dict | None:
        """Return metadata for the most recent provider refresh, without payload data."""
        with SessionLocal() as db:
            run = db.scalar(
                select(IngestionRun)
                .where(IngestionRun.source == source)
                .order_by(IngestionRun.completed_at.desc(), IngestionRun.id.desc())
                .limit(1)
            )
            if run is None:
                return None
            return {
                "status": run.status,
                "records_seen": run.records_seen,
                "records_written": run.records_accepted,
                "finished_at": run.completed_at,
                "error": run.error,
            }

repository = EventRepository()
