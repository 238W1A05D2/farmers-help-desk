import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import type { NearbyLocation } from '../types';
import { formatDistance } from '../utils/salinity';

// Fix default marker icons for Vite builds
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 🟢 Green — farmer's entered location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// 🔴 Red — nearest (primary) dataset point
const datasetIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// 🟠 Orange — nearby locations
const nearbyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [20, 33], iconAnchor: [10, 33], popupAnchor: [1, -28], shadowSize: [33, 33],
});

interface MapViewProps {
  userLat: number | null;
  userLon: number | null;
  matchedLat?: number | null;
  matchedLon?: number | null;
  ecValue?: number | null;
  year?: number | null;
  district?: string;
  districtCenter?: [number, number];
  nearbyLocations?: NearbyLocation[];
}

// Recenter map when coordinates change
function MapRecenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lon], 14); }, [lat, lon, map]);
  return null;
}

const DEFAULT_CENTER: [number, number] = [15.850054, 80.450063];

export default function MapView({
  userLat, userLon, matchedLat, matchedLon,
  ecValue, year, district = 'Bapatla',
  districtCenter, nearbyLocations = [],
}: MapViewProps) {
  const studyCenter: [number, number] = districtCenter ?? DEFAULT_CENTER;
  const mapCenter: [number, number] = userLat !== null && userLon !== null
    ? [userLat, userLon]
    : studyCenter;

  // Study area radius: approximate from bounds
  // Bapatla ~5.5km radius, Godavari larger ~60km — use a reasonable circle per district
  const studyRadius = district === 'Godavari' ? 60000 : 8000;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-green-700 px-6 py-4 text-white">
        <h3 className="text-lg font-bold">🗺️ Location Map — {district}</h3>
        <p className="text-sm text-green-200 mt-0.5">
          Your location · Nearest dataset point · 5 nearby locations
        </p>
      </div>

      <div className="relative">
        <MapContainer
          center={mapCenter}
          zoom={userLat !== null ? 14 : 10}
          style={{ height: '420px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Dynamic study area circle based on district */}
          <Circle
            center={studyCenter}
            radius={studyRadius}
            pathOptions={{
              color: '#16a34a', fillColor: '#16a34a',
              fillOpacity: 0.04, weight: 2, dashArray: '6,4',
            }}
          />

          {/* User location — green */}
          {userLat !== null && userLon !== null && (
            <>
              <MapRecenter lat={userLat} lon={userLon} />
              <Marker position={[userLat, userLon]} icon={userIcon}>
                <Popup>
                  <div className="text-sm min-w-[160px]">
                    <p className="font-bold text-green-700 mb-1">📍 Your Location</p>
                    <p className="text-gray-600 font-mono text-xs">
                      {userLat.toFixed(6)}, {userLon.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Nearest dataset point — red */}
          {matchedLat != null && matchedLon != null && (
            <>
              <Marker position={[matchedLat, matchedLon]} icon={datasetIcon}>
                <Popup>
                  <div className="text-sm min-w-[180px]">
                    <p className="font-bold text-red-700 mb-1">🎯 Nearest Dataset Point</p>
                    <p className="text-gray-600 font-mono text-xs">
                      {matchedLat.toFixed(6)}, {matchedLon.toFixed(6)}
                    </p>
                    {ecValue != null && year && (
                      <p className="mt-1 text-gray-700">
                        <span className="font-semibold">EC {year}:</span>{' '}
                        <span className="font-mono text-green-700">{ecValue.toFixed(6)}</span>
                      </p>
                    )}
                    <p className="mt-1.5 text-xs font-semibold text-red-500">Primary result</p>
                  </div>
                </Popup>
              </Marker>

              {/* Dashed line: user → nearest point */}
              {userLat !== null && userLon !== null && (
                <Polyline
                  positions={[[userLat, userLon], [matchedLat, matchedLon]]}
                  pathOptions={{ color: '#dc2626', weight: 1.5, dashArray: '5,5', opacity: 0.6 }}
                />
              )}
            </>
          )}

          {/* Nearby locations — orange, smaller */}
          {nearbyLocations.map((loc) => (
            <Marker
              key={loc.systemIndex}
              position={[loc.latitude, loc.longitude]}
              icon={nearbyIcon}
            >
              <Popup>
                <div className="text-sm min-w-[180px]">
                  <p className="font-bold text-orange-600 mb-1">🟠 Nearby #{loc.rank}</p>
                  <p className="text-gray-600 font-mono text-xs">
                    {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                  </p>
                  <p className="mt-1 text-gray-700">
                    <span className="font-semibold">EC {year ?? ''}:</span>{' '}
                    <span className="font-mono text-orange-700">
                      {loc.ecValue !== null ? loc.ecValue.toFixed(6) : 'N/A'}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Distance: <span className="font-semibold">{formatDistance(loc.distanceInMeters)}</span>
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white/95 rounded-xl shadow-md p-3 text-xs z-[1000] border border-gray-200">
          <p className="font-semibold text-gray-700 mb-2">Legend</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-green-600">📍</span><span className="text-gray-700">Your Location</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-red-600">🎯</span><span className="text-gray-700">Nearest Point</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-orange-500">🟠</span><span className="text-gray-700">Nearby (5 pts)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 border-t-2 border-dashed border-green-600 inline-block" />
              <span className="text-gray-700">Study Area</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coordinate bar */}
      {userLat !== null && userLon !== null && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex flex-wrap gap-4">
          <span>📍 {userLat.toFixed(6)}, {userLon.toFixed(6)}</span>
          {matchedLat != null && matchedLon != null && (
            <span className="text-red-600">🎯 {matchedLat.toFixed(6)}, {matchedLon.toFixed(6)}</span>
          )}
          {nearbyLocations.length > 0 && (
            <span className="text-orange-600">🟠 {nearbyLocations.length} nearby shown</span>
          )}
        </div>
      )}
    </div>
  );
}
