"""GeoPandas/Rasterio fire-spread estimate with deterministic no-raster fallback."""
from pathlib import Path

from .schemas import ThermalEvent


def _terrain_sample(path: str | None, longitude: float, latitude: float) -> float | None:
    if not path or not Path(path).exists():
        return None
    try:
        import rasterio
        with rasterio.open(path) as raster:
            value = next(raster.sample([(longitude, latitude)]))[0]
            if raster.nodata is not None and value == raster.nodata:
                return None
            return float(value)
    except Exception:
        return None


def estimate_spread(event: ThermalEvent, weather: dict, terrain_path: str | None, landcover_path: str | None) -> dict:
    """Create a wind-oriented impact polygon in WGS84 and terrain metadata.

    The geometric estimate is deliberately conservative; it is not a wildfire
    physics simulator. A production model should consume calibrated fuel,
    terrain, and weather forecast rasters.
    """
    wind_kmh = float(weather.get("wind_speed_kmh", 0))
    direction_degrees = float(weather.get("wind_degrees", 45))
    base_radius_m = max(250, min(8000, event.frp_mw * 42 + wind_kmh * 70))
    terrain_m = _terrain_sample(terrain_path, event.longitude, event.latitude)
    landcover_code = _terrain_sample(landcover_path, event.longitude, event.latitude)
    terrain_factor = 1.15 if terrain_m is not None and terrain_m > 500 else 1.0
    radius_m = base_radius_m * terrain_factor

    try:
        import geopandas as gpd
        from shapely import affinity
        from shapely.geometry import Point, mapping

        point = gpd.GeoSeries([Point(event.longitude, event.latitude)], crs="EPSG:4326").to_crs("EPSG:3857").iloc[0]
        zone = point.buffer(radius_m)
        zone = affinity.scale(zone, xfact=1 + min(wind_kmh, 60) / 30, yfact=1, origin=point)
        zone = affinity.rotate(zone, 90 - direction_degrees, origin=point)
        wgs84_zone = gpd.GeoSeries([zone], crs="EPSG:3857").to_crs("EPSG:4326").iloc[0]
        geojson = mapping(wgs84_zone)
        area_km2 = round(zone.area / 1_000_000, 2)
    except Exception:
        geojson = None
        area_km2 = round(3.14159 * radius_m * radius_m / 1_000_000, 2)

    return {
        "impact_zone_km2": area_km2,
        "impact_zone_geojson": geojson,
        "terrain_elevation_m": terrain_m,
        "landcover_code": landcover_code,
        "model": "geopandas-wind-ellipse-v1",
    }
