import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { OverallEcTrendPoint } from '../types';

interface Props {
  trend: OverallEcTrendPoint[];
  district: string;
}

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) => {
  if (active && payload && payload.length) {
    const year = label ?? 0;
    const avg = payload.find((p) => p.name === 'avgEc');
    const min = payload.find((p) => p.name === 'minEc');
    const max = payload.find((p) => p.name === 'maxEc');
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow text-sm min-w-[175px]">
        <p className="font-bold text-gray-700 mb-1.5">
          {year}{' '}
          <span className={`text-xs font-normal ${year <= 2025 ? 'text-blue-500' : 'text-purple-500'}`}>
            ({year <= 2025 ? 'Historical' : 'Predicted'})
          </span>
        </p>
        {avg && <p className="text-green-700">Avg: <span className="font-mono font-semibold">{avg.value.toFixed(5)}</span></p>}
        {min && <p className="text-blue-600 text-xs">Min: <span className="font-mono">{min.value.toFixed(5)}</span></p>}
        {max && <p className="text-red-500 text-xs">Max: <span className="font-mono">{max.value.toFixed(5)}</span></p>}
      </div>
    );
  }
  return null;
};

export default function OverallEcTrendChart({ trend, district }: Props) {
  if (!trend || trend.length === 0) return null;

  // Derive dynamic year range from actual trend data
  const years = trend.map((p) => p.year);
  const firstYear = years[0];
  const lastYear  = years[years.length - 1];
  const midYear   = years[Math.floor(years.length / 2)];

  // Boundary between historical and predicted
  const histPoints = trend.filter((p) => p.dataType === 'Historical');
  const boundaryYear = histPoints.length > 0
    ? histPoints[histPoints.length - 1].year
    : 2025;

  const allAvg = trend.map((p) => p.avgEc);
  const minY   = Math.min(...trend.map((p) => p.minEc));
  const maxY   = Math.max(...trend.map((p) => p.maxEc));
  const padding = (maxY - minY) * 0.1 || 0.02;

  const totalChange = allAvg.length > 1 && allAvg[0] > 0
    ? ((allAvg[allAvg.length - 1] - allAvg[0]) / allAvg[0] * 100).toFixed(1)
    : null;

  const chartData = trend.map((pt) => ({
    year: pt.year,
    avgEc: parseFloat(pt.avgEc.toFixed(6)),
    minEc: parseFloat(pt.minEc.toFixed(6)),
    maxEc: parseFloat(pt.maxEc.toFixed(6)),
  }));

  // Summary stat cards — first/mid/last year dynamically
  const statYears = [firstYear, midYear, lastYear].filter(
    (y, i, a) => a.indexOf(y) === i // deduplicate
  );

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-teal-700 px-6 py-4 text-white">
        <h3 className="text-lg font-bold">🌍 District-Wide EC Trend — {district}</h3>
        <p className="text-sm text-teal-200 mt-0.5">
          Average EC across all dataset locations ({firstYear}–{lastYear})
        </p>
      </div>

      {/* Dynamic summary stats */}
      <div className={`grid grid-cols-${statYears.length} gap-0 border-b border-gray-100`}>
        {statYears.map((yr, i) => {
          const pt = trend.find((t) => t.year === yr);
          const colors = ['text-blue-700', 'text-green-700', 'text-purple-700'];
          return (
            <div key={yr} className="px-4 py-3 text-center border-r border-gray-100 last:border-r-0">
              <div className={`text-xl font-bold font-mono ${colors[i] ?? 'text-gray-700'}`}>
                {pt ? pt.avgEc.toFixed(4) : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Avg EC ({yr})</div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-5">
        {totalChange && (
          <div className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full mb-4 border ${
            parseFloat(totalChange) > 0
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-green-50 text-green-700 border-green-200'
          }`}>
            {parseFloat(totalChange) > 0 ? '📈' : '📉'}
            Overall change {firstYear}→{lastYear}:{' '}
            {parseFloat(totalChange) > 0 ? '+' : ''}{totalChange}%
          </div>
        )}

        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="year" tick={{ fontSize: 11 }} tickLine={false}
              label={{ value: 'Year', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
            />
            <YAxis
              domain={[minY - padding, maxY + padding]}
              tick={{ fontSize: 11 }} tickLine={false}
              tickFormatter={(v: number) => v.toFixed(3)}
              label={{ value: 'EC Value', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) => {
                if (value === 'avgEc') return 'District Avg EC';
                if (value === 'minEc') return 'Min EC';
                if (value === 'maxEc') return 'Max EC';
                return value;
              }}
            />

            {/* Historical / predicted boundary */}
            <ReferenceLine
              x={boundaryYear}
              stroke="#9ca3af"
              strokeDasharray="4 4"
              label={{ value: '← Hist | Pred →', position: 'top', fontSize: 9, fill: '#6b7280' }}
            />

            {/* Shaded min–max band */}
            <Area type="monotone" dataKey="maxEc" stroke="none" fill="#d1fae5" fillOpacity={0.5} name="maxEc" legendType="none" />
            <Area type="monotone" dataKey="minEc" stroke="none" fill="#ffffff" fillOpacity={1}   name="minEc" legendType="none" />

            {/* Min / max boundary lines */}
            <Line type="monotone" dataKey="minEc" stroke="#93c5fd" strokeWidth={1} dot={false} strokeDasharray="3 3" name="minEc" />
            <Line type="monotone" dataKey="maxEc" stroke="#fca5a5" strokeWidth={1} dot={false} strokeDasharray="3 3" name="maxEc" />

            {/* Average — main line */}
            <Line
              type="monotone" dataKey="avgEc" name="avgEc"
              stroke="#059669" strokeWidth={3}
              dot={{ r: 4, fill: '#059669' }} activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        <p className="text-xs text-gray-400 text-center mt-2">
          Shaded band = min–max range. Green line = district average.
          EC units unconfirmed (0–1 normalized scale).
        </p>
      </div>
    </div>
  );
}
