"""GET /impact-assessment — exposed population and critical infrastructure."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from ...deps import require_role
from ....ml.spread_predictor import predict_spread_geojson
from ....repository import repository
from ....services.osm_service import exposure_in_buffer, match_industrial_proximity
from ....services.weather_service import fetch_weather

router = APIRouter(tags=["impact"])


@router.get("/impact-assessment")
async def impact_assessment(
    event_id: str | None = Query(None),
    lat: float | None = Query(None, ge=-90, le=90),
    lon: float | None = Query(None, ge=-180, le=180),
    buffer_km: float = Query(1.5, gt=0, le=25),
    hours: float = Query(3, ge=0.5, le=24),
    _: dict = Depends(require_role("viewer", "analyst", "admin")),
) -> dict:
    brightness = 360.0
    frp = None
    name = None
    if event_id:
        event = repository.get(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Hotspot not found")
        lat = event.latitude if lat is None else lat
        lon = event.longitude if lon is None else lon
        brightness = event.brightness_kelvin
        frp = event.frp_mw
        name = event.name
    if lat is None or lon is None:
        raise HTTPException(status_code=422, detail="Provide event_id or lat/lon")

    weather = await fetch_weather(lat, lon)
    industry = await match_industrial_proximity(lat, lon, radius_m=int(max(buffer_km, 3) * 1000))
    exposed = await exposure_in_buffer(lat, lon, radius_m=int(buffer_km * 1000))
    spread = predict_spread_geojson(
        lat=lat,
        lon=lon,
        wind_speed_kmh=float(weather.get("wind_speed_kmh") or 0),
        wind_direction_degrees=float(weather.get("wind_degrees") or 45),
        brightness_temp=brightness,
        hours=hours,
        frp_mw=frp,
    )
    return {
        "event_id": event_id,
        "name": name,
        "origin": {"lat": lat, "lon": lon},
        "buffer_km": buffer_km,
        "assumptions": [
            "Impact is an estimate, not a confirmed damage assessment.",
            "Population is derived from OSM building counts when census rasters are unavailable.",
            "Wind is sampled at the hotspot coordinates from Open-Meteo.",
        ],
        "metrics": {
            "population_at_risk": exposed.get("population", 0),
            "buildings": exposed.get("buildings", 0),
            "roads": exposed.get("roads", 0),
            "critical_infrastructure": exposed.get("critical_assets", 0),
            "hospitals": exposed.get("hospitals", 0),
            "schools": exposed.get("schools", 0),
            "fire_stations": exposed.get("fire_stations", 0),
            "industrial_sites": exposed.get("industrial_sites", 0),
        },
        "industry": industry,
        "weather": weather,
        "spread": {
            "impact_zone_km2": spread["impact_zone_km2"],
            "geojson": {"type": "FeatureCollection", "features": spread["features"]},
            "model": spread["model"],
        },
        "source": exposed.get("source"),
    }
