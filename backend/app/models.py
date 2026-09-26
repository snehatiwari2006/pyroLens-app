from datetime import datetime
from uuid import uuid4
import uuid as uuid_module
from sqlalchemy import DateTime, Enum, Float, Integer, JSON, String, Text, UUID
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(180))
    location: Mapped[str] = mapped_column(String(180))
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    type: Mapped[str] = mapped_column(String(80))
    confidence: Mapped[int] = mapped_column(Integer)
    risk: Mapped[str] = mapped_column(String(20))
    risk_score: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(40), default="Active")
    detection_time: Mapped[str] = mapped_column(String(80))
    satellite: Mapped[str] = mapped_column(String(100))
    frp: Mapped[str] = mapped_column(String(40))
    brightness: Mapped[str] = mapped_column(String(40))
    persistence: Mapped[str] = mapped_column(String(40))
    persistence_score: Mapped[int] = mapped_column(Integer)
    impact_direction: Mapped[str] = mapped_column(String(40))
    impact_zone: Mapped[str] = mapped_column(String(40))
    impact_confidence: Mapped[int] = mapped_column(Integer)
    exposure: Mapped[dict] = mapped_column(JSON, default=dict)
    environmental: Mapped[dict] = mapped_column(JSON, default=dict)
    raw_payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class IngestionRun(Base):
    __tablename__ = "ingestion_runs"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid_module.uuid4)
    source: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(Enum("completed", "failed", "queued", name="ingestion_status", create_type=False), default="queued")
    records_seen: Mapped[int] = mapped_column(Integer, default=0)
    records_accepted: Mapped[int] = mapped_column(Integer, default=0)
    records_rejected: Mapped[int] = mapped_column(Integer, default=0)
    error: Mapped[str] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
