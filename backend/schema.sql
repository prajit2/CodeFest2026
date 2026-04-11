-- RockyAI Database Schema
-- Run: psql -U user -d rockyai -f schema.sql

CREATE TYPE resource_category AS ENUM (
    'food_bank', 'shelter', 'clinic', 'mental_health',
    'septa', 'support_group', 'campus_resource'
);

CREATE TABLE IF NOT EXISTS resources (
    id          VARCHAR PRIMARY KEY,
    name        VARCHAR NOT NULL,
    category    resource_category NOT NULL,
    address     VARCHAR,
    latitude    FLOAT NOT NULL,
    longitude   FLOAT NOT NULL,
    phone       VARCHAR,
    hours       VARCHAR,
    description TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id          VARCHAR PRIMARY KEY,
    title       VARCHAR NOT NULL,
    description TEXT,
    university  VARCHAR,
    location    VARCHAR,
    latitude    FLOAT,
    longitude   FLOAT,
    start_time  TIMESTAMP NOT NULL,
    end_time    TIMESTAMP,
    category    VARCHAR DEFAULT 'free_food',
    resource_id VARCHAR,
    source_url  VARCHAR,
    scraped_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS septa_stops (
    id          VARCHAR PRIMARY KEY,
    name        VARCHAR NOT NULL,
    latitude    FLOAT NOT NULL,
    longitude   FLOAT NOT NULL,
    stop_type   VARCHAR,
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crime_cells (
    id              SERIAL PRIMARY KEY,
    latitude        FLOAT NOT NULL,
    longitude       FLOAT NOT NULL,
    weight          FLOAT NOT NULL,
    incident_count  INTEGER DEFAULT 0,
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_location ON resources(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_events_university ON events(university);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_crime_location ON crime_cells(latitude, longitude);
