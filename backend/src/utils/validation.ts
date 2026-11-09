import { DISTRICT_CONFIG, YEAR_COLUMN_MAP } from './yearColumnMap';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const SUPPORTED_DISTRICTS = ['Bapatla', 'Godavari'];

export const validateLatitude = (lat: number): ValidationResult => {
  if (isNaN(lat)) return { valid: false, message: 'Latitude must be a valid number.' };
  if (lat < -90 || lat > 90) return { valid: false, message: 'Latitude must be between -90 and 90.' };
  return { valid: true };
};

export const validateLongitude = (lon: number): ValidationResult => {
  if (isNaN(lon)) return { valid: false, message: 'Longitude must be a valid number.' };
  if (lon < -180 || lon > 180) return { valid: false, message: 'Longitude must be between -180 and 180.' };
  return { valid: true };
};

export const isWithinDatasetBounds = (lat: number, lon: number, district: string): boolean => {
  const config = DISTRICT_CONFIG[district];
  if (!config) return false;
  const b = config.bounds;
  return lat >= b.minLat && lat <= b.maxLat && lon >= b.minLon && lon <= b.maxLon;
};

export const getDatasetBounds = (district: string) => {
  return DISTRICT_CONFIG[district]?.bounds ?? DISTRICT_CONFIG['Bapatla'].bounds;
};

export const validateDistrict = (district: string): ValidationResult => {
  if (!SUPPORTED_DISTRICTS.includes(district)) {
    return {
      valid: false,
      message: `District "${district}" is not supported. Available: ${SUPPORTED_DISTRICTS.join(', ')}.`,
    };
  }
  return { valid: true };
};

export const validateYear = (year: number, district?: string): ValidationResult => {
  if (isNaN(year) || !YEAR_COLUMN_MAP[year]) {
    return { valid: false, message: `Year ${year} is not valid.` };
  }
  if (district) {
    const config = DISTRICT_CONFIG[district];
    if (config && !config.selectableYears.includes(year)) {
      return {
        valid: false,
        message: `Year ${year} is not available for ${district}. Valid: ${config.selectableYears.join(', ')}.`,
      };
    }
  }
  return { valid: true };
};
