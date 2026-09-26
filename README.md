# PyroLens — Industrial Fire & Impact Intelligence Platform

Full-stack Next.js SIH prototype for AI-assisted detection, classification, and
impact assessment of industrial fires and persistent thermal sources. It
implements the workflow from the project architecture: provider adapters
(NASA FIRMS / weather / OSM), validation boundary, FastAPI intelligence
services, PostgreSQL/PostGIS, Redis/Celery workers, MinIO object storage,
and an operational React mapping dashboard.

The system starts with deterministic demo data when external provider keys
are not configured. That makes the whole workflow demonstrable locally while
keeping every live-data integration at a replaceable provider boundary.

## Enable live NASA FIRMS data

1. Request a free NASA FIRMS MAP key at [FIRMS MAP key](https://firms.modaps.eosdis.nasa.gov/api/map_key).
2. In `backend/.env`, set `FIRMS_API_KEY` to the received key. Do not commit or share that key.
3. Set the monitored bounding box as `FIRMS_DEFAULT_BBOX=west,south,east,north`. The included default is the Central Africa pilot boundary (Zambia–southern DRC).
4. Restart the FastAPI server. The Satellite Data Centre will show **NASA FIRMS LIVE**; use its **Refresh NASA FIRMS** control to ingest current detections.

For the direct Windows/Uvicorn workflow, `backend/.env` uses SQLite and localhost
service addresses. Docker Compose overrides those three addresses for its internal
PostGIS, Redis, and MinIO service names, so the same FIRMS key works in both modes.

Docker additionally refreshes the FIRMS feed automatically using the configured
`FIRMS_REFRESH_SECONDS` interval. Local development performs a real fetch when
you use the refresh control, without requiring Redis or Celery.

## Run locally

Requires Node.js 18.17+.

```bash
npm install
# Start FastAPI on 8001 first, then run the web app.
npm run dev
```

Then open the URL Next.js prints (usually http://localhost:3000).

The development command uses a separate `.next-dev` cache so an interrupted
build cannot corrupt the production `.next` output. If an older server is
already open, stop it with `Ctrl+C` before starting this command.

For the current Central Africa local setup, start FastAPI on port 8001 before the web
server. Next.js proxies browser requests from `http://localhost:3000/api/*` to
that service, so the NASA FIRMS MAP key stays only in `backend/.env`:

```powershell
.\backend\.venv\Scripts\Activate.ps1
python -m uvicorn backend.app.main:app --port 8001
```

To build a production bundle:

```bash
npm run build
npm run preview
```

## Run the full stack

Requires Docker Desktop. The compose environment includes PostGIS, Redis,
MinIO, the FastAPI service, a Celery worker, and an Nginx-served frontend.

```powershell
Copy-Item backend/.env.example backend/.env
docker compose up --build
```

Open the dashboard at `http://localhost:8080`, the API documentation at
`http://localhost:8000/docs`, and the MinIO console at
`http://localhost:9001` (credentials: `minio` / `minio123`). Before a
non-demo deployment, copy `backend/.env.example` to `backend/.env` and set a
strong `JWT_SECRET`, a production database URL, and `FIRMS_API_KEY`.
Set `ENVIRONMENT=production` and use an external identity provider before a
real deployment; the built-in token generator is intentionally demo-only.

## Keep PyroLens running 24/7

`localhost` is a development address: it stops when its terminal, computer, or
network connection stops. NASA FIRMS remains available, but a local PyroLens
server cannot be reached while it is off. For continuous operation, deploy
`docker-compose.yml` to an always-on Linux VM or cloud container host. All
services use `restart: unless-stopped`; the Celery scheduler then refreshes the
configured Central Africa NASA FIRMS feed every `FIRMS_REFRESH_SECONDS` seconds.

Before public deployment, use a production database password, HTTPS reverse
proxy/domain, external object storage, a production identity provider, and a
secret manager for the FIRMS key and alert credentials. Do not expose
`backend/.env` or commit it to Git.

## Render demo deployment

The included `render.yaml` deploys a Node frontend, FastAPI service, and Render
Postgres database. In the Render dashboard, create a **Blueprint** from this
repository, then set `FIRMS_API_KEY` only in the `pyrolens-api` environment
variables. The free Render plan can sleep after idle time and its free Postgres
offer is temporary, so it is for demos—not continuous monitoring.

`PUBLIC_READ_API=true` is enabled by the Render Blueprint solely for dashboard
GET endpoints. Ingestion, alert dispatch, uploads, and other write operations
remain authenticated.

## API workflow

- `GET /health` verifies the service.
- `POST /api/v1/ingestions` queues/executes a source ingestion request.
- `GET /api/v1/events` returns validated thermal events and supports
  `status`, `event_type`, and `min_risk` filters.
- `GET /api/v1/events/{id}/classification`, `/risk`, `/impact`, `/weather`,
  and `/exposure` provide the decision-support pipeline outputs.
- `POST /api/v1/auth/token` issues a development JWT for the `viewer`,
  `analyst`, and `admin` roles. Development accepts an anonymous analyst so
  the demo dashboard works without a login screen; set a non-development
  environment to require bearer tokens issued by an external identity provider.

## Project structure

```
pyroLens-app/
├── backend/
│   ├── app/              # FastAPI application
│   │   ├── api/          # API routes (v1 endpoints)
│   │   ├── ml/           # ML models (classifier, spread predictor, explainability)
│   │   ├── services/     # Provider adapters (FIRMS, OSM, weather)
│   │   ├── main.py       # FastAPI app entry point
│   │   ├── config.py     # Pydantic settings
│   │   ├── database.py   # SQLAlchemy models & session
│   │   ├── repository.py # Data access layer
│   │   ├── processing.py # Classification, risk, impact pipelines
│   │   ├── workers.py    # Celery tasks
│   │   ├── alerts.py     # Alert dispatch
│   │   └── storage.py    # MinIO/S3 object storage
│   ├── scripts/          # Training & utility scripts
│   ├── tests/            # Pytest test suite
│   ├── initdb/           # Database initialization SQL
│   ├── artifacts/        # Generated model artifacts
│   ├── requirements.txt              # Core API dependencies
│   ├── requirements-analytics.txt    # ML/GIS dependencies
│   ├── .env.example                # Environment template (COPY THIS)
│   ├── .env.production.example     # Production template
│   ├── Dockerfile                  # Production backend image
│   ├── Dockerfile.dev              # Development backend image
│   └── README.md
├── src/                      # Frontend (React + Vite)
│   ├── components/           # Reusable UI components
│   ├── pages/                # Route pages
│   ├── services/             # API service wrappers
│   ├── context/              # React context providers
│   └── main.jsx              # App entry point
├── dist/                     # Production build output
├── nginx.conf                # Nginx config for production frontend
├── Dockerfile                # Legacy frontend build (deprecated)
├── Dockerfile.web            # Production frontend (nginx) image
├── Dockerfile.dev            # Development frontend image
├── docker-compose.yml        # Full stack orchestration
├── docker-compose.override.yml.example  # Local dev overrides
├── Makefile                  # Common development commands
├── package.json              # Frontend dependencies
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── .github/
│   ├── workflows/ci-cd.yml   # GitHub Actions CI/CD
│   └── dependabot.yml        # Automated dependency updates
├── .pre-commit-config.yaml   # Pre-commit hooks
├── .dockerignore             # Docker build context optimization
├── .gitignore                # Git ignore rules
└── README.md
```

## Development Workflow

### Quick Start (Docker)
```bash
# 1. Copy environment template
cp backend/.env.example backend/.env

# 2. Start full stack
docker compose up --build

# 3. Access services
# Dashboard:     http://localhost:8080
# API Docs:      http://localhost:8000/docs
# MinIO Console: http://localhost:4566 (minio/minio123)
```

### Local Development (Hot Reload)
```bash
# Terminal 1: Backend with auto-reload
cd backend && python -m venv .venv && .venv\Scripts\Activate.ps1
pip install -r requirements.txt -r requirements-analytics.txt
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend with Vite HMR
npm install
npm run dev

# Dashboard: http://localhost:5173 (proxies /api to localhost:8000)
```

### Using Makefile
```bash
make install        # Install all dependencies
make dev            # Start both dev servers
make test           # Run all tests
make lint           # Run linters
make docker-up      # Start Docker stack
make docker-down    # Stop Docker stack
make clean          # Clean build artifacts
```

## CI/CD Pipeline

- **GitHub Actions** (`.github/workflows/ci-cd.yml`): Lint → Test → Build → Deploy
- **Dependabot** (`.github/dependabot.yml`): Weekly dependency updates
- **Pre-commit** (`.pre-commit-config.yaml`): Code quality gates

## Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env.example` | **Required** - Copy to `.env` for Docker/local dev |
| `backend/.env.production.example` | Production deployment template |
| `docker-compose.override.yml.example` | Local dev overrides (copy to `docker-compose.override.yml`) |
| `nginx.conf` | Production frontend reverse proxy config |
| `render.yaml` | Render.com Blueprint deployment |

## Notes for judges / future integration

- The FastAPI provider adapters isolate NASA FIRMS, Overpass/OSM, weather,
  storage, and ML integrations. Replace an adapter implementation without
  changing the routes or UI contracts.
- The map (`src/components/FireMap.jsx`) uses `react-leaflet` with public
  OpenStreetMap tiles; swap the `TileLayer` URL for a GIS/satellite basemap
  when one is available.
- All "impact" and "exposure" language is intentionally phrased as an
  estimate ("potential", "potentially exposed") per the project brief —
  keep that phrasing if you extend these pages.
- The warning workflow (`WarningModal` + `AppContext.issueWarning`) is still
  a frontend simulation; no SMS/call/email is sent.
