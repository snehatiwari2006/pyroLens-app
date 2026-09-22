"""Fetch VIIRS/MODIS thermal anomalies from the NASA FIRMS area API.

Can be imported by FastAPI/Celery or run as a script:

    python -m app.services.firms_ingest --bbox 22,-15,32,-8 --days 1
"""
from __future__ import annotations

import argparse
import asyncio
import csv
import json
from datetime import datetime, timezone
from hashlib import sha1
from io import StringIO
from typing import Any

import httpx

from ..config import get_settings
from ..providers import FirmsNotConfiguredError
from ..schemas import ThermalEvent


CONFIDENCE_TOKENS = {"l": 35.0, "n": 65.0, "h": 90.0}


def _parse_confidence(raw: str | None) -> float:
    token = str(raw or "0").strip().lower()
    if token in CONFIDENCE_TOKENS:
        return CONFIDENCE_TOKENS[token]
    try:
        return max(0.0, min(100.0, float(token)))
    except ValueError:
        return 0.0


def parse_firms_csv(payload: str, source: str = "VIIRS") -> list[dict[str, Any]]:
    """Normalize FIRMS CSV rows into hotspot dictionaries."""
    hotspots: list[dict[str, Any]] = []
    for row in csv.DictReader(StringIO(payload)):
        try:
            lat = float(row["latitude"])
            lon = float(row["longitude"])
            brightness = float(row.get("brightness") or row.get("bright_ti4") or 0)
            confidence = _parse_confidence(row.get("confidence"))
            frp = float(row.get("frp") or 0)
            acquired = f"{row.get('acq_date', '')}T{str(row.get('acq_time', '0000')).zfill(4)}"
            timestamp = datetime.strptime(acquired, "%Y-%m-%dT%H%M").replace(tzinfo=timezone.utc)
            hotspot_id = "FIRMS-" + sha1(f"{lat}:{lon}:{acquired}".encode()).hexdigest()[:10].upper()
            hotspots.append({
                "id": hotspot_id,
                "lat": lat,
                "lon": lon,
                "brightness": brightness,
                "brightness_temp": brightness,
                "confidence": confidence,
                "frp_mw": max(0.0, frp),
                "timestamp": timestamp.isoformat(),
                "satellite": row.get("satellite") or source,
                "instrument": row.get("instrument") or source,
                "acq_date": row.get("acq_date"),
                "acq_time": row.get("acq_time"),
            })
        except (KeyError, TypeError, ValueError):
            continue
    return hotspots


def hotspots_to_events(hotspots: list[dict[str, Any]]) -> list[ThermalEvent]:
    events: list[ThermalEvent] = []
    for spot in hotspots:
        frp = float(spot.get("frp_mw") or 0)
        persistence = min(100.0, max(5.0, frp * 0.4))
        confidence = float(spot.get("confidence") or 0)
        risk = min(100.0, round(frp / 3 + persistence * 0.35 + confidence * 0.15))
        level = "CRITICAL" if risk >= 85 else "HIGH" if risk >= 65 else "MEDIUM" if risk >= 35 else "LOW"
        event_type = (
            "Industrial Fire" if frp >= 100 and persistence >= 60
            else "Persistent Thermal Source" if persistence >= 70
            else "Possible False Positive" if frp < 10
            else "Potential Fire Event"
        )
        events.append(ThermalEvent(
            id=spot["id"],
            name=f"FIRMS thermal detection {spot['id'][-6:]}",
            lat=spot["lat"],
            lng=spot["lon"],
            source=spot.get("satellite") or "VIIRS",
            event_type=event_type,
            confidence=confidence,
            frp_mw=frp,
            brightness_kelvin=float(spot.get("brightness_temp") or 0),
            observed_at=datetime.fromisoformat(spot["timestamp"]),
            persistence_score=persistence,
            risk_score=risk,
            risk_level=level,
            location=f"NASA FIRMS coordinates: {spot['lat']:.4f}, {spot['lon']:.4f}",
        ))
    return events


async def fetch_firms_hotspots(
    bbox: list[float] | None = None,
    days: int | None = None,
    start_date: str | None = None,
    source: str | None = None,
) -> list[dict[str, Any]]:
    """Download current VIIRS/MODIS thermal anomalies for a bounding box."""
    settings = get_settings()
    if not settings.firms_api_key:
        raise FirmsNotConfiguredError("FIRMS_API_KEY is not configured")
    box = bbox or [float(value) for value in settings.firms_default_bbox.split(",")]
    if len(box) != 4:
        raise ValueError("FIRMS bounding box must be west,south,east,north")
    area = ",".join(str(value) for value in box)
    window = min(5, max(1, int(days or settings.firms_days)))
    product = source or settings.firms_source
    url = f"{settings.firms_base_url}/area/csv/{settings.firms_api_key}/{product}/{area}/{window}"
    if start_date:
        url += f"/{start_date}"
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url)
        response.raise_for_status()
    instrument = "MODIS" if "MODIS" in product.upper() else "VIIRS"
    return parse_firms_csv(response.text, source=instrument)


def _cli() -> None:
    parser = argparse.ArgumentParser(description="Fetch NASA FIRMS thermal anomalies")
    parser.add_argument("--bbox", default=None, help="west,south,east,north")
    parser.add_argument("--days", type=int, default=None)
    parser.add_argument("--source", default=None, help="FIRMS product, e.g. VIIRS_NOAA21_NRT")
    args = parser.parse_args()
    bbox = [float(part) for part in args.bbox.split(",")] if args.bbox else None
    spots = asyncio.run(fetch_firms_hotspots(bbox=bbox, days=args.days, source=args.source))
    print(json.dumps({"count": len(spots), "hotspots": spots[:50]}, indent=2))


if __name__ == "__main__":
    _cli()
