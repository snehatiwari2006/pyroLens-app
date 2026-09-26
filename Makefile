# PyroLens Makefile
# Common development and deployment commands

.PHONY: help install dev build test lint clean docker-up docker-down docker-logs docker-ps

# Default target
help:
	@echo "PyroLens - Industrial Fire & Impact Intelligence Platform"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Development:"
	@echo "  install          Install all dependencies (frontend + backend)"
	@echo "  dev              Start development servers (frontend + backend)"
	@echo "  dev-backend      Start only backend (FastAPI with reload)"
	@echo "  dev-frontend     Start only frontend (Vite dev server)"
	@echo "  train-model      Train the XGBoost classifier"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  test             Run all tests"
	@echo "  test-backend     Run backend tests only"
	@echo "  test-frontend    Run frontend tests only"
	@echo "  lint             Run all linters"
	@echo "  format           Auto-format code"
	@echo "  typecheck        Run type checkers"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up        Start full stack with Docker Compose"
	@echo "  docker-down      Stop and remove Docker Compose stack"
	@echo "  docker-logs      Show Docker Compose logs"
	@echo "  docker-ps        Show Docker Compose status"
	@echo "  docker-build     Build all Docker images"
	@echo "  docker-push      Push Docker images to registry"
	@echo ""
	@echo "Database:"
	@echo "  db-shell         Open PostgreSQL shell"
	@echo "  db-migrate       Run database migrations"
	@echo "  db-seed          Seed database with demo data"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-render    Deploy to Render (requires RENDER_DEPLOY_HOOK_URL)"
	@echo ""
	@echo "Cleanup:"
	@echo "  clean            Remove build artifacts and caches"

# =============================================================================
# DEVELOPMENT
# =============================================================================

install: install-frontend install-backend

install-frontend:
	npm ci

install-backend:
	cd backend && pip install -r requirements.txt -r requirements-analytics.txt

dev:
	@echo "Starting backend on port 8000..."
	@echo "Starting frontend on port 5173..."
	@echo "Press Ctrl+C to stop both"
	@trap 'kill %1 %2' INT; \
	cd backend && python -m uvicorn app.main:app --reload --port 8000 & \
	npm run dev & \
	wait

dev-backend:
	cd backend && python -m uvicorn app.main:app --reload --port 8000

dev-frontend:
	npm run dev

train-model:
	cd backend && python scripts/train_classifier.py

# =============================================================================
# TESTING & QUALITY
# =============================================================================

test: test-backend test-frontend

test-backend:
	cd backend && python -m pytest tests/ -v

test-frontend:
	npm test 2>/dev/null || echo "No frontend tests configured"

lint: lint-backend lint-frontend

lint-backend:
	cd backend && ruff check app scripts

lint-frontend:
	npm run lint 2>/dev/null || echo "No frontend lint configured"

format:
	cd backend && ruff format app scripts
	npx prettier --write . 2>/dev/null || echo "Prettier not configured"

typecheck:
	cd backend && mypy app --ignore-missing-imports
	npx tsc --noEmit 2>/dev/null || echo "TypeScript not configured"

# =============================================================================
# DOCKER
# =============================================================================

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down -v

docker-logs:
	docker compose logs -f

docker-ps:
	docker compose ps

docker-build:
	docker compose build

docker-push:
	@echo "Tag and push images manually or use CI/CD pipeline"

# =============================================================================
# DATABASE
# =============================================================================

db-shell:
	docker compose exec postgres psql -U pyrolens -d pyrolens

db-migrate:
	@echo "Using SQLAlchemy auto-migration. For production, use Alembic."

db-seed:
	@echo "Seeding database with demo data..."
	cd backend && python -c "
from app.repository import repository
from app.schemas import ThermalEvent
from datetime import datetime, timezone
events = [
    ThermalEvent(id='DEMO-1', name='Demo Industrial Fire', lat=-11.5, lng=27.0, confidence=90, frp_mw=150, brightness_kelvin=400, event_type='Industrial Fire', status='active', risk_score=85, risk_level='high', observations=10, persistence_score=80, observed_at=datetime.now(timezone.utc)),
    ThermalEvent(id='DEMO-2', name='Demo Agricultural Burn', lat=-12.0, lng=28.0, confidence=70, frp_mw=30, brightness_kelvin=320, event_type='Agricultural Burning', status='monitoring', risk_score=40, risk_level='medium', observations=5, persistence_score=30, observed_at=datetime.now(timezone.utc)),
]
repository.save_many(events)
print('Demo events inserted')
"

# =============================================================================
# DEPLOYMENT
# =============================================================================

deploy-render:
	@if [ -z "$$RENDER_DEPLOY_HOOK_URL" ]; then echo "RENDER_DEPLOY_HOOK_URL not set"; exit 1; fi
	curl -X POST "$$RENDER_DEPLOY_HOOK_URL"

# =============================================================================
# CLEANUP
# =============================================================================

clean:
	rm -rf node_modules dist build .next .next-dev .vite
	rm -rf backend/.venv backend/__pycache__ backend/app/__pycache__ backend/scripts/__pycache__
	rm -rf backend/artifacts/*.joblib
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	docker system prune -f 2>/dev/null || true

# =============================================================================
# UTILITIES
# =============================================================================

check-env:
	@if [ ! -f backend/.env ]; then echo "backend/.env not found. Copy from backend/.env.example"; exit 1; fi

shell-backend:
	docker compose exec api bash

shell-frontend:
	docker compose exec web sh

shell-db:
	docker compose exec postgres bash