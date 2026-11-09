import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { TrendDataPoint } from '../types';

interface Props {
  trend: TrendDataPoint[];
  selectedYear?: number | null;
  districtName?: string;
}

interface ChartPoint {
  year: number;
  historical: number | null;
  predicted: number | null;
}

const CustomTooltip = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number | null; color: string }>;
  label?: number;
}) => {
  if (active && payload && payload.length) {
    const val = payload.find((p) => p.value !== null);
    const year = label ?? 0;
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow text-sm min-w-[170px]">
        <p className="font-bold text-gray-700 mb-1">{year}</p>
        {val && (
          <p style={{ color: val.color }}>
            {val.name === 'historical' ? 'Historical' : 'Predicted'}:{' '}
            <span className="font-mono">{val.value?.toFixed(6)}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function ECTrendChart({ trend, selectedYear, districtName = '' }: Props) {
  if (!trend || trend.length === 0) return null;

  // Derive year ranges directly from the data — works for any district
  const historicalPoints = trend.filter((p) => p.dataType === 'Historical');
  const predictedPoints  = trend.filter((p) => p.dataType === 'Predicted');
  const firstHist = historicalPoints[0]?.year;
  const lastHist  = historicalPoints[historicalPoints.length - 1]?.year;
  const firstPred = predictedPoints[0]?.year;
  const lastPred  = predictedPoints[predictedPoints.length - 1]?.year;

  // The boundary year between historical and predicted
  const boundaryYear = lastHist ?? 2025;

  const chartData: ChartPoint[] = trend.map((p) => ({
    year: p.year,
    historical: p.dataType === 'Historical' ? p.ecValue : null,
    predicted:  p.dataType === 'Predicted'  ? p.ecValue : null,
  }));

  // Bridge: copy last historical value as first predicted so lines connect
  const histChartPoints = chartData.filter((d) => d.historical !== null);
  const lastHistPoint   = histChartPoints.length > 0 ? histChartPoints[histChartPoints.length - 1] : undefined;
  const firstPredIdx  = chartData.findIndex((d) => d.predicted !== null);
  if (lastHistPoint && firstPredIdx > 0) {
    chartData[firstPredIdx - 1] = {
      ...chartData[firstPredIdx - 1],
      predicted: lastHistPoint.historical,
    };
  }

  const allValues = trend.map((p) => p.ecValue).filter((v): v is number => v !== null);
  const minVal = allValues.length ? Math.min(...allValues) : 0;
  const maxVal = allValues.length ? Math.max(...allValues) : 1;
  const padding = (maxVal - minVal) * 0.1 || 0.05;

  const histLabel = firstHist && lastHist ? `${firstHist}–${lastHist}` : 'Historical';
  const predLabel = firstPred && lastPred  ? `${firstPred}–${lastPred}`  : 'Predicted';

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-green-700 px-6 py-4 text-white">
        <h3 className="text-lg font-bold">
          📈 EC Trend — {districtName || 'Your Location'}
        </h3>
        <p className="text-sm text-green-200 mt-0.5">
          Historical ({histLabel}) and Predicted ({predLabel}) at nearest dataset point
        </p>
      </div>

      <div className="px-4 py-5">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11 }}
              tickLine={false}
              label={{ value: 'Year', position: 'insideBottomRight', offset: -5, fontSize: 11 }}
            />
            <YAxis
              domain={[minVal - padding, maxVal + padding]}
              tick={{ fontSize: 11 }}
              tickLine={false}
              tickFormatter={(v: number) => v.toFixed(3)}
              label={{ value: 'EC Value', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) =>
                value === 'historical' ? `Historical (${histLabel})` : `Predicted (${predLabel})`
              }
            />

            {/* Boundary line between historical and predicted */}
            <ReferenceLine
              x={boundaryYear}
              stroke="#9ca3af"
              strokeDasharray="4 4"
              label={{ value: 'Predicted →', position: 'top', fontSize: 9, fill: '#6b7280' }}
            />

            {/* Selected year indicator */}
            {selectedYear && (
              <ReferenceLine
                x={selectedYear}
                stroke="#16a34a"
                strokeWidth={2}
                label={{ value: `${selectedYear}`, position: 'top', fontSize: 11, fill: '#15803d' }}
              />
            )}

            {/* Historical — blue solid */}
            <Line
              type="monotone" dataKey="historical" name="historical"
              stroke="#3b82f6" strokeWidth={2.5}
              dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }}
              connectNulls={false}
            />

            {/* Predicted — purple dashed */}
            <Line
              type="monotone" dataKey="predicted" name="predicted"
              stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="6 3"
              dot={{ r: 3, fill: '#8b5cf6' }} activeDot={{ r: 5 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <p className="text-xs text-gray-400 text-center mt-2">
          Values are from the nearest dataset point. EC units unconfirmed (may be normalized 0–1).
        </p>
      </div>
    </div>
  );
}
