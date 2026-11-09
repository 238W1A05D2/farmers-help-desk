interface Props {
  year: number | null;
  onYearChange: (year: number) => void;
  historicalYears?: number[];
  predictedYears?: number[];
}

const DEFAULT_HISTORICAL = [2019,2020,2021,2022,2023,2024,2025];
const DEFAULT_PREDICTED  = [2026,2027,2028,2029,2030];

export default function YearSelector({
  year, onYearChange,
  historicalYears = DEFAULT_HISTORICAL,
  predictedYears  = DEFAULT_PREDICTED,
}: Props) {
  const isHistorical = year !== null && historicalYears.includes(year);
  const isPredicted  = year !== null && predictedYears.includes(year);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="year-select" className="block text-sm font-semibold text-gray-700 mb-1">
          Select Year
        </label>
        <select
          id="year-select" value={year ?? ''}
          onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Select a year</option>
          <optgroup label={`Historical Data (${historicalYears[0]}–${historicalYears[historicalYears.length-1]})`}>
            {historicalYears.map((y) => (
              <option key={y} value={y}>{y} — Historical</option>
            ))}
          </optgroup>
          <optgroup label={`Predicted Data (${predictedYears[0]}–${predictedYears[predictedYears.length-1]})`}>
            {predictedYears.map((y) => (
              <option key={y} value={y}>{y} — Predicted</option>
            ))}
          </optgroup>
        </select>
      </div>

      {year && (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          isHistorical ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : isPredicted ? 'bg-purple-100 text-purple-700 border border-purple-200' : ''
        }`}>
          {isHistorical && <><span>📊</span><span>Historical Year — measured/observed data</span></>}
          {isPredicted  && <><span>🔮</span><span>Predicted Year — machine learning forecast</span></>}
        </div>
      )}

      <div className="flex gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
          Historical: {historicalYears[0]}–{historicalYears[historicalYears.length-1]}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-purple-400 inline-block" />
          Predicted: {predictedYears[0]}–{predictedYears[predictedYears.length-1]}
        </span>
      </div>
    </div>
  );
}
