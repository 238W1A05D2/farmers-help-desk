import { useState, useEffect } from 'react';
import axios from 'axios';
import YearSelector from '../components/YearSelector';
import SalinityResultCard from '../components/SalinityResultCard';
import SalinityClassification from '../components/SalinityClassification';
import MapView from '../components/MapView';
import ECTrendChart from '../components/ECTrendChart';
import NearbyLocationsCard from '../components/NearbyLocationsCard';
import OverallEcTrendChart from '../components/OverallEcTrendChart';
import CoordinateInput from '../components/CoordinateInput';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getSoilSalinity, getLocationHistory, getOverallEcTrend, getDistricts } from '../services/api';
import type { SoilSalinityResult, LocationHistoryResult, OverallEcTrendPoint, DistrictInfo } from '../types';

type Step = 'district' | 'location' | 'year' | 'result';

// Agriculture background images (free Unsplash)
const DISTRICT_IMAGES: Record<string, string> = {
  Bapatla:
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80',
  Godavari:
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80',
  default:
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80',
};

export default function CheckPage() {
  const [step, setStep] = useState<Step>('district');

  // District
  const [districts, setDistricts] = useState<DistrictInfo[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null);
  const [districtLoading, setDistrictLoading] = useState(true);

  // Location
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Year
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Results
  const [result, setResult] = useState<SoilSalinityResult | null>(null);
  const [history, setHistory] = useState<LocationHistoryResult | null>(null);
  const [overallTrend, setOverallTrend] = useState<OverallEcTrendPoint[] | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // UI
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [overallLoading, setOverallLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available districts on mount
  useEffect(() => {
    getDistricts()
      .then((res) => setDistricts(res.districts))
      .catch(() => setDistricts([]))
      .finally(() => setDistrictLoading(false));
  }, []);

  // When district changes: reset everything, load overall trend
  const handleSelectDistrict = (d: DistrictInfo) => {
    setSelectedDistrict(d);
    setLatitude(d.placeholder.lat);
    setLongitude(d.placeholder.lon);
    setSelectedYear(null);
    setResult(null);
    setHistory(null);
    setOverallTrend(null);
    setLocationConfirmed(false);
    setStep('location');
    setError(null);

    // Fetch overall district trend
    setOverallLoading(true);
    getOverallEcTrend(d.name)
      .then((res) => setOverallTrend(res.data))
      .catch(() => setOverallTrend(null))
      .finally(() => setOverallLoading(false));
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported.'); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      () => { setError('Could not get your location. Enter coordinates manually.'); setIsLocating(false); }
    );
  };

  const handleFindLocation = () => {
    if (!latitude || !longitude) return;
    setLocationConfirmed(true);
    setStep('year');
    setError(null);
  };

  const handleGetSalinity = async () => {
    if (!selectedYear || !latitude || !longitude || !selectedDistrict) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setHistoryLoading(true);
    setError(null);
    setResult(null);
    setHistory(null);

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    try {
      const [salinityRes, historyRes] = await Promise.allSettled([
        getSoilSalinity(lat, lon, selectedYear, selectedDistrict.name),
        getLocationHistory(lat, lon, selectedDistrict.name, selectedYear),
      ]);

      if (salinityRes.status === 'fulfilled') {
        setResult(salinityRes.value.data);
        setWarning(salinityRes.value.warning ?? null);
        setStep('result');
      } else {
        const err = salinityRes.reason;
        setError(
          axios.isAxiosError(err) && err.response?.data?.error
            ? err.response.data.error
            : 'Failed to retrieve data. Check the backend is running.'
        );
      }
      if (historyRes.status === 'fulfilled') setHistory(historyRes.value.data);
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep('district');
    setSelectedDistrict(null);
    setLatitude('');
    setLongitude('');
    setSelectedYear(null);
    setResult(null);
    setHistory(null);
    setOverallTrend(null);
    setWarning(null);
    setError(null);
    setLocationConfirmed(false);
  };

  const userLat = latitude ? parseFloat(latitude) : null;
  const userLon = longitude ? parseFloat(longitude) : null;
  const bgImage = DISTRICT_IMAGES[selectedDistrict?.name ?? 'default'] ?? DISTRICT_IMAGES.default;

  // ── STEP 1: District selection page ─────────────────────────────────────────
  if (step === 'district') {
    return (
      <main className="min-h-screen relative">
        {/* Background farm image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${DISTRICT_IMAGES.default})` }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-60" />

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
          <div className="text-center mb-10">
            <div className="inline-block bg-green-500 bg-opacity-20 border border-green-400 text-green-200 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              🌾 Andhra Pradesh — Soil Salinity Monitoring
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Select Your District
            </h1>
            <p className="mt-3 text-lg text-gray-300 max-w-xl mx-auto">
              Choose your district to view soil EC data, historical trends, and future predictions
              for your farmland.
            </p>
          </div>

          {districtLoading ? (
            <div className="text-white"><LoadingSpinner message="Loading districts..." /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
              {districts.map((d) => (
                <button
                  key={d.name}
                  onClick={() => handleSelectDistrict(d)}
                  className="group relative overflow-hidden rounded-2xl shadow-2xl border-2 border-white border-opacity-20 hover:border-green-400 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400"
                >
                  {/* Card background image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${DISTRICT_IMAGES[d.name] ?? DISTRICT_IMAGES.default})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  <div className="relative z-10 p-8 text-left">
                    <div className="text-4xl mb-3">
                      {d.name === 'Bapatla' ? '🌊' : '🏞️'}
                    </div>
                    <h2 className="text-2xl font-bold text-white">{d.name}</h2>
                    <p className="text-green-300 text-sm mt-1">{d.state}</p>

                    <div className="mt-4 space-y-1.5 text-xs text-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                        Historical: {d.historicalYears[0]}–{d.historicalYears[d.historicalYears.length - 1]}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />
                        Predicted: {d.predictedYears[0]}–{d.predictedYears[d.predictedYears.length - 1]}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                        Coverage: {d.yearRange.start}–{d.yearRange.end}
                      </div>
                    </div>

                    <div className="mt-5 inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                      Select {d.name} →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Drought awareness caption */}
          <div className="mt-10 max-w-lg text-center">
            <p className="text-gray-400 text-sm">
              🌱 Helping farmers understand soil salinity conditions to make informed agricultural decisions.
              Data from remote sensing and machine learning models.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ── STEPS 2–4: Location → Year → Result ─────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">
      {/* District header banner with background image */}
      <div className="relative h-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-green-900 bg-opacity-75" />
        <div className="relative z-10 h-full flex items-center justify-between px-6 max-w-4xl mx-auto">
          <div>
            <div className="text-green-300 text-sm font-medium">Andhra Pradesh</div>
            <h1 className="text-2xl font-bold text-white">
              {selectedDistrict?.name === 'Bapatla' ? '🌊' : '🏞️'} {selectedDistrict?.name} District
            </h1>
            <div className="text-green-200 text-xs mt-0.5">
              {selectedDistrict?.yearRange.start}–{selectedDistrict?.yearRange.end} |{' '}
              Historical: {selectedDistrict?.historicalYears[0]}–
              {selectedDistrict?.historicalYears[selectedDistrict.historicalYears.length - 1]} |{' '}
              Predicted: {selectedDistrict?.predictedYears[0]}–
              {selectedDistrict?.predictedYears[selectedDistrict.predictedYears.length - 1]}
            </div>
          </div>
          <button
            onClick={handleStartOver}
            className="text-sm text-green-200 hover:text-white border border-green-400 hover:border-white px-3 py-1.5 rounded-lg transition-colors"
          >
            ← Change District
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          {(['location', 'year', 'result'] as Step[]).map((s, idx) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s ? 'bg-green-700 text-white'
                  : idx < ['location','year','result'].indexOf(step) ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {idx + 1}
              </div>
              <span className={step === s ? 'font-semibold text-green-700' : 'text-gray-400'}>
                {s === 'location' ? 'Location' : s === 'year' ? 'Year' : 'Result'}
              </span>
              {idx < 2 && <span className="text-gray-300">›</span>}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-5">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* Location input */}
        {(step === 'location' || step === 'year' || step === 'result') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center font-bold">1</span>
              Enter Your Farm Coordinates
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Reference area — Lat: {selectedDistrict?.bounds.minLat.toFixed(4)}–
              {selectedDistrict?.bounds.maxLat.toFixed(4)} | Lon:{' '}
              {selectedDistrict?.bounds.minLon.toFixed(4)}–
              {selectedDistrict?.bounds.maxLon.toFixed(4)}
            </p>
            <CoordinateInput
              latitude={latitude}
              longitude={longitude}
              onLatitudeChange={setLatitude}
              onLongitudeChange={setLongitude}
              onUseMyLocation={handleUseMyLocation}
              onFindLocation={handleFindLocation}
              isLocating={isLocating}
              districtBounds={selectedDistrict?.bounds}
              districtName={selectedDistrict?.name ?? ''}
            />
            {step === 'location' && latitude && longitude && (
              <button
                onClick={handleFindLocation}
                className="mt-5 w-full bg-green-700 text-white font-semibold py-3 rounded-xl hover:bg-green-800 transition-colors"
              >
                Confirm Location & Select Year →
              </button>
            )}
          </div>
        )}

        {/* Map */}
        {locationConfirmed && userLat !== null && userLon !== null && (
          <div className="mb-6">
            <MapView
              userLat={userLat}
              userLon={userLon}
              matchedLat={result?.matchedLatitude}
              matchedLon={result?.matchedLongitude}
              ecValue={result?.ecValue}
              year={selectedYear}
              district={selectedDistrict?.name ?? ''}
              districtCenter={selectedDistrict?.center}
              nearbyLocations={history?.nearbyLocations ?? []}
            />
          </div>
        )}

        {/* Year selector */}
        {(step === 'year' || step === 'result') && selectedDistrict && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center font-bold">2</span>
              Select Year
            </h2>
            <YearSelector
              year={selectedYear}
              onYearChange={setSelectedYear}
              historicalYears={selectedDistrict.historicalYears}
              predictedYears={selectedDistrict.predictedYears}
            />
            {step === 'year' && (
              <button
                onClick={handleGetSalinity}
                disabled={!selectedYear || loading}
                className="mt-5 w-full bg-green-700 text-white font-semibold py-3 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Fetching data...</>
                ) : '🌱 Get Soil Salinity'}
              </button>
            )}
          </div>
        )}

        {loading && <LoadingSpinner message="Querying database for nearest location and nearby areas..." />}

        {/* Results */}
        {step === 'result' && result && (
          <div className="space-y-6">
            <SalinityResultCard result={result} warning={warning} />
            <SalinityClassification ecValue={result.ecValue} />

            {!historyLoading && history?.nearbyLocations && history.nearbyLocations.length > 0 && (
              <NearbyLocationsCard
                nearbyLocations={history.nearbyLocations}
                year={result.year}
                primaryEcValue={result.ecValue}
              />
            )}

            {/* Try another year */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-700 text-white text-xs flex items-center justify-center font-bold">2</span>
                Try Another Year
              </h2>
              {selectedDistrict && (
                <YearSelector
                  year={selectedYear}
                  onYearChange={setSelectedYear}
                  historicalYears={selectedDistrict.historicalYears}
                  predictedYears={selectedDistrict.predictedYears}
                />
              )}
              <button
                onClick={handleGetSalinity}
                disabled={!selectedYear || loading}
                className="mt-4 w-full bg-green-700 text-white font-semibold py-3 rounded-xl hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 Update Result
              </button>
            </div>

            {!historyLoading && history && (
              <ECTrendChart
                trend={history.trend}
                selectedYear={selectedYear}
                districtName={selectedDistrict?.name ?? ''}
              />
            )}
            {historyLoading && <LoadingSpinner message="Loading EC trend..." />}

            {!overallLoading && overallTrend && (
              <OverallEcTrendChart trend={overallTrend} district={selectedDistrict?.name ?? ''} />
            )}
            {overallLoading && <LoadingSpinner message="Loading district-wide trend..." />}

            <button
              onClick={handleStartOver}
              className="w-full border-2 border-gray-300 text-gray-600 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Select a Different District
            </button>
          </div>
        )}

        {/* Show overall trend before result too */}
        {step !== 'result' && !overallLoading && overallTrend && overallTrend.length > 0 && (
          <div className="mt-6">
            <OverallEcTrendChart trend={overallTrend} district={selectedDistrict?.name ?? ''} />
          </div>
        )}
      </div>
    </main>
  );
}
