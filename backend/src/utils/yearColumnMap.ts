/**
 * Safe year-to-column whitelist mapping.
 * Covers both Bapatla (2015–2030) and Godavari (2010–2035).
 * Prevents SQL injection — year param is never concatenated directly into SQL.
 */
export const YEAR_COLUMN_MAP: Record<number, string> = {
  2010: 'ec_2010',
  2011: 'ec_2011',
  2012: 'ec_2012',
  2013: 'ec_2013',
  2014: 'ec_2014',
  2015: 'ec_2015',
  2016: 'ec_2016',
  2017: 'ec_2017',
  2018: 'ec_2018',
  2019: 'ec_2019',
  2020: 'ec_2020',
  2021: 'ec_2021',
  2022: 'ec_2022',
  2023: 'ec_2023',
  2024: 'ec_2024',
  2025: 'ec_2025',
  2026: 'ec_2026',
  2027: 'ec_2027',
  2028: 'ec_2028',
  2029: 'ec_2029',
  2030: 'ec_2030',
  2031: 'ec_2031',
  2032: 'ec_2032',
  2033: 'ec_2033',
  2034: 'ec_2034',
  2035: 'ec_2035',
};

// Per-district config: selectable years, historical cutoff, predicted range
export const DISTRICT_CONFIG: Record<string, {
  selectableYears: number[];
  historicalYears: number[];
  predictedYears: number[];
  trendYears: number[];
  bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number };
  center: [number, number];
  placeholder: { lat: string; lon: string };
}> = {
  Bapatla: {
    selectableYears: [2019,2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030],
    historicalYears: [2019,2020,2021,2022,2023,2024,2025],
    predictedYears:  [2026,2027,2028,2029,2030],
    trendYears:      [2019,2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030],
    bounds: { minLat: 15.800063, maxLat: 15.900046, minLon: 80.400071, maxLon: 80.500054 },
    center: [15.850054, 80.450063],
    placeholder: { lat: '15.8625', lon: '80.4965' },
  },
  Godavari: {
    selectableYears: [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030,2031,2032,2033,2034,2035],
    historicalYears: [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025],
    predictedYears:  [2026,2027,2028,2029,2030,2031,2032,2033,2034,2035],
    trendYears:      [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030,2031,2032,2033,2034,2035],
    // Real bounds from actual imported data
    bounds: { minLat: 16.317897, maxLat: 17.997747, minLon: 80.879817, maxLon: 82.586616 },
    center: [17.157822, 81.733217] as [number, number],
    placeholder: { lat: '17.1978', lon: '82.2273' },
  },
};

export const getDataType = (year: number, district: string): 'Historical' | 'Predicted' => {
  const config = DISTRICT_CONFIG[district];
  if (!config) return year <= 2025 ? 'Historical' : 'Predicted';
  return config.historicalYears.includes(year) ? 'Historical' : 'Predicted';
};

export const isValidYear = (year: number): boolean => {
  return Object.keys(YEAR_COLUMN_MAP).includes(String(year));
};

export const getColumnForYear = (year: number): string | null => {
  return YEAR_COLUMN_MAP[year] || null;
};

export const getDistrictYears = (district: string) => {
  return DISTRICT_CONFIG[district] ?? DISTRICT_CONFIG['Bapatla'];
};
