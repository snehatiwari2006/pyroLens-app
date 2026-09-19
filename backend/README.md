# PyroLens Intelligence API

FastAPI backend for the PyroLens workflow:

`FIRMS / OSM / weather -> ingestion and validation -> event repository -> classification / spread / risk / impact -> API and worker jobs`

## Local development

From `pyroLens-app` (recommended on Windows):

```powershell
python -m venv backend\.venv
.\backend\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

The default repository uses SQLite and deterministic seed data, so the API can run without credentials or infrastructure. Set `DATABASE_URL`, `REDIS_URL`, object-storage settings, and provider keys in `.env` when connecting PostGIS, Redis/Celery, MinIO, NASA FIRMS, weather, and Overpass.

`requirements.txt` is the portable API runtime. The model and GIS libraries
are kept in `requirements-analytics.txt`; Docker installs both with Python
3.12. For local XGBoost/SHAP/Rasterio development, use Python 3.12 or 3.13:

```powershell
pip install -r requirements.txt -r requirements-analytics.txt
python scripts/train_classifier.py
```

If you have a Docker environment file and genuinely need to rename it, use
PowerShell's named arguments; do not supply a second path as the new name:

```powershell
Rename-Item -Path backend\.env -NewName .env.docker
```

This is not necessary for the local command above: it uses its SQLite default
when run from the repository root, while Docker Compose passes `backend/.env`
to its services.

## Full infrastructure

From `pyroLens-app`:

```powershell
Copy-Item backend/.env.example backend/.env
docker compose up --build
```

This starts FastAPI, a Celery worker and scheduler, PostGIS, Redis, MinIO, and the frontend. The SQLAlchemy repository persists validated events; Celery refreshes FIRMS every five minutes. `POST /api/v1/assets` writes imagery, rasters, generated maps, or model artifacts to MinIO.

## Live integrations and production configuration

- **NASA FIRMS:** request a free `MAP_KEY` at the [FIRMS key page](https://firms.modaps.eosdis.nasa.gov/api/map_key), then set `FIRMS_API_KEY`. `FIRMS_DEFAULT_BBOX` is `west,south,east,north`; keep it limited to the area you monitor. The worker queries the configured VIIRS source every five minutes.
- **Weather:** the default Open-Meteo adapter fetches current wind, temperature, and humidity by event coordinates without a key. Set `WEATHER_BASE_URL` to use a compatible approved provider.
- **OSM:** the Overpass adapter estimates nearby buildings, roads, industrial land use, hospitals, and fire stations within 3 km. Set `OSM_LIVE_ENABLED=false` only for an offline demo.
- **Model:** the image build creates an XGBoost baseline artifact and returns SHAP feature contributions. It uses synthetic training data and must be retrained on governed labelled data before operational use.
- **Terrain:** mount GeoTIFF inputs and set `TERRAIN_RASTER_PATH` / `LANDCOVER_RASTER_PATH`. The impact endpoint then samples Rasterio values and returns a GeoPandas-generated wind-oriented GeoJSON impact zone.
- **Alerts:** `POST /api/v1/events/{event_id}/alerts` supports `dashboard`, `sms`, and `email`. Configure Twilio and/or SMTP values from `.env.example`; do not send to real recipients until the approval workflow is established.
- **Authentication:** in production, configure `OIDC_JWKS_URL`, `OIDC_ISSUER`, and `OIDC_AUDIENCE`. The API then validates external RS256 OIDC tokens and maps `role` or `roles` claims to `viewer`, `analyst`, or `admin`.
