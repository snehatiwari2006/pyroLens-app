"""GET /hotspots — filtered real-time thermal anomalies with class labels."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from ...deps import require_role
from ....ml.classifier import classify_features
from ....ml.explainability import explain_classification
from ....repository import repository
from ....schemas import ThermalEvent

router = APIRouter(tags=["hotspots"])

CLASS_FILTERS = {"Industrial Heat", "New Source", "Likely Fire", "Artifact"}


def _marker_color(label: str) -> str:
    return {
        "Likely Fire": "#dc2626",
        "New Source": "#ea580c",
        "Industrial Heat": "#2563eb",
        "Artifact": "#64748b",
    }.get(label, "#94a3b8")


def classify_event(event: ThermalEvent, wind_speed: float = 0.0, distance_km: float = 5.0) -> dict:
    persistence_count = max(1, int(round(event.persistence_score / 5)) or event.observations)
    result = classify_features({
        "brightness_temp": event.brightness_kelvin,
        "confidence": event.confidence,
        "distance_to_industry": distance_km,
        "persistence_count": persistence_count,
        "wind_speed": wind_speed,
    })
    explanation = explain_classification(result)
    return {
        "id": event.id,
        "name": event.name,
        "lat": event.latitude,
        "lon": event.longitude,
        "brightness_temp": event.brightness_kelvin,
        "confidence": event.confidence,
        "frp_mw": event.frp_mw,
        "persistence_count": persistence_count,
        "persistence_score": event.persistence_score,
        "timestamp": event.observed_at.isoformat(),
        "source": event.source,
        "risk_score": event.risk_score,
        "risk_level": event.risk_level,
        "status": event.status,
        "location": event.location,
        "classification": result["label"],
        "class_confidence": result["confidence"],
        "probabilities": result["probabilities"],
        "model_version": result["model_version"],
        "color": _marker_color(result["label"]),
        "explanation": explanation,
    }


@router.get("/hotspots")
async def list_hotspots(
    classification: str | None = Query(None, description="Industrial Heat | New Source | Likely Fire | Artifact"),
    min_confidence: float = Query(0, ge=0, le=100),
    min_risk: float = Query(0, ge=0, le=100),
    bbox: str | None = Query(None, description="west,south,east,north"),
    suspicious_only: bool = Query(False, description="Exclude Industrial Heat and Artifact"),
    limit: int = Query(400, ge=1, le=1000),
    _: dict = Depends(require_role("viewer", "analyst", "admin")),
) -> dict:
    bounds = None
    if bbox:
        parts = [float(part) for part in bbox.split(",")]
        if len(parts) == 4:
            bounds = parts

    payload = []
    for event in repository.list():
        if event.confidence < min_confidence or event.risk_score < min_risk:
            continue
        if bounds:
            west, south, east, north = bounds
            if not (south <= event.latitude <= north and west <= event.longitude <= east):
                continue
        item = classify_event(event)
        label = item["classification"]
        if classification and label.lower() != classification.lower():
            continue
        if suspicious_only and label in {"Industrial Heat", "Artifact"}:
            continue
        payload.append(item)

    payload.sort(key=lambda item: (item["class_confidence"], item["risk_score"]), reverse=True)
    payload = payload[:limit]
    geojson = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [item["lon"], item["lat"]]},
                "properties": {key: value for key, value in item.items() if key != "explanation"},
            }
            for item in payload
        ],
    }
    return {
        "count": len(payload),
        "hotspots": payload,
        "geojson": geojson,
        "classes": sorted(CLASS_FILTERS),
    }


@router.get("/hotspots/{event_id}/explain")
async def explain_hotspot(event_id: str, _: dict = Depends(require_role("viewer", "analyst", "admin"))) -> dict:
    event = repository.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Hotspot not found")
    item = classify_event(event)
    return item["explanation"] | {"event_id": event_id, "classification": item["classification"]}
