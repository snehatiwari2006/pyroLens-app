"""POST /predict-spread — short-term fire spread GeoJSON."""
from __future__ import annotations

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException

from ...deps import require_role
from ....ml.spread_predictor import predict_spread_geojson
from ....repository import repository
from ....services.weather_service import fetch_weather

router = APIRouter(tags=["prediction"])


class SpreadRequest(BaseModel):
    event_id: str | None = None
    lat: float | None = Field(default=None, ge=-90, le=90)
    lon: float | None = Field(default=None, ge=-180, le=180)
    brightness_temp: float | None = Field(default=None, ge=0)
    wind_speed: float | None = Field(default=None, ge=0)
    wind_direction: float | None = Field(default=None, ge=0, le=360)
    hours: float = Field(default=3, ge=0.5, le=24)
    frp_mw: float | None = Field(default=None, ge=0)


@router.post("/predict-spread")
async def predict_spread(request: SpreadRequest, _: dict = Depends(require_role("viewer", "analyst", "admin"))) -> dict:
    lat = request.lat
    lon = request.lon
    brightness = request.brightness_temp or 360
    frp = request.frp_mw
    if request.event_id:
        event = repository.get(request.event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Hotspot not found")
        lat = event.latitude if lat is None else lat
        lon = event.longitude if lon is None else lon
        brightness = event.brightness_kelvin
        frp = event.frp_mw if frp is None else frp

    if lat is None or lon is None:
        raise HTTPException(status_code=422, detail="Provide event_id or lat/lon")

    weather = await fetch_weather(lat, lon)
    wind_speed = request.wind_speed if request.wind_speed is not None else float(weather.get("wind_speed_kmh") or 0)
    wind_direction = request.wind_direction if request.wind_direction is not None else float(weather.get("wind_degrees") or 45)
    spread = predict_spread_geojson(
        lat=lat,
        lon=lon,
        wind_speed_kmh=wind_speed,
        wind_direction_degrees=wind_direction,
        brightness_temp=brightness,
        hours=request.hours,
        frp_mw=frp,
    )
    return {
        "origin": {"lat": lat, "lon": lon},
        "weather": weather,
        "hours": request.hours,
        "geojson": {
            "type": "FeatureCollection",
            "features": spread["features"],
        },
        "impact_zone_km2": spread["impact_zone_km2"],
        "model": spread["model"],
    }
