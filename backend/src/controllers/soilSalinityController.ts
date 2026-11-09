import { Request, Response } from 'express';
import {
  getNearestSoilSalinity,
  getLocationHistory,
  getNearbyLocations,
  getOverallEcTrend,
  getDistricts,
  getDatabaseHealth,
} from '../services/soilSalinityService';
import {
  validateLatitude,
  validateLongitude,
  validateDistrict,
  validateYear,
  isWithinDatasetBounds,
  getDatasetBounds,
} from '../utils/validation';

export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  try {
    const health = await getDatabaseHealth();
    res.json({ status: 'ok', timestamp: new Date().toISOString(), database: health });
  } catch {
    res.status(503).json({ status: 'error', message: 'Database unavailable.', timestamp: new Date().toISOString() });
  }
};

export const getDistrictsHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ districts: await getDistricts() });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve districts.' });
  }
};

export const getSoilSalinity = async (req: Request, res: Response): Promise<void> => {
  const { latitude, longitude, year, district } = req.query;
  const lat = parseFloat(latitude as string);
  const lon = parseFloat(longitude as string);
  const yr = parseInt(year as string, 10);
  const dist = (district as string)?.trim();

  const latCheck = validateLatitude(lat);
  if (!latCheck.valid) { res.status(400).json({ error: latCheck.message }); return; }
  const lonCheck = validateLongitude(lon);
  if (!lonCheck.valid) { res.status(400).json({ error: lonCheck.message }); return; }
  const distCheck = validateDistrict(dist);
  if (!distCheck.valid) { res.status(400).json({ error: distCheck.message }); return; }
  const yearCheck = validateYear(yr, dist);
  if (!yearCheck.valid) { res.status(400).json({ error: yearCheck.message }); return; }

  const bounds = getDatasetBounds(dist);
  const withinBounds = isWithinDatasetBounds(lat, lon, dist);
  const boundsWarning = withinBounds ? null :
    `Your coordinates (${lat}, ${lon}) are outside the available ${dist} study area ` +
    `(lat: ${bounds.minLat}–${bounds.maxLat}, lon: ${bounds.minLon}–${bounds.maxLon}). ` +
    `Result is for the nearest available dataset point.`;

  try {
    const result = await getNearestSoilSalinity(lat, lon, yr, dist);
    if (!result) { res.status(404).json({ error: 'No data found for this location.' }); return; }
    res.json({ success: true, data: result, warning: boundsWarning });
  } catch (error) {
    console.error('getSoilSalinity error:', error);
    res.status(500).json({ error: 'Error retrieving soil salinity data.' });
  }
};

export const getLocationHistoryHandler = async (req: Request, res: Response): Promise<void> => {
  const { latitude, longitude, district, year } = req.query;
  const lat = parseFloat(latitude as string);
  const lon = parseFloat(longitude as string);
  const dist = (district as string)?.trim();
  const yr = year ? parseInt(year as string, 10) : undefined;

  const latCheck = validateLatitude(lat);
  if (!latCheck.valid) { res.status(400).json({ error: latCheck.message }); return; }
  const lonCheck = validateLongitude(lon);
  if (!lonCheck.valid) { res.status(400).json({ error: lonCheck.message }); return; }
  const distCheck = validateDistrict(dist);
  if (!distCheck.valid) { res.status(400).json({ error: distCheck.message }); return; }

  try {
    const result = await getLocationHistory(lat, lon, dist, yr);
    if (!result) { res.status(404).json({ error: 'No historical data found.' }); return; }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('getLocationHistory error:', error);
    res.status(500).json({ error: 'Error retrieving location history.' });
  }
};

export const getNearbyLocationsHandler = async (req: Request, res: Response): Promise<void> => {
  const { latitude, longitude, year, district, count } = req.query;
  const lat = parseFloat(latitude as string);
  const lon = parseFloat(longitude as string);
  const yr = parseInt(year as string, 10);
  const dist = (district as string)?.trim();
  const cnt = count ? Math.min(parseInt(count as string, 10), 10) : 5;

  const latCheck = validateLatitude(lat);
  if (!latCheck.valid) { res.status(400).json({ error: latCheck.message }); return; }
  const lonCheck = validateLongitude(lon);
  if (!lonCheck.valid) { res.status(400).json({ error: lonCheck.message }); return; }
  const distCheck = validateDistrict(dist);
  if (!distCheck.valid) { res.status(400).json({ error: distCheck.message }); return; }
  const yearCheck = validateYear(yr, dist);
  if (!yearCheck.valid) { res.status(400).json({ error: yearCheck.message }); return; }

  try {
    res.json({ success: true, data: await getNearbyLocations(lat, lon, yr, dist, cnt) });
  } catch (error) {
    console.error('getNearbyLocations error:', error);
    res.status(500).json({ error: 'Error retrieving nearby locations.' });
  }
};

export const getOverallEcTrendHandler = async (req: Request, res: Response): Promise<void> => {
  const dist = (req.query.district as string)?.trim();
  const distCheck = validateDistrict(dist);
  if (!distCheck.valid) { res.status(400).json({ error: distCheck.message }); return; }

  try {
    res.json({ success: true, data: await getOverallEcTrend(dist) });
  } catch (error) {
    console.error('getOverallEcTrend error:', error);
    res.status(500).json({ error: 'Error retrieving overall EC trend.' });
  }
};
