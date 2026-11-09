import type { NearbyLocation } from '../types';
import { formatDistance, formatEcValue } from '../utils/salinity';

interface Props {
  nearbyLocations: NearbyLocation[];
  year: number;
  primaryEcValue: number | null;
}

export default function NearbyLocationsCard({ nearbyLocations, year, primaryEcValue }: Props) {
  if (!nearbyLocations || nearbyLocations.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-orange-600 px-6 py-4 text-white">
        <h3 className="text-lg font-bold">🟠 Nearby Locations — EC Values ({year})</h3>
        <p className="text-sm text-orange-100 mt-0.5">
          Closest {nearbyLocations.length} dataset points to your location — shown as orange markers on map
        </p>
      </div>

      <div className="p-5">
        {/* Primary point for comparison */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-lg">🎯</span>
            <div>
              <p className="text-sm font-semibold text-red-700">Your Nearest Point (Rank #1)</p>
              <p className="text-xs text-gray-500 mt-0.5">Primary result already shown above</p>
            </div>
          </div>
          <span className="font-mono font-bold text-red-700 text-sm">
            {primaryEcValue !== null ? formatEcValue(primaryEcValue) : 'N/A'}
          </span>
        </div>

        {/* Nearby locations table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-orange-50 border-b border-orange-100">
                <th className="px-3 py-2.5 text-left text-gray-600 font-semibold">Rank</th>
                <th className="px-3 py-2.5 text-left text-gray-600 font-semibold">Coordinates</th>
                <th className="px-3 py-2.5 text-left text-gray-600 font-semibold">Distance</th>
                <th className="px-3 py-2.5 text-left text-gray-600 font-semibold">EC Value ({year})</th>
                <th className="px-3 py-2.5 text-left text-gray-600 font-semibold">Comparison</th>
              </tr>
            </thead>
            <tbody>
              {nearbyLocations.map((loc) => {
                const diff =
                  loc.ecValue !== null && primaryEcValue !== null
                    ? loc.ecValue - primaryEcValue
                    : null;
                const diffLabel =
                  diff === null
                    ? '—'
                    : diff > 0.001
                    ? `▲ +${diff.toFixed(4)}`
                    : diff < -0.001
                    ? `▼ ${diff.toFixed(4)}`
                    : '≈ Similar';
                const diffColor =
                  diff === null
                    ? 'text-gray-400'
                    : diff > 0.001
                    ? 'text-red-600'
                    : diff < -0.001
                    ? 'text-green-600'
                    : 'text-gray-500';

                return (
                  <tr key={loc.systemIndex} className="border-t border-gray-100 hover:bg-orange-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">
                          {loc.rank}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-700">
                      {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {formatDistance(loc.distanceInMeters)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-semibold text-gray-800">
                      {loc.ecValue !== null ? formatEcValue(loc.ecValue) : 'N/A'}
                    </td>
                    <td className={`px-3 py-2.5 text-xs font-semibold ${diffColor}`}>
                      {diffLabel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          ⚠️ EC values are normalized (0–1 scale). Distances are straight-line from your entered coordinates.
          Comparison shows difference relative to your nearest dataset point.
        </p>
      </div>
    </div>
  );
}
