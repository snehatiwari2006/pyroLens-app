from datetime import datetime, timezone
from typing import Any, Literal
from pydantic import BaseModel, Field

RiskLevel = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]

class HealthResponse(BaseModel):
    status: str
    environment: str
    model_version: str

class ThermalEvent(BaseModel):
    id: str
    name: str
    latitude: float = Field(validation_alias="lat")
    longitude: float = Field(validation_alias="lng")
    source: str = "VIIRS"
    event_type: str = "Unknown"
    confidence: float = Field(ge=0, le=100)
    frp_mw: float = Field(ge=0)
    brightness_kelvin: float = Field(ge=0)
    observed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    observations: int = Field(default=1, ge=1)
    persistence_score: float = Field(default=0, ge=0, le=100)
    risk_score: float = Field(default=0, ge=0, le=100)
    risk_level: RiskLevel = "LOW"
    status: str = "Active"
    location: str = ""

class IngestionRequest(BaseModel):
    source: Literal["firms", "upload", "synthetic", "demo"] = "synthetic"
    start_date: str | None = None
    end_date: str | None = None
    bbox: list[float] | None = Field(default=None, min_length=4, max_length=4)
    days: int | None = Field(default=None, ge=1, le=5)
    records: list[dict[str, Any]] | None = None

class IngestionResponse(BaseModel):
    job_id: str
    source: str
    accepted_records: int
    rejected_records: int
    status: str
    validation: dict[str, int] = Field(default_factory=dict)

class ClassificationResponse(BaseModel):
    event_id: str
    classification: str
    confidence: float
    indicators: list[str]
    model_version: str

class ImpactResponse(BaseModel):
    event_id: str
    direction: str
    impact_zone_km2: float
    confidence: float
    exposed: dict[str, Any]
    assumptions: list[str]
    impact_zone_geojson: dict[str, Any] | None = None
    terrain_elevation_m: float | None = None
    landcover_code: float | None = None
    model: str = "heuristic"

class RiskResponse(BaseModel):
    event_id: str
    score: float
    level: RiskLevel
    factors: list[dict[str, Any]]
    recommended_actions: list[str]

class JobResponse(BaseModel):
    job_id: str
    status: str
    task: str
    created_at: datetime

class AlertRequest(BaseModel):
    channels: list[Literal["dashboard", "sms", "email"]] = ["dashboard"]
    recipients: list[str] = []
    message: str | None = None

class AlertResponse(BaseModel):
    event_id: str
    status: str
    deliveries: list[dict[str, str]]
