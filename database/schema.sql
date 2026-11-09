-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing table and recreate with all years for both districts
DROP TABLE IF EXISTS soil_salinity CASCADE;

CREATE TABLE soil_salinity (
    id SERIAL PRIMARY KEY,
    system_index VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOGRAPHY(Point, 4326),
    district VARCHAR(100) NOT NULL,

    -- Bapatla years: 2015–2030
    ec_2015 DOUBLE PRECISION,
    ec_2016 DOUBLE PRECISION,
    ec_2017 DOUBLE PRECISION,
    ec_2018 DOUBLE PRECISION,
    ec_2019 DOUBLE PRECISION,
    ec_2020 DOUBLE PRECISION,
    ec_2021 DOUBLE PRECISION,
    ec_2022 DOUBLE PRECISION,
    ec_2023 DOUBLE PRECISION,
    ec_2024 DOUBLE PRECISION,
    ec_2025 DOUBLE PRECISION,
    ec_2026 DOUBLE PRECISION,
    ec_2027 DOUBLE PRECISION,
    ec_2028 DOUBLE PRECISION,
    ec_2029 DOUBLE PRECISION,
    ec_2030 DOUBLE PRECISION,

    -- Godavari extra years: 2010–2014 (historical) and 2031–2035 (predicted)
    ec_2010 DOUBLE PRECISION,
    ec_2011 DOUBLE PRECISION,
    ec_2012 DOUBLE PRECISION,
    ec_2013 DOUBLE PRECISION,
    ec_2014 DOUBLE PRECISION,
    ec_2031 DOUBLE PRECISION,
    ec_2032 DOUBLE PRECISION,
    ec_2033 DOUBLE PRECISION,
    ec_2034 DOUBLE PRECISION,
    ec_2035 DOUBLE PRECISION,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Spatial index for KNN queries
CREATE INDEX IF NOT EXISTS idx_soil_salinity_geom
    ON soil_salinity USING GIST (geom);

-- District index for filtering
CREATE INDEX IF NOT EXISTS idx_soil_salinity_district
    ON soil_salinity (district);

-- Unique index per district+system_index combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_soil_salinity_district_sysindex
    ON soil_salinity (district, system_index);

-- Stats view
CREATE OR REPLACE VIEW soil_salinity_stats AS
SELECT
    district,
    COUNT(*) AS total_records,
    MIN(latitude) AS min_lat,
    MAX(latitude) AS max_lat,
    MIN(longitude) AS min_lon,
    MAX(longitude) AS max_lon
FROM soil_salinity
GROUP BY district;
