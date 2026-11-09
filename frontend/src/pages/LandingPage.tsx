import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '📍',
    title: 'Location-Based Assessment',
    description:
      'Enter your farm coordinates and instantly find the nearest soil EC data from datasets covering Bapatla and Godavari districts.',
  },
  {
    icon: '📅',
    title: 'Historical & Predicted Data',
    description:
      'Bapatla: 2019–2030. Godavari: 2010–2035. Historical observations and machine learning predictions clearly separated.',
  },
  {
    icon: '🗺️',
    title: 'Interactive Map with Nearby Areas',
    description:
      'See your farm, the nearest dataset point, and 5 surrounding locations on an interactive map — all with EC values.',
  },
  {
    icon: '📈',
    title: 'District-Wide EC Trend',
    description:
      'View the average EC across the entire district year by year — understand regional salinity trends beyond just your plot.',
  },
  {
    icon: '🌾',
    title: 'Multi-District Support',
    description:
      'Currently covers Bapatla (2015–2030) and Godavari (2010–2035). More districts can be added as datasets become available.',
  },
  {
    icon: '🔬',
    title: 'ML-Powered Predictions',
    description:
      'Future EC values predicted using remote sensing and machine learning models trained on satellite imagery.',
  },
];

const STEPS = [
  { step: '1', title: 'Select District', desc: 'Bapatla or Godavari' },
  { step: '2', title: 'Enter Location', desc: 'Type or detect your farm coordinates' },
  { step: '3', title: 'Select Year', desc: 'Historical or predicted year' },
  { step: '4', title: 'Get Result', desc: 'EC value, map, nearby areas, trend' },
];

const DISTRICTS = [
  {
    name: 'Bapatla',
    emoji: '🌊',
    years: '2015–2030',
    predicted: '2026–2030',
    img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',
  },
  {
    name: 'Godavari',
    emoji: '🏞️',
    years: '2010–2035',
    predicted: '2026–2035',
    img: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80',
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero with full-bleed farm background ── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1400&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-block bg-green-500/20 border border-green-400 text-green-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            🔬 Academic Research — Andhra Pradesh, India
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Smart Soil Salinity
            <br />
            <span className="text-green-400">Monitoring</span>
          </h1>

          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Spatiotemporal prediction and mapping of soil salinity using remote sensing and machine
            learning — helping farmers make informed decisions about their land.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/check"
              className="bg-green-600 hover:bg-green-500 text-white text-lg font-semibold px-10 py-4 rounded-xl transition-colors shadow-2xl"
            >
              🌱 Check Your Farm
            </Link>
            <Link
              to="/about"
              className="border-2 border-white/40 hover:border-white text-white text-lg font-semibold px-10 py-4 rounded-xl transition-colors backdrop-blur-sm"
            >
              Learn More
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '2 Districts', label: 'Covered' },
              { value: '100K+', label: 'Dataset Points' },
              { value: '2010–2035', label: 'Year Range' },
              { value: 'ML Model', label: 'Future Predictions' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4"
              >
                <div className="text-2xl font-bold text-green-400">{stat.value}</div>
                <div className="text-sm text-gray-300 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce text-sm">
          ↓ scroll
        </div>
      </section>

      {/* ── Districts section ── */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-3">Available Districts</h2>
          <p className="text-gray-400 text-center mb-10">
            Select a district to start your soil salinity assessment
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {DISTRICTS.map((d) => (
              <Link
                key={d.name}
                to="/check"
                className="group relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 hover:border-green-400 transition-all duration-300 hover:scale-[1.02]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${d.img})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="relative z-10 p-8">
                  <div className="text-5xl mb-3">{d.emoji}</div>
                  <h3 className="text-2xl font-bold text-white">{d.name}</h3>
                  <p className="text-green-300 text-sm mt-1">Andhra Pradesh</p>
                  <div className="mt-4 space-y-1 text-xs text-gray-300">
                    <div>📅 Coverage: <span className="text-white font-medium">{d.years}</span></div>
                    <div>🔮 Predictions: <span className="text-purple-300 font-medium">{d.predicted}</span></div>
                  </div>
                  <div className="mt-5 inline-flex items-center gap-2 bg-green-600 group-hover:bg-green-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                    Check {d.name} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-green-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {s.step}
                </div>
                <h3 className="font-semibold text-lg">{s.title}</h3>
                <p className="text-green-300 text-sm mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex gap-4 hover:shadow-md transition-shadow"
              >
                <span className="text-3xl flex-shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Drought awareness banner ── */}
      <section className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1400&q=80)' }}
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            🌾 Empowering Farmers with Data
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            Soil salinity is a growing challenge for farmers in Andhra Pradesh. High EC values reduce
            crop yields and damage soil health. This tool helps you understand your land's salinity
            conditions — today and into the future.
          </p>
          <Link
            to="/check"
            className="inline-block bg-green-600 hover:bg-green-500 text-white font-bold text-lg px-10 py-4 rounded-xl transition-colors shadow-xl"
          >
            🌱 Start Your Assessment
          </Link>
        </div>
      </section>

      {/* ── Data disclaimer ── */}
      <section className="bg-white py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6">
            <h3 className="font-bold text-amber-800 text-lg mb-3">⚠️ Data Transparency</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-amber-700">
              <div className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>EC values (0–1 range) may be <strong>normalized</strong>, not direct dS/m. Classification pending scale confirmation.</span>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>Results show the <strong>nearest dataset point</strong> — not your exact coordinate.</span>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>Future years are <strong>ML predictions</strong> with inherent forecast uncertainty.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
