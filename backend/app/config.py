from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PyroLens Intelligence API"
    environment: str = "development"
    # Public deployments can expose dashboard read endpoints without exposing
    # ingestion, alerts, uploads, or any other analyst/admin operation.
    public_read_api: bool = False
    model_version: str = "xgboost-synthetic-v1"
    model_path: str = "artifacts/fire_classifier.joblib"
    api_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./pyrolens.db"
    redis_url: str = "redis://localhost:6379/0"
    firms_api_key: str | None = None
    firms_base_url: str = "https://firms.modaps.eosdis.nasa.gov/api"
    firms_source: str = "VIIRS_NOAA21_NRT"
    # Africa pilot fire belt (Zambia and southern DRC): west,south,east,north (WGS84).
    # This focused boundary provides a richer live FIRMS feed than a continent-wide query.
    firms_default_bbox: str = "22.0,-15.0,32.0,-8.0"
    firms_days: int = 1
    firms_refresh_seconds: int = 300
    use_celery: bool = False
    # Useful for small demo deployments without a separate Celery worker.
    auto_refresh_firms_on_start: bool = False
    weather_base_url: str = "https://api.open-meteo.com/v1/forecast"
    weather_api_key: str | None = None
    osm_overpass_url: str = "https://overpass-api.de/api/interpreter"
    osm_live_enabled: bool = True
    monitoring_area_name: str = "Malawi fire monitoring area"
    monitoring_latitude: float = -9.38
    monitoring_longitude: float = 33.01
    terrain_raster_path: str | None = None
    landcover_raster_path: str | None = None
    object_store_endpoint: str = "localhost:9000"
    object_store_access_key: str = "minio"
    object_store_secret_key: str = "minio123"
    object_store_bucket: str = "pyrolens-assets"
    object_store_secure: bool = False
    jwt_secret: str = "development-only-change-me"
    jwt_algorithm: str = "HS256"
    oidc_jwks_url: str | None = None
    oidc_issuer: str | None = None
    oidc_audience: str | None = None
    alert_provider: str = "log"
    twilio_account_sid: str | None = None
    twilio_auth_token: str | None = None
    twilio_from_number: str | None = None
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from_address: str | None = None
    cors_origins: str = "http://localhost:8080,http://localhost:5173"
    celery_task_always_eager: bool = False

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[1] / ".env",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
