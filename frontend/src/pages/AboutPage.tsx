export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80)' }}
        />
        <div className="absolute inset-0 bg-green-900/80" />
        <div className="relative z-10 h-full flex items-center px-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-white">About This Project</h1>
            <p className="text-green-300 text-sm mt-1">
              Spatiotemporal Prediction and Mapping of Soil Salinity | Andhra Pradesh
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">

        {/* Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Project Overview</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            This academic research project applies remote sensing data and machine learning to predict
            and map soil electrical conductivity (EC) — a key indicator of soil salinity — across
            Bapatla and Godavari districts in Andhra Pradesh. The application gives farmers and
            agricultural researchers an accessible tool to assess historical and predicted salinity at
            specific farm locations.
          </p>
        </div>

        {/* Districts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: 'Bapatla',
              emoji: '🌊',
              color: 'border-blue-200 bg-blue-50',
              headerColor: 'text-blue-800',
              items: [
                { label: 'Coverage', value: 'Lat 15.80–15.90 | Lon 80.40–80.50' },
                { label: 'Historical', value: '2019–2025' },
                { label: 'Predicted', value: '2026–2030' },
                { label: 'Full range', value: '2015–2030' },
              ],
            },
            {
              name: 'Godavari',
              emoji: '🏞️',
              color: 'border-green-200 bg-green-50',
              headerColor: 'text-green-800',
              items: [
                { label: 'Coverage', value: 'Lat 16.32–17.99 | Lon 80.88–82.59' },
                { label: 'Historical', value: '2010–2025' },
                { label: 'Predicted', value: '2026–2035' },
                { label: 'Full range', value: '2010–2035' },
              ],
            },
          ].map((d) => (
            <div key={d.name} className={`rounded-2xl border p-6 ${d.color}`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${d.headerColor}`}>
                <span>{d.emoji}</span> {d.name} District
              </h3>
              <div className="space-y-2">
                {d.items.map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {item.label}
                    </span>
                    <span className="text-gray-800 text-sm mt-0.5">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Caveats */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-amber-800 mb-3">⚠️ Important Caveats</h2>
          <ul className="text-amber-700 text-sm space-y-2.5">
            <li>
              <strong>EC Scale:</strong> Values in the dataset range from 0–1 and may be normalized —
              not direct dS/m measurements. dS/m classification will be activated once the scale is confirmed.
            </li>
            <li>
              <strong>Nearest Point:</strong> The system finds the nearest available dataset point to your
              coordinates. Results are for that point, not your exact location.
            </li>
            <li>
              <strong>Coverage:</strong> Datasets cover specific sub-areas of each district. Coordinates
              outside those areas will match to the nearest available point.
            </li>
            <li>
              <strong>Predictions (2026–2035):</strong> Machine learning forecasts — carry inherent
              uncertainty and should not replace professional soil testing.
            </li>
          </ul>
        </div>

        {/* Tech stack */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Technology Stack</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              { area: 'Frontend', tech: 'React 18 + TypeScript + Tailwind CSS' },
              { area: 'Maps', tech: 'Leaflet + React-Leaflet' },
              { area: 'Charts', tech: 'Recharts (trend + district-wide overview)' },
              { area: 'Backend', tech: 'Node.js + Express + TypeScript' },
              { area: 'Database', tech: 'PostgreSQL 16 + PostGIS 3' },
              { area: 'Spatial Query', tech: 'PostGIS KNN nearest-neighbor' },
            ].map((item) => (
              <div key={item.area} className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                <div>
                  <span className="font-semibold text-gray-700">{item.area}:</span>{' '}
                  <span className="text-gray-600">{item.tech}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <div className="bg-gray-800 text-gray-300 rounded-2xl p-6 text-sm font-mono">
          <h2 className="text-white font-bold text-base mb-4 font-sans">Architecture</h2>
          <pre className="text-xs leading-relaxed overflow-x-auto">{`Farmer
  │
  ▼
React Frontend  (port 5173)
  │  REST API / Axios
  ▼
Express Backend  (port 5000)
  │  district-aware queries
  ▼
PostgreSQL + PostGIS
  │  KNN ST_Distance
  ▼
Nearest EC value + 5 nearby points returned`}</pre>
        </div>

      </div>
    </main>
  );
}
