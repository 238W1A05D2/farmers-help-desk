import pool from '../db/pool';
import { getColumnForYear, getDataType, getDistrictYears, DISTRICT_CONFIG } from '../utils/yearColumnMap';

export interface SoilSalinityResult {
  requestedLatitude: number;
  requestedLongitude: number;
  matchedLatitude: number;
  matchedLongitude: number;
  distanceInMeters: number;
  district: string;
  year: number;
  ecValue: number | null;
  dataType: 'Historical' | 'Predicted';
  systemIndex: string;
}

export interface NearbyLocation {
  rank: number;
  latitude: number;
  longitude: number;
  distanceInMeters: number;
  ecValue: number | null;
  systemIndex: string;
}

export interface LocationHistoryResult {
  requestedLatitude: number;
  requestedLongitude: number;
  matchedLatitude: number;
  matchedLongitude: number;
  distanceInMeters: number;
  district: string;
  systemIndex: string;
  trend: { year: number; ecValue: number | null; dataType: 'Historical' | 'Predicted' }[];
  nearbyLocations: NearbyLocation[];
}

export interface OverallEcTrendPoint {
  year: number;
  avgEc: number;
  minEc: number;
  maxEc: number;
  dataType: 'Historical' | 'Predicted';
}

export interface DistrictInfo {
  name: string;
  state: string;
  country: string;
  available: boolean;
  yearRange: { start: number; end: number };
  historicalYears: number[];
  predictedYears: number[];
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number };
  center: [number, number];
  placeholder: { lat: string; lon: string };
}

const VALID_COLUMNS = new Set([
  'ec_2010','ec_2011','ec_2012','ec_2013','ec_2014',
  'ec_2015','ec_2016','ec_2017','ec_2018','ec_2019','ec_2020',
  'ec_2021','ec_2022','ec_2023','ec_2024','ec_2025','ec_2026',
  'ec_2027','ec_2028','ec_2029','ec_2030',
  'ec_2031','ec_2032','ec_2033','ec_2034','ec_2035',
]);

export const getNearestSoilSalinity = async (
  latitude: number,
  longitude: number,
  year: number,
  district: string
): Promise<SoilSalinityResult | null> => {
  const column = getColumnForYear(year);
  if (!column || !VALID_COLUMNS.has(column)) throw new Error(`Invalid year: ${year}`);

  const query = `
    SELECT system_index, latitude, longitude, district, ${column} AS ec_value,
      ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) AS distance_meters
    FROM soil_salinity
    WHERE district = $3
    ORDER BY geom <-> ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
    LIMIT 1
  `;
  const result = await pool.query(query, [latitude, longitude, district]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    requestedLatitude: latitude,
    requestedLongitude: longitude,
    matchedLatitude: parseFloat(row.latitude),
    matchedLongitude: parseFloat(row.longitude),
    distanceInMeters: parseFloat(row.distance_meters),
    district: row.district,
    year,
    ecValue: row.ec_value !== null ? parseFloat(row.ec_value) : null,
    dataType: getDataType(year, district),
    systemIndex: row.system_index,
  };
};

export const getNearbyLocations = async (
  latitude: number,
  longitude: number,
  year: number,
  district: string,
  count: number = 5
): Promise<NearbyLocation[]> => {
  const column = getColumnForYear(year);
  if (!column || !VALID_COLUMNS.has(column)) throw new Error(`Invalid year: ${year}`);

  const query = `
    SELECT system_index, latitude, longitude, ${column} AS ec_value,
      ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) AS distance_meters
    FROM soil_salinity
    WHERE district = $3
    ORDER BY geom <-> ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
    LIMIT $4 OFFSET 1
  `;
  const result = await pool.query(query, [latitude, longitude, district, count]);
  return result.rows.map((row, idx) => ({
    rank: idx + 2,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    distanceInMeters: parseFloat(row.distance_meters),
    ecValue: row.ec_value !== null ? parseFloat(row.ec_value) : null,
    systemIndex: row.system_index,
  }));
};

