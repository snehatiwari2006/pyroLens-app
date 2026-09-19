from abc import ABC, abstractmethod
import csv
from datetime import datetime, timezone
from hashlib import sha1
from io import StringIO

import httpx
from .config import get_settings
from .schemas import ThermalEvent
from .repository import repository


class FirmsNotConfiguredError(RuntimeError):
    """Raised only for a requested live FIRMS refresh without a MAP key."""

class ThermalProvider(ABC):
    @abstractmethod
    async def fetch(self, request: dict) -> list[ThermalEvent]: ...

class FirmsProvider(ThermalProvider):
    async def fetch(self, request: dict) -> list[ThermalEvent]:
        settings = get_settings()
        if not settings.firms_api_key:
            raise FirmsNotConfiguredError("FIRMS_API_KEY is not configured")
        bbox = request.get("bbox") or [float(value) for value in settings.firms_default_bbox.split(",")]
        if len(bbox) != 4:
            raise ValueError("FIRMS bounding box must be west,south,east,north")
        area = ",".join(str(value) for value in bbox)
        days = min(5, max(1, int(request.get("days") or settings.firms_days)))
        url = f"{settings.firms_base_url}/area/csv/{settings.firms_api_key}/{settings.firms_source}/{area}/{days}"
        if request.get("start_date"):
            url += f"/{request['start_date']}"
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(url)
            response.raise_for_status()
        return self._parse_csv(response.text, source="VIIRS")

    @staticmethod
    def _parse_csv(payload: str, source: str) -> list[ThermalEvent]:
        """Normalize FIRMS area CSV rows at the external-provider boundary."""
        events: list[ThermalEvent] = []
        for row in csv.DictReader(StringIO(payload)):
            try:
                latitude = float(row["latitude"])
                longitude = float(row["longitude"])
                frp = float(row.get("frp") or 0)
                brightness = float(row.get("brightness") or row.get("bright_ti4") or 0)
                raw_confidence = str(row.get("confidence") or "0").strip().lower()
                confidence = {"l": 35, "n": 65, "h": 90}.get(raw_confidence)
                if confidence is None:
                    confidence = float(raw_confidence)
                acquired = f"{row.get('acq_date', '')}T{str(row.get('acq_time', '0000')).zfill(4)}"
                observed_at = datetime.strptime(acquired, "%Y-%m-%dT%H%M").replace(tzinfo=timezone.utc)
                event_id = "FIRMS-" + sha1(f"{latitude}:{longitude}:{acquired}".encode()).hexdigest()[:10].upper()
                persistence = min(100, max(5, frp * 0.4))
                risk = min(100, round(frp / 3 + persistence * 0.35 + confidence * 0.15))
                level = "CRITICAL" if risk >= 85 else "HIGH" if risk >= 65 else "MEDIUM" if risk >= 35 else "LOW"
                event_type = "Industrial Fire" if frp >= 100 and persistence >= 60 else "Persistent Thermal Source" if persistence >= 70 else "Possible False Positive" if frp < 10 else "Potential Fire Event"
                events.append(ThermalEvent(
                    id=event_id, name=f"FIRMS thermal detection {event_id[-6:]}", lat=latitude, lng=longitude,
                    source=row.get("satellite") or source, event_type=event_type,
                    confidence=min(100, max(0, confidence)), frp_mw=max(0, frp), brightness_kelvin=max(0, brightness),
                    observed_at=observed_at, persistence_score=persistence, risk_score=risk, risk_level=level,
                    location=f"NASA FIRMS coordinates: {latitude:.4f}, {longitude:.4f}",
                ))
            except (KeyError, TypeError, ValueError):
                # A malformed vendor row is rejected rather than poisoning the feed.
                continue
        return events

class WeatherProvider:
    async def for_event(self, event: ThermalEvent) -> dict:
        settings = get_settings()
        params = {
            "latitude": event.latitude,
            "longitude": event.longitude,
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
            compass = ("North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West")[round(degrees / 45) % 8]
            return {
                "wind_direction": compass,
                "wind_degrees": degrees,
                "wind_speed_kmh": current["wind_speed_10m"],
                "temperature_c": current["temperature_2m"],
                "humidity_pct": current["relative_humidity_2m"],
                "elevation_m": payload.get("elevation"),
                "source": "open-meteo",
            }
        except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
            # Do not invent weather conditions for a live incident decision.
            return {"wind_direction": "Unavailable", "wind_degrees": 0, "wind_speed_kmh": 0,
                    "temperature_c": None, "humidity_pct": None, "elevation_m": None,
                    "source": "unavailable", "error": f"Live weather request failed: {type(exc).__name__}"}

class OsmProvider:
    _public_mirrors = (
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass.private.coffee/api/interpreter",
    )

    async def exposure(self, event: ThermalEvent) -> dict:
        settings = get_settings()
        if not settings.osm_live_enabled:
            return self._unavailable_exposure("Live OSM access is disabled")
        # A compact probe is more reliable on public Overpass instances than
        # querying every way in a large radius, particularly for live demos.
        query = f"""[out:json][timeout:15];(
          nwr(around:750,{event.latitude},{event.longitude})[building];
          way(around:750,{event.latitude},{event.longitude})[highway];
          nwr(around:750,{event.latitude},{event.longitude})[landuse=industrial];
          nwr(around:750,{event.latitude},{event.longitude})[amenity~\"hospital|fire_station\"];
        );out tags qt;"""
        last_error = "No public Overpass endpoint responded"
        for url in tuple(dict.fromkeys((settings.osm_overpass_url, *self._public_mirrors))):
            try:
                async with httpx.AsyncClient(timeout=15) as client:
                    response = await client.post(url, data={"data": query})
                    response.raise_for_status()
                elements = response.json().get("elements", [])
                counts = {"industrial_sites": 0, "buildings": 0, "roads": 0, "critical_assets": 0}
                for element in elements:
                    tags = element.get("tags", {})
                    if "building" in tags:
                        counts["buildings"] += 1
                    if "highway" in tags:
                        counts["roads"] += 1
                    if tags.get("landuse") == "industrial":
                        counts["industrial_sites"] += 1
                    if tags.get("amenity") in {"hospital", "fire_station"}:
                        counts["critical_assets"] += 1
                return {**counts, "population": counts["buildings"] * 24,
                        "source": "openstreetmap-overpass", "endpoint": url}
            except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
                last_error = type(exc).__name__
        return self._unavailable_exposure(last_error)

    @staticmethod
    def _unavailable_exposure(error: str) -> dict:
        return {"industrial_sites": 0, "buildings": 0, "roads": 0, "population": 0,
                "critical_assets": 0, "source": "unavailable", "error": error}

    async def infrastructure_summary(self) -> dict:
        settings = get_settings()
        probe = ThermalEvent(id="osm-summary", name=settings.monitoring_area_name,
                             lat=settings.monitoring_latitude, lng=settings.monitoring_longitude,
                             confidence=100, frp_mw=0, brightness_kelvin=0)
        exposure = await self.exposure(probe)
        return {
            "counts": {"industries": exposure["industrial_sites"], "hospitals": exposure["critical_assets"], "schools": 0, "residential": exposure["buildings"], "roads": exposure["roads"], "fireStations": 0, "railway": 0, "criticalInfrastructure": exposure["critical_assets"]},
            "source": exposure["source"], "error": exposure.get("error"),
            "endpoint": exposure.get("endpoint"), "area": settings.monitoring_area_name,
        }

firms_provider = FirmsProvider()
weather_provider = WeatherProvider()
osm_provider = OsmProvider()
