export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🌱</span>
              <span className="font-semibold text-white">Smart Soil Salinity</span>
            </div>
            <p className="text-sm leading-relaxed">
              Spatiotemporal Prediction and Mapping of Soil Salinity Using Remote Sensing and Machine Learning.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Districts</h4>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <span>Bapatla — 2015–2030 (Predicted: 2026–2030)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                <span>Godavari — 2010–2035 (Predicted: 2026–2035)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Data Notes</h4>
            <ul className="space-y-1.5 text-sm">
              <li>• EC values are normalized (0–1 scale)</li>
              <li>• Results use nearest dataset point</li>
              <li>• Future years are ML forecasts</li>
              <li>• Not a substitute for lab testing</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800 text-center text-xs text-gray-600">
          Academic Research Project | Andhra Pradesh, India | Built with React, Node.js, PostgreSQL + PostGIS
        </div>
      </div>
    </footer>
  );
}
