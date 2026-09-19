"""Validation and normalization used by uploads and provider adapters."""
from typing import Any

from pydantic import ValidationError

from .schemas import ThermalEvent


def validate_events(records: list[dict[str, Any]]) -> tuple[list[ThermalEvent], int]:
    """Return schema-valid thermal events and the number of rejected rows.

    Coordinate bounds and numeric safety are enforced here, before a record
    reaches storage or any decision model.
    """
    accepted: list[ThermalEvent] = []
    rejected = 0
    for record in records:
        try:
            event = ThermalEvent.model_validate(record)
            if not -90 <= event.latitude <= 90 or not -180 <= event.longitude <= 180:
                raise ValueError("coordinates outside WGS84 bounds")
            accepted.append(event)
        except (ValidationError, TypeError, ValueError):
            rejected += 1
    return accepted, rejected
