"""Live weather for hotspot coordinates via Open-Meteo."""
from __future__ import annotations

from typing import Any

import httpx

from ..config import get_settings

COMPASS = ("North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West")


async def fetch_weather(lat: float, lon: float) -> dict[str, Any]:
    """Return wind, humidity, and temperature at a WGS84 coordinate."""
    settings = get_settings()
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m",
        "timezone": "auto",
    }
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            response = await client.get(settings.weather_base_url, params=params)
            response.raise_for_status()
        payload = response.json()
        current = payload["current"]
        degrees = float(current["wind_direction_10m"])
        return {
            "wind_direction": COMPASS[round(degrees / 45) % 8],
            "wind_degrees": degrees,
            "wind_speed": float(current["wind_speed_10m"]),
            "wind_speed_kmh": float(current["wind_speed_10m"]),
            "temperature_c": current["temperature_2m"],
            "humidity_pct": current["relative_humidity_2m"],
            "elevation_m": payload.get("elevation"),
            "source": "open-meteo",
        }
    except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
        return {
            "wind_direction": "Unavailable",
            "wind_degrees": 0.0,
            "wind_speed": 0.0,
            "wind_speed_kmh": 0.0,
            "temperature_c": None,
            "humidity_pct": None,
            "elevation_m": None,
            "source": "unavailable",
            "error": f"Live weather request failed: {type(exc).__name__}",
        }
