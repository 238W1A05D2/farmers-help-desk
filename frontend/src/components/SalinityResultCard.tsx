import type { SoilSalinityResult } from '../types';
import { formatEcValue, formatDistance } from '../utils/salinity';

interface Props {
  result: SoilSalinityResult;
  warning?: string | null;
}

export default function SalinityResultCard({ result, warning }: Props) {
  const isHistorical = result.dataType === 'Historical';

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">

      {/* Header — blue for historical, purple for predicted */}
      <div className={`px-6 py-5 ${isHistorical ? 'bg-blue-700' : 'bg-purple-700'} text-white`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">🌿 Soil Salinity Result</h2>
            <p className="text-sm opacity-80 mt-0.5">
              {result.district} District, Andhra Pradesh
            </p>
          </div>
          <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full border ${
            isHistorical
              ? 'bg-blue-600 border-blue-400 text-white'
              : 'bg-purple-600 border-purple-400 text-white'
          }`}>
            {isHistorical ? '📊 Historical' : '🔮 Predicted'}
          </span>
        </div>
      </div>

      {/* Warning banner */}
      {warning && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <p className="text-sm text-amber-800">⚠️ {warning}</p>
        </div>
      )}

      <div className="px-6 py-5 space-y-5">

        {/* EC value — big and prominent */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 text-center">
          <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
            EC Value (Normalized)
          </div>
          <div className="text-5xl font-bold text-green-800 font-mono tracking-tight">
            {result.ecValue !== null ? formatEcValue(result.ecValue) : 'N/A'}
          </div>
          <div className="text-xs text-green-600 mt-2 bg-green-100 rounded-full px-3 py-1 inline-block">
            ⚠️ Units unconfirmed — 0–1 scale (may be normalized, not dS/m)
          </div>
        </div>

        {/* Year + data type row */}
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
            isHistorical
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-purple-50 text-purple-700 border-purple-200'
          }`}>
            {isHistorical ? '📊 Historical Data' : '🔮 Predicted Data'}
          </span>
          <span className="text-gray-500 text-sm font-medium">
            Year: <span className="text-gray-800 font-bold">{result.year}</span>
          </span>
          <span className="text-gray-500 text-sm font-medium">
            District: <span className="text-gray-800 font-bold">{result.district}</span>
          </span>
        </div>

        {/* Location details table */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {[
            {
              label: '📍 Your Location',
              value: `${result.requestedLatitude.toFixed(6)}, ${result.requestedLongitude.toFixed(6)}`,
              mono: true,
            },
            {
              label: '🎯 Nearest Dataset Point',
              value: `${result.matchedLatitude.toFixed(6)}, ${result.matchedLongitude.toFixed(6)}`,
              mono: true,
            },
            {
              label: '📏 Distance',
              value: formatDistance(result.distanceInMeters),
              mono: false,
              bold: true,
            },
          ].map((row, i) => (
            <div
              key={row.label}
              className={`flex justify-between items-center px-4 py-3 text-sm ${
                i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <span className="text-gray-500 font-medium">{row.label}</span>
              <span className={`text-gray-800 ${row.mono ? 'font-mono text-xs' : ''} ${row.bold ? 'font-bold' : ''}`}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Transparency note */}
        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 border border-gray-200 flex gap-2">
          <span className="flex-shrink-0">📌</span>
          <span>
            Your location is approximately{' '}
            <strong className="text-gray-700">{formatDistance(result.distanceInMeters)}</strong> from
            the nearest available dataset point. The EC value shown is for that point, not your exact coordinates.
          </span>
        </div>
      </div>
    </div>
  );
}
