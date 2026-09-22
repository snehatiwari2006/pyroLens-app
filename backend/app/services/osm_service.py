"""OpenStreetMap / Overpass matching of hotspots to industrial infrastructure."""
from __future__ import annotations

from typing import Any

import httpx

from ..config import get_settings
from .geo import haversine_km

INDUSTRIAL_TAGS = (
    "factory",
    "power plant",
    "chimney",
    "industrial zone",
    "works",
    "refinery",
)

_MIRRORS = (
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
)


def _element_coords(element: dict[str, Any]) -> tuple[float, float] | None:
    if "lat" in element and "lon" in element:
        return float(element["lat"]), float(element["lon"])
    center = element.get("center") or {}
    if "lat" in center and "lon" in center:
        return float(center["lat"]), float(center["lon"])
    return None


def _label(tags: dict[str, str]) -> str:
    if tags.get("name"):
        return tags["name"]
    if tags.get("power") == "plant":
        return "Power plant"
    if tags.get("man_made") == "chimney":
        return "Chimney"
    if tags.get("landuse") == "industrial":
        return "Industrial zone"
    if tags.get("man_made") == "works" or tags.get("industrial"):
        return "Factory / works"
    return "Industrial site"


async def match_industrial_proximity(
    lat: float,
    lon: float,
    radius_m: int = 3000,
) -> dict[str, Any]:
    """Return the nearest industrial OSM feature and distance in kilometres."""
    settings = get_settings()
    empty = {
        "near_industry": False,
        "distance_to_industry_km": None,
        "distance_to_industry_m": None,
        "site_name": None,
        "site_type": None,
        "matches": [],
        "source": "unavailable",
    }
    if not settings.osm_live_enabled:
        return {**empty, "error": "Live OSM access is disabled"}

    query = f"""[out:json][timeout:20];(
      nwr(around:{radius_m},{lat},{lon})[landuse=industrial];
      nwr(around:{radius_m},{lat},{lon})[industrial];
      nwr(around:{radius_m},{lat},{lon})[man_made=works];
      nwr(around:{radius_m},{lat},{lon})[man_made=chimney];
      nwr(around:{radius_m},{lat},{lon})[power=plant];
      nwr(around:{radius_m},{lat},{lon})[office=company];
    );out center tags qt;"""

    last_error = "No public Overpass endpoint responded"
    endpoints = tuple(dict.fromkeys((settings.osm_overpass_url, *_MIRRORS)))
    for url in endpoints:
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(url, data={"data": query})
                response.raise_for_status()
            elements = response.json().get("elements", [])
            matches: list[dict[str, Any]] = []
            for element in elements:
                coords = _element_coords(element)
                if not coords:
                    continue
                tags = element.get("tags") or {}
                distance_km = haversine_km(lat, lon, coords[0], coords[1])
                matches.append({
                    "name": _label(tags),
                    "type": tags.get("industrial") or tags.get("man_made") or tags.get("power") or tags.get("landuse"),
                    "lat": coords[0],
                    "lon": coords[1],
                    "distance_km": round(distance_km, 3),
                    "tags": {key: tags[key] for key in tags if key in {"name", "landuse", "industrial", "man_made", "power"}},
                })
            matches.sort(key=lambda item: item["distance_km"])
            nearest = matches[0] if matches else None
            return {
                "near_industry": bool(nearest and nearest["distance_km"] <= 1.5),
                "distance_to_industry_km": nearest["distance_km"] if nearest else None,
                "distance_to_industry_m": round(nearest["distance_km"] * 1000) if nearest else None,
                "site_name": nearest["name"] if nearest else None,
                "site_type": nearest["type"] if nearest else None,
                "matches": matches[:12],
                "source": "openstreetmap-overpass",
                "endpoint": url,
            }
        except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
            last_error = type(exc).__name__
    return {**empty, "error": last_error}


async def exposure_in_buffer(lat: float, lon: float, radius_m: int = 1500) -> dict[str, Any]:
    """Count buildings, roads, and critical infrastructure inside a buffer."""
    settings = get_settings()
    fallback = {
        "industrial_sites": 0,
        "buildings": 0,
        "roads": 0,
        "critical_assets": 0,
        "hospitals": 0,
        "schools": 0,
        "fire_stations": 0,
        "population": 0,
        "source": "unavailable",
    }
    if not settings.osm_live_enabled:
        return {**fallback, "error": "Live OSM access is disabled"}

    query = f"""[out:json][timeout:20];(
      nwr(around:{radius_m},{lat},{lon})[building];
      way(around:{radius_m},{lat},{lon})[highway];
      nwr(around:{radius_m},{lat},{lon})[landuse=industrial];
      nwr(around:{radius_m},{lat},{lon})[amenity~"hospital|fire_station|school"];
      nwr(around:{radius_m},{lat},{lon})[power=substation];
    );out tags qt;"""

    last_error = "No public Overpass endpoint responded"
    for url in tuple(dict.fromkeys((settings.osm_overpass_url, *_MIRRORS))):
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(url, data={"data": query})
                response.raise_for_status()
            counts = {**fallback, "source": "openstreetmap-overpass", "endpoint": url}
            for element in response.json().get("elements", []):
                tags = element.get("tags", {})
                amenity = tags.get("amenity")
                if "building" in tags:
                    counts["buildings"] += 1
                if "highway" in tags:
                    counts["roads"] += 1
                if tags.get("landuse") == "industrial":
                    counts["industrial_sites"] += 1
                if amenity == "hospital":
                    counts["hospitals"] += 1
                    counts["critical_assets"] += 1
                if amenity == "school":
                    counts["schools"] += 1
                    counts["critical_assets"] += 1
                if amenity == "fire_station":
                    counts["fire_stations"] += 1
                    counts["critical_assets"] += 1
                if tags.get("power") == "substation":
                    counts["critical_assets"] += 1
            # Conservative occupancy estimate used only when census rasters are absent.
            counts["population"] = counts["buildings"] * 24
            return counts
        except (httpx.HTTPError, KeyError, TypeError, ValueError) as exc:
            last_error = type(exc).__name__
    return {**fallback, "error": last_error}
