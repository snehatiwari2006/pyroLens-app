FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
COPY requirements-analytics.txt .
RUN pip install --no-cache-dir -r requirements.txt -r requirements-analytics.txt
COPY app ./app
COPY scripts ./scripts
RUN python scripts/train_classifier.py

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
