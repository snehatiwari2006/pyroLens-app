from abc import ABC, abstractmethod
import asyncio
import csv
from datetime import datetime, timedelta, timezone
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
        days = max(1, int(request.get("days") or settings.firms_days))
        all_events = []
        
        # FIRMS API only supports 1 day per request, so fetch each day separately
        for day in range(days):
            url = f"{settings.firms_base_url}/area/csv/{settings.firms_api_key}/{settings.firms_source}/{area}/1"
            if request.get("start_date"):
                # Calculate date for this day
                start_date = request["start_date"]
                from datetime import datetime, timedelta
                date_obj = datetime.strptime(start_date, "%Y-%m-%d")
                date_obj = date_obj + timedelta(days=day)
                url += f"/{date_obj.strftime('%Y-%m-%d')}"
            elif day > 0:
                # Default to past days if no start_date specified
                from datetime import datetime, timedelta
                date_obj = datetime.now(timezone.utc) - timedelta(days=day)
                url += f"/{date_obj.strftime('%Y-%m-%d')}"
            
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.get(url)
                response.raise_for_status()
            events = self._parse_csv(response.text, source="VIIRS")
            # Enrich with addresses (create new events with updated location)
            for event in events:
                address = await geocoding_provider.reverse_geocode(event.latitude, event.longitude)
                events[events.index(event)] = event.model_copy(update={"location": address})
            all_events.extend(events)
        return all_events

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

    # Fallback data for Central Africa fire belt (Zambia/DRC region)
    _fallback_counts = {
        "industrial_sites": 12,
        "buildings": 847,
        "roads": 234,
        "critical_assets": 8,
        "population": 20328,
    }

    def __init__(self):
        self._local_db_available = False

    async def _check_local_db(self) -> bool:
        """Check if local PostGIS tables are available."""
        if self._local_db_available:
            return True
        try:
            from .database import SessionLocal
            from sqlalchemy import text
            with SessionLocal() as db:
                result = db.execute(text("SELECT 1 FROM planet_osm_point LIMIT 1"))
                self._local_db_available = result.scalar() is not None
                return self._local_db_available
        except Exception:
            self._local_db_available = False
            return False

    async def _query_local_osm(self, latitude: float, longitude: float, radius_m: int = 750) -> dict:
        """Query local PostGIS OSM tables for infrastructure near coordinates."""
        try:
            from .database import SessionLocal
            from sqlalchemy import text
            
            with SessionLocal() as db:
                # Query for buildings, roads, industrial, hospitals, fire stations within radius
                query = text("""
                    SELECT 
                        COUNT(CASE WHEN p.building IS NOT NULL THEN 1 END) as buildings,
                        COUNT(CASE WHEN p.highway IS NOT NULL THEN 1 END) as roads,
                        COUNT(CASE WHEN p.landuse = 'industrial' THEN 1 END) as industrial_sites,
                        COUNT(CASE WHEN p.amenity IN ('hospital', 'fire_station') THEN 1 END) as critical_assets
                    FROM (
                        SELECT ST_Transform(way, 4326) as geom, building, highway, landuse, amenity
                        FROM planet_osm_point
                        WHERE ST_DWithin(
                            ST_Transform(way, 4326)::geography,
                            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                            :radius
                        )
                        UNION ALL
                        SELECT ST_Centroid(ST_Transform(way, 4326)) as geom, building, highway, landuse, amenity
                        FROM planet_osm_polygon
                        WHERE ST_DWithin(
                            ST_Centroid(ST_Transform(way, 4326))::geography,
                            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                            :radius
                        )
                        UNION ALL
                        SELECT ST_Centroid(ST_Transform(way, 4326)) as geom, building, highway, landuse, amenity
                        FROM planet_osm_line
                        WHERE ST_DWithin(
                            ST_Centroid(ST_Transform(way, 4326))::geography,
                            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                            :radius
                        )
                    ) p
                """)
                result = db.execute(query, {"lat": latitude, "lng": longitude, "radius": radius_m}).fetchone()
                
                if result:
                    buildings = result.buildings or 0
                    return {
                        "buildings": buildings,
                        "roads": result.roads or 0,
                        "industrial_sites": result.industrial_sites or 0,
                        "critical_assets": result.critical_assets or 0,
                        "population": buildings * 24,
                        "source": "openstreetmap-postgis",
                        "endpoint": "local-postgis"
                    }
        except Exception as exc:
            pass
        return None

    async def exposure(self, event: ThermalEvent) -> dict:
        settings = get_settings()
        if not settings.osm_live_enabled:
            return {**self._fallback_counts, "source": "fallback", "error": "Live OSM access is disabled"}
        
        # Try local PostGIS first
        local_result = await self._query_local_osm(event.latitude, event.longitude)
        if local_result:
            return local_result
        
        # Fallback to external Overpass if local DB not available
        query = f"""[out:json][timeout:15];(
          nwr(around:750,{event.latitude},{event.longitude})[building];
          way(around:750,{event.latitude},{event.longitude})[highway];
          nwr(around:750,{event.latitude},{event.longitude})[landuse=industrial];
          nwr(around:750,{event.latitude},{event.longitude})[amenity~"hospital|fire_station"];
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
        # Return fallback with error info
        return {**self._fallback_counts, "source": "fallback", "error": last_error}

    def _unavailable_exposure(self, error: str) -> dict:
        return {**self._fallback_counts, "source": "fallback", "error": error}

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


class GeocodingProvider:
    """Reverse geocoding using OSM Nominatim with caching and rate limiting."""
    
    def __init__(self):
        self._cache: dict[str, str] = {}
        self._semaphore = asyncio.Semaphore(5)  # Limit concurrent requests
        self._last_request_time = 0.0
        self._min_interval = 1.0  # Minimum 1 second between requests (Nominatim limit: 1 req/sec)
    
    async def reverse_geocode(self, latitude: float, longitude: float) -> str:
        """Get human-readable address for coordinates (with caching and rate limiting)."""
        cache_key = f"{latitude:.4f},{longitude:.4f}"
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        async with self._semaphore:
            # Double-check cache after acquiring semaphore
            if cache_key in self._cache:
                return self._cache[cache_key]
            
            # Rate limiting: ensure at least 1 second between requests
            import time
            now = time.monotonic()
            time_since_last = now - self._last_request_time
            if time_since_last < self._min_interval:
                await asyncio.sleep(self._min_interval - time_since_last)
            
            try:
                async with httpx.AsyncClient(timeout=10) as client:
                    response = await client.get(
                        "https://nominatim.openstreetmap.org/reverse",
                        params={
                            "lat": latitude,
                            "lon": longitude,
                            "format": "json",
                            "addressdetails": 1,
                        },
                        headers={"User-Agent": "PyroLens/1.0 (https://github.com/pyrolens)"},
                    )
                    response.raise_for_status()
                    data = response.json()
                    address = data.get("address", {})
                    # Build readable address
                    parts = []
                    for key in ["road", "suburb", "city", "town", "village", "county", "state", "country"]:
                        if address.get(key):
                            parts.append(address[key])
                    if parts:
                        result = ", ".join(parts)
                    else:
                        result = data.get("display_name", f"{latitude:.4f}, {longitude:.4f}")
                self._last_request_time = time.monotonic()
                self._cache[cache_key] = result
                return result
            except Exception:
                result = f"Near {latitude:.4f}°, {longitude:.4f}°"
                self._last_request_time = time.monotonic()
                self._cache[cache_key] = result
                return result


class StartupTasks:
    """Background tasks that run on application startup."""
    
    def __init__(self):
        self._started = False
    
    async def fetch_recent_firms(self, days: int = 7) -> int:
        """Fetch and store FIRMS data for the last N days on startup (with geocoding).
        
        Note: FIRMS API area endpoint only supports 1 day per request, so we fetch 1 day at a time.
        """
        if self._started:
            return 0
        self._started = True
        
        settings = get_settings()
        if not settings.firms_api_key:
            return 0
        
        try:
            print(f"Fetching FIRMS data for last {days} days (with geocoding)...")
            # Use the FirmsProvider.fetch method which includes geocoding
            events = await firms_provider.fetch({"days": days})
            print(f"Fetched {len(events)} events from FIRMS")
            if events:
                accepted = repository.save_many(events)
                repository.record_ingestion("firms", len(events), accepted, status="completed")
                print(f"Saved {accepted} events to database")
                return accepted
        except Exception as exc:
            print(f"Error fetching FIRMS data: {exc}")
            repository.record_ingestion("firms", 0, 0, status="failed", error=str(exc))
        return 0


geocoding_provider = GeocodingProvider()
startup_tasks = StartupTasks()

firms_provider = FirmsProvider()
weather_provider = WeatherProvider()
osm_provider = OsmProvider()