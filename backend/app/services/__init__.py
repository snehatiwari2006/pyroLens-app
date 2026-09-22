"""External data providers: NASA FIRMS, OpenStreetMap, and weather."""

from .firms_ingest import fetch_firms_hotspots
from .osm_service import match_industrial_proximity
from .weather_service import fetch_weather

__all__ = ["fetch_firms_hotspots", "match_industrial_proximity", "fetch_weather"]
