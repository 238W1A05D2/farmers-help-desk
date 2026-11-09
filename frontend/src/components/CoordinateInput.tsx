import { useState } from 'react';

interface DistrictBounds {
  minLat: number; maxLat: number; minLon: number; maxLon: number;
}

interface Props {
  latitude: string;
  longitude: string;
  onLatitudeChange: (val: string) => void;
  onLongitudeChange: (val: string) => void;
  onUseMyLocation: () => void;
  onFindLocation: () => void;
  isLocating: boolean;
  districtBounds?: DistrictBounds;
  districtName?: string;
}

export default function CoordinateInput({
  latitude, longitude,
  onLatitudeChange, onLongitudeChange,
  onUseMyLocation, onFindLocation,
  isLocating, districtBounds, districtName,
}: Props) {
  const [latError, setLatError] = useState('');
  const [lonError, setLonError] = useState('');

  const validateLat = (val: string) => {
    const num = parseFloat(val);
    if (val && (isNaN(num) || num < -90 || num > 90)) {
      setLatError('Latitude must be between -90 and 90');
    } else { setLatError(''); }
    onLatitudeChange(val);
  };

  const validateLon = (val: string) => {
    const num = parseFloat(val);
    if (val && (isNaN(num) || num < -180 || num > 180)) {
      setLonError('Longitude must be between -180 and 180');
    } else { setLonError(''); }
    onLongitudeChange(val);
  };

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const outsideBounds = districtBounds && latitude && longitude && !isNaN(lat) && !isNaN(lon) && (
    lat < districtBounds.minLat || lat > districtBounds.maxLat ||
    lon < districtBounds.minLon || lon > districtBounds.maxLon
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude-input" className="block text-sm font-semibold text-gray-700 mb-1">
            Latitude
          </label>
          <input
            id="latitude-input" type="number" step="any" value={latitude}
            onChange={(e) => validateLat(e.target.value)}
            placeholder={districtBounds ? `${((districtBounds.minLat + districtBounds.maxLat) / 2).toFixed(4)}` : 'e.g. 15.8625'}
            className={`w-full border rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${latError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
          />
          {latError && <p className="text-xs text-red-600 mt-1">{latError}</p>}
        </div>
        <div>
          <label htmlFor="longitude-input" className="block text-sm font-semibold text-gray-700 mb-1">
            Longitude
          </label>
          <input
            id="longitude-input" type="number" step="any" value={longitude}
            onChange={(e) => validateLon(e.target.value)}
            placeholder={districtBounds ? `${((districtBounds.minLon + districtBounds.maxLon) / 2).toFixed(4)}` : 'e.g. 80.4965'}
            className={`w-full border rounded-lg px-3 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${lonError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
          />
          {lonError && <p className="text-xs text-red-600 mt-1">{lonError}</p>}
        </div>
      </div>

      {outsideBounds && districtBounds && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-sm text-amber-800">
          <span className="font-semibold">⚠️ Outside {districtName} study area:</span>{' '}
          (lat: {districtBounds.minLat}–{districtBounds.maxLat}, lon: {districtBounds.minLon}–{districtBounds.maxLon}).
          The system will find the nearest available point.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onUseMyLocation} disabled={isLocating}
          className="flex-1 border border-green-600 text-green-700 rounded-lg px-4 py-2.5 font-medium hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isLocating
            ? <><span className="w-4 h-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />Getting location...</>
            : '📍 Use My Location'}
        </button>
        <button type="button" onClick={onFindLocation}
          disabled={!latitude || !longitude || !!latError || !!lonError}
          className="flex-1 bg-green-700 text-white rounded-lg px-4 py-2.5 font-medium hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Find Location on Map
        </button>
      </div>
    </div>
  );
}
