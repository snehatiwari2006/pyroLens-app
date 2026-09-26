-- PyroLens Database Schema
-- This script runs on PostgreSQL/PostGIS container startup

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE event_type AS ENUM (
    'Industrial Fire',
    'Agricultural Burning',
    'Persistent Thermal Source',
    'Possible False Positive'
);

CREATE TYPE event_status AS ENUM (
    'active',
    'monitoring',
    'contained',
    'extinguished',
    'false_positive'
);

CREATE TYPE ingestion_status AS ENUM (
    'completed',
    'failed',
    'queued'
);

CREATE TYPE alert_channel AS ENUM (
    'dashboard',
    'sms',
    'email'
);

CREATE TYPE alert_status AS ENUM (
    'sent',
    'failed',
    'recorded'
);

-- Thermal events table
CREATE TABLE IF NOT EXISTS thermal_events (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geometry GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
    confidence SMALLINT NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    frp_mw DOUBLE PRECISION NOT NULL DEFAULT 0,
    brightness_kelvin DOUBLE PRECISION NOT NULL DEFAULT 0,
    event_type event_type NOT NULL DEFAULT 'Possible False Positive',
    status event_status NOT NULL DEFAULT 'active',
    risk_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    risk_level VARCHAR(32) NOT NULL DEFAULT 'low',
    observations INTEGER NOT NULL DEFAULT 1,
    persistence_score DOUBLE PRECISION NOT NULL DEFAULT 0,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source VARCHAR(64) NOT NULL DEFAULT 'unknown',
    raw_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for thermal_events
CREATE INDEX IF NOT EXISTS idx_thermal_events_geometry ON thermal_events USING GIST (geometry);
CREATE INDEX IF NOT EXISTS idx_thermal_events_source ON thermal_events (source);
CREATE INDEX IF NOT EXISTS idx_thermal_events_status ON thermal_events (status);
CREATE INDEX IF NOT EXISTS idx_thermal_events_event_type ON thermal_events (event_type);
CREATE INDEX IF NOT EXISTS idx_thermal_events_observed_at ON thermal_events (observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_thermal_events_risk_score ON thermal_events (risk_score DESC);

-- Ingestion runs table
CREATE TABLE IF NOT EXISTS ingestion_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(64) NOT NULL,
    records_seen INTEGER NOT NULL DEFAULT 0,
    records_accepted INTEGER NOT NULL DEFAULT 0,
    records_rejected INTEGER NOT NULL DEFAULT 0,
    status ingestion_status NOT NULL DEFAULT 'queued',
    error TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ingestion_runs_source ON ingestion_runs (source);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_started_at ON ingestion_runs (started_at DESC);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(64) NOT NULL REFERENCES thermal_events(id) ON DELETE CASCADE,
    channel alert_channel NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status alert_status NOT NULL DEFAULT 'recorded',
    error TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_event_id ON alerts (event_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts (created_at DESC);

-- Jobs table (for async task tracking)
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id VARCHAR(64) UNIQUE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'queued',
    task VARCHAR(128) NOT NULL,
    result JSONB,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_jobs_job_id ON jobs (job_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for thermal_events updated_at
DROP TRIGGER IF EXISTS update_thermal_events_updated_at ON thermal_events;
CREATE TRIGGER update_thermal_events_updated_at
    BEFORE UPDATE ON thermal_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for production)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pyrolens;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pyrolens;