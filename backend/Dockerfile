# Production Dockerfile for backend
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for ML libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gdal-bin \
    libgdal-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt requirements-analytics.txt ./
RUN pip install --no-cache-dir --timeout=300 --retries=3 -r requirements.txt -r requirements-analytics.txt

# Copy source code
COPY app ./app
COPY scripts ./scripts

# Train classifier (gracefully handle missing optional dependencies)
RUN python scripts/train_classifier.py || echo "WARNING: Classifier training failed, using rule-based fallback"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]