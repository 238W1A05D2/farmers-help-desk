# Smart Soil Salinity Monitoring

**Spatiotemporal Prediction and Mapping of Soil Salinity Using Remote Sensing and Machine Learning**

Multi-district soil EC monitoring for farmers in Andhra Pradesh — Bapatla and Godavari.

---

## Districts Covered

| District | Years | Historical | Predicted | Coordinate Coverage |
|----------|-------|-----------|-----------|---------------------|
| Bapatla  | 2015–2030 | 2019–2025 | 2026–2030 | Lat 15.80–15.90, Lon 80.40–80.50 |
| Godavari | 2010–2035 | 2010–2025 | 2026–2035 | Lat ~16.4–17.5, Lon ~81.5–82.5 |

---

## CSV File Placement

Place your CSV files **exactly** here with **exactly** these names:

```
project-root/
  data/
    EC_SpatialTemporal_Bapatla_Predicted_2026_2030.csv   ← Bapatla
    Godavari_SSI_Wide_Format_2010_2035.csv               ← Godavari
```

### Bapatla CSV format:
```
system:index, 0_EC_2015, 1_EC_2016, ..., 15_EC_2030, .geo
```
The `.geo` column contains GeoJSON: `{"type":"Point","coordinates":[lon, lat]}`

### Godavari CSV format:
```
point_id, latitude, longitude, SSI 2010, SSI 2011, ..., SSI 2035
```
Direct latitude/longitude columns — no GeoJSON.

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 16+ with PostGIS 3

### 2. Clone & configure
```powershell
# Copy env file
copy .env.example backend\.env
# Edit backend\.env and set your DB_PASSWORD
```

### 3. Install dependencies
```powershell
cd backend  ;  npm install
cd ..\frontend  ;  npm install
```

### 4. Setup database (run once)
```powershell
cd backend
npm run setup-db
```

### 5. Import CSV data

Place both CSV files in the `data\` folder, then:

```powershell
# Bapatla data
npm run import-csv

# Godavari data  
npm run import-godavari
```

Each import takes 2–5 minutes for large datasets.

### 6. Start the application

**Terminal 1 — Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

Open **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint | Parameters |
|--------|----------|------------|
| GET | `/api/health` | — |
| GET | `/api/districts` | — |
| GET | `/api/soil-salinity` | latitude, longitude, year, district |
| GET | `/api/location-history` | latitude, longitude, district, year? |
| GET | `/api/nearby-locations` | latitude, longitude, year, district, count? |
| GET | `/api/overall-ec-trend` | district |

### Example requests
```
GET /api/soil-salinity?latitude=15.8625&longitude=80.4965&year=2025&district=Bapatla
GET /api/nearby-locations?latitude=15.8625&longitude=80.4965&year=2025&district=Bapatla&count=5
GET /api/overall-ec-trend?district=Godavari
GET /api/location-history?latitude=16.95&longitude=82.00&district=Godavari&year=2030
```

---

## Data Notes

- EC values are in 0–1 range — may be **normalized**, not direct dS/m
- Results show the **nearest available dataset point**, not exact coordinates
- 2026–2035 values are **ML model predictions**
- Classification in dS/m is disabled until scale is confirmed

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS |
| Maps | Leaflet, React-Leaflet |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 16, PostGIS 3 |
| Spatial | PostGIS KNN nearest-neighbor |
