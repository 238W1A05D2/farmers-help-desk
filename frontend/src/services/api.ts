import axios from 'axios';
import type {
  ApiResponse,
  SoilSalinityResult,
  LocationHistoryResult,
  NearbyLocation,
  OverallEcTrendPoint,
  DistrictInfo,
  HealthStatus,
} from '../types';

const BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export const getSoilSalinity = async (
  latitude: number,
  longitude: number,
  year: number,
  district: string
): Promise<ApiResponse<SoilSalinityResult> & { warning?: string | null }> => {
  const response = await apiClient.get<ApiResponse<SoilSalinityResult>>('/soil-salinity', {
    params: { latitude, longitude, year, district },
  });
  return response.data;
};

export const getLocationHistory = async (
  latitude: number,
  longitude: number,
  district: string,
  year?: number
): Promise<ApiResponse<LocationHistoryResult>> => {
  const response = await apiClient.get<ApiResponse<LocationHistoryResult>>('/location-history', {
    params: { latitude, longitude, district, year },
  });
  return response.data;
};

export const getNearbyLocations = async (
  latitude: number,
  longitude: number,
  year: number,
  district: string,
  count: number = 5
): Promise<ApiResponse<NearbyLocation[]>> => {
  const response = await apiClient.get<ApiResponse<NearbyLocation[]>>('/nearby-locations', {
    params: { latitude, longitude, year, district, count },
  });
  return response.data;
};

export const getOverallEcTrend = async (
  district: string
): Promise<ApiResponse<OverallEcTrendPoint[]>> => {
  const response = await apiClient.get<ApiResponse<OverallEcTrendPoint[]>>('/overall-ec-trend', {
    params: { district },
  });
  return response.data;
};

export const getDistricts = async (): Promise<{ districts: DistrictInfo[] }> => {
  const response = await apiClient.get<{ districts: DistrictInfo[] }>('/districts');
  return response.data;
};
export const checkHealth = async (): Promise<HealthStatus> => {
  const response = await apiClient.get<HealthStatus>('/health');
  return response.data;
};
