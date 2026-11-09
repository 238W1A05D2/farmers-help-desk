import { classifySalinity, EC_SCALE_CONFIRMED } from '../utils/salinity';

interface Props {
  ecValue: number | null;
}

const CLASSIFICATION_TABLE = [
  { range: '0–2 dS/m', label: 'Non-saline', color: 'bg-green-500', interpretation: 'Suitable for most crops' },
  { range: '2–8 dS/m', label: 'Moderately saline', color: 'bg-yellow-400', interpretation: 'Salt-tolerant crops may grow' },
  { range: '>8 dS/m', label: 'Strongly to extremely saline', color: 'bg-red-500', interpretation: 'Most crops will not grow' },
];

export default function SalinityClassification({ ecValue }: Props) {
  const salinityClass = ecValue !== null ? classifySalinity(ecValue) : null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-green-700 px-6 py-4 text-white">
        <h3 className="text-lg font-bold">🧪 Salinity Classification</h3>
      </div>

      <div className="px-6 py-5 space-y-4">
        {/* Unconfirmed scale warning */}
        {!EC_SCALE_CONFIRMED && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
            <p className="font-semibold text-amber-800 text-sm">⚠️ EC Scale Not Yet Confirmed</p>
            <p className="text-amber-700 text-sm mt-1">
              The EC values in this dataset range from 0 to 1 and appear to be <strong>normalized values</strong>,
              not direct dS/m measurements. The standard salinity classification thresholds below apply to
              actual dS/m values. Classification will be activated once the original scaling parameters
              are verified.
            </p>
          </div>
        )}

        {/* Current EC class (shown even if unconfirmed) */}
        {ecValue !== null && salinityClass && (
          <div className={`${salinityClass.bgColor} ${salinityClass.borderColor} border rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-lg font-bold ${salinityClass.color}`}>{salinityClass.label}</span>
            </div>
            <p className={`text-sm ${salinityClass.color}`}>{salinityClass.interpretation}</p>
          </div>
        )}

        {/* Reference table */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Standard Classification Reference (dS/m scale):
          </p>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 text-left text-gray-600 font-semibold">EC Range</th>
                  <th className="px-3 py-2 text-left text-gray-600 font-semibold">Class</th>
                  <th className="px-3 py-2 text-left text-gray-600 font-semibold">Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {CLASSIFICATION_TABLE.map((row) => (
                  <tr key={row.label} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-gray-700 font-mono">{row.range}</td>
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${row.color} flex-shrink-0`} />
                        {row.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-600">{row.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
