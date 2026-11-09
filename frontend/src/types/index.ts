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

export interface TrendDataPoint {
  year: number;
  ecValue: number | null;
  dataType: 'Historical' | 'Predicted';
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
  trend: TrendDataPoint[];
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
  bounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  center: [number, number];
  placeholder: { lat: string; lon: string };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  warning?: string | null;
}

export interface ApiError {
  error: string;
}

export interface SalinityClass {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  interpretation: string;
  minEc: number;
  maxEc: number;
}

export type AppStep = 'location' | 'year' | 'result';

export interface LocationFormState {
  state: string;
  district: string;
  latitude: string;
  longitude: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  database: {
    status: string;
    recordCount: number;
    districts: string[];
  };
}
