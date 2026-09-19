"""Celery tasks for scheduled ingestion and non-blocking intelligence work."""
import asyncio

from celery import Celery

from .config import get_settings
from .providers import FirmsNotConfiguredError, firms_provider
from .repository import repository

settings = get_settings()
celery_app = Celery("pyrolens", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    beat_schedule={"refresh-firms-feed": {"task": "pyrolens.ingest_firms", "schedule": settings.firms_refresh_seconds}},
)


@celery_app.task(name="pyrolens.ingest_firms")
def ingest_firms() -> dict:
    """Fetch FIRMS events through the provider adapter and persist new records."""
    try:
        events = asyncio.run(firms_provider.fetch({"source": "firms"}))
        # Repository-level de-duplication prevents repeat scheduled runs creating
        # duplicate incidents when a provider overlaps its observation window.
        written = repository.save_many(events)
        repository.record_ingestion("firms", len(events), written)
        return {"records_seen": len(events), "records_written": written}
    except FirmsNotConfiguredError as exc:
        repository.record_ingestion("firms", 0, 0, status="failed", error=str(exc))
        raise
