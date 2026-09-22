"""Short-term fire-spread polygons from wind speed, direction, and intensity."""
from __future__ import annotations

from typing import Any


def _fallback_circle(lon: float, lat: float, radius_m: float) -> dict[str, Any]:
    """Coarse WGS84 ring used when GeoPandas is not installed."""
    from math import cos, radians, sin

    steps = 32
    coords = []
    lat_m = 111_320.0
    lon_m = 111_320.0 * max(0.2, cos(radians(lat)))
    for index in range(steps + 1):
        angle = index / steps * 6.283185307179586
        coords.append([
            lon + (radius_m * cos(angle)) / lon_m,
            lat + (radius_m * sin(angle)) / lat_m,
        ])
    return {"type": "Polygon", "coordinates": [coords]}


def predict_spread_geojson(
    lat: float,
    lon: float,
    wind_speed_kmh: float,
    wind_direction_degrees: float,
    brightness_temp: float = 360,
    hours: float = 3,
    frp_mw: float | None = None,
) -> dict[str, Any]:
    """Return an elongated downwind spread polygon and summary metrics.

    This is an operational sketch, not a full fire-physics simulation. Wind
    stretches the ellipse along the meteorological wind-from direction.
    """
    hours = max(0.5, min(24.0, float(hours)))
    wind = max(0.0, float(wind_speed_kmh))
    intensity = float(frp_mw) if frp_mw is not None else max(5.0, (float(brightness_temp) - 300) * 1.4)
    base_radius_m = max(250.0, min(12_000.0, intensity * 42 + wind * 70)) * (hours / 3)
    downwind_factor = 1 + min(wind, 80) / 28

    try:
        import geopandas as gpd
        from shapely import affinity
        from shapely.geometry import Point, mapping

        point = gpd.GeoSeries([Point(lon, lat)], crs="EPSG:4326").to_crs("EPSG:3857").iloc[0]
        zone = point.buffer(base_radius_m)
        zone = affinity.scale(zone, xfact=downwind_factor, yfact=0.72, origin=point)
        zone = affinity.rotate(zone, 90 - float(wind_direction_degrees), origin=point)
        wgs84 = gpd.GeoSeries([zone], crs="EPSG:3857").to_crs("EPSG:4326").iloc[0]
        geojson = mapping(wgs84)
        area_km2 = round(zone.area / 1_000_000, 3)
        engine = "geopandas-wind-ellipse-v2"
    except Exception:
        geojson = _fallback_circle(lon, lat, base_radius_m * (downwind_factor ** 0.5))
        area_km2 = round(3.14159 * (base_radius_m / 1000) ** 2 * downwind_factor * 0.72, 3)
        engine = "haversine-fallback"

    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": geojson,
                "properties": {
                    "kind": "predicted_spread",
                    "hours": hours,
                    "wind_speed_kmh": wind,
                    "wind_direction_degrees": float(wind_direction_degrees),
                    "area_km2": area_km2,
                    "model": engine,
                },
            },
            {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [lon, lat]},
                "properties": {"kind": "origin"},
            },
        ],
        "impact_zone_km2": area_km2,
        "impact_zone_geojson": geojson,
        "hours": hours,
        "model": engine,
    }
