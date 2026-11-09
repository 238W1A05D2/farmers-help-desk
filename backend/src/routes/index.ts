import { Router } from 'express';
import {
  healthCheck,
  getDistrictsHandler,
  getSoilSalinity,
  getLocationHistoryHandler,
  getNearbyLocationsHandler,
  getOverallEcTrendHandler,
} from '../controllers/soilSalinityController';

const router = Router();

// Health check
router.get('/health', healthCheck);

// Get available districts
router.get('/districts', getDistrictsHandler);

// Get soil salinity for a specific location and year
router.get('/soil-salinity', getSoilSalinity);

// Get EC trend (2019-2030) + nearby locations for nearest dataset point
router.get('/location-history', getLocationHistoryHandler);

// Get 4-5 nearby locations with their EC values
router.get('/nearby-locations', getNearbyLocationsHandler);

// Get overall district-wide average EC trend across all years
router.get('/overall-ec-trend', getOverallEcTrendHandler);

export default router;