export const getLocationHistory = async (
  latitude: number,
  longitude: number,
  district: string,
  year?: number
): Promise<LocationHistoryResult | null> => {
  const { trendYears } = getDistrictYears(district);
  const trendColumns = trendYears.map((y) => `ec_${y}`).join(', ');

  const query = `
    SELECT system_index, latitude, longitude, district, ${trendColumns},
      ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) AS distance_meters
    FROM soil_salinity
    WHERE district = $3
    ORDER BY geom <-> ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
    LIMIT 1
  `;
  const result = await pool.query(query, [latitude, longitude, district]);
  if (result.rows.length === 0) return null;
  const row = result.rows[0];

  const trend = trendYears.map((y) => ({
    year: y,
    ecValue: row[`ec_${y}`] != null ? parseFloat(row[`ec_${y}`]) : null,
    dataType: getDataType(y, district),
  }));

  const nearbyYear = year && trendYears.includes(year) ? year : trendYears[Math.floor(trendYears.length / 2)];
  const nearbyLocations = await getNearbyLocations(latitude, longitude, nearbyYear, district, 5);

  return {
    requestedLatitude: latitude,
    requestedLongitude: longitude,
    matchedLatitude: parseFloat(row.latitude),
    matchedLongitude: parseFloat(row.longitude),
    distanceInMeters: parseFloat(row.distance_meters),
    district: row.district,
    systemIndex: row.system_index,
    trend,
    nearbyLocations,
  };
};

export const getOverallEcTrend = async (district: string): Promise<OverallEcTrendPoint[]> => {
  const { trendYears } = getDistrictYears(district);
  const yearStats = await Promise.all(
    trendYears.map(async (year) => {
      const col = `ec_${year}`;
      const query = `
        SELECT AVG(${col}) AS avg_ec, MIN(${col}) AS min_ec, MAX(${col}) AS max_ec
        FROM soil_salinity
        WHERE district = $1 AND ${col} IS NOT NULL
      `;
      const res = await pool.query(query, [district]);
      const r = res.rows[0];
      return {
        year,
        avgEc: r.avg_ec != null ? parseFloat(r.avg_ec) : 0,
        minEc: r.min_ec != null ? parseFloat(r.min_ec) : 0,
        maxEc: r.max_ec != null ? parseFloat(r.max_ec) : 0,
        dataType: getDataType(year, district),
      };
    })
  );
  return yearStats;
};

export const getDistricts = async (): Promise<DistrictInfo[]> => {
  return [
    {
      name: 'Bapatla',
      state: 'Andhra Pradesh',
      country: 'India',
      available: true,
      yearRange: { start: 2019, end: 2030 },
      historicalYears: DISTRICT_CONFIG.Bapatla.historicalYears,
      predictedYears: DISTRICT_CONFIG.Bapatla.predictedYears,
      bounds: DISTRICT_CONFIG.Bapatla.bounds,
      center: DISTRICT_CONFIG.Bapatla.center,
      placeholder: DISTRICT_CONFIG.Bapatla.placeholder,
    },
    {
      name: 'Godavari',
      state: 'Andhra Pradesh',
      country: 'India',
      available: true,
      yearRange: { start: 2010, end: 2035 },
      historicalYears: DISTRICT_CONFIG.Godavari.historicalYears,
      predictedYears: DISTRICT_CONFIG.Godavari.predictedYears,
      bounds: { minLat: 16.317897, maxLat: 17.997747, minLon: 80.879817, maxLon: 82.586616 },
      center: [17.157822, 81.733217] as [number, number],
      placeholder: DISTRICT_CONFIG.Godavari.placeholder,
    },
  ];
};

export const getDatabaseHealth = async () => {
  const countResult = await pool.query(
    'SELECT district, COUNT(*) AS count FROM soil_salinity GROUP BY district ORDER BY district'
  );
  return {
    status: 'ok',
    recordsByDistrict: countResult.rows.map((r: { district: string; count: string }) => ({
      district: r.district,
      count: parseInt(r.count),
    })),
  };
};
