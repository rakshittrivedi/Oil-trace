import React from 'react';
import { MapContainer as LeafletMap, TileLayer, Polygon, Marker, Polyline, Tooltip, CircleMarker, ImageOverlay } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRealTimeData } from '../context/RealTimeContext';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createVesselIcon = (heading: number, color: string = '#8a9fc4') => L.divIcon({
  className: 'custom-vessel-icon',
  html: `<div style="display: flex; justify-content: center; align-items: center; width: 20px; height: 40px;">
    <svg viewBox="0 0 24 48" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${heading}deg); width: 20px; height: 40px; filter: drop-shadow(0 0 4px ${color});">
      <path d="M12,2 C12,2 4,10 4,24 L4,46 L20,46 L20,24 C20,10 12,2 12,2 Z" fill="${color}" stroke="#fff" stroke-width="1"/>
      <rect x="6" y="14" width="12" height="20" fill="rgba(0,0,0,0.3)"/>
      <rect x="5" y="36" width="14" height="6" fill="rgba(255,255,255,0.7)"/>
    </svg>
  </div>`,
  iconSize: [20, 40],
  iconAnchor: [10, 20]
});

const suspectVesselIcon = (heading: number) => createVesselIcon(heading, '#ff3b30');
const normalVesselIcon = (heading: number) => createVesselIcon(heading, '#8a9fc4');

interface LayerState {
  sar: boolean;
  optical: boolean;
  ais: boolean;
  oceanCurrents: boolean;
  wind: boolean;
  weather: boolean;
  historicalSpills: boolean;
}

interface MapContainerProps {
  mode: 'observation' | 'forecast';
  activeLayers: LayerState;
}

export const MapContainer: React.FC<MapContainerProps> = ({ mode, activeLayers }) => {
  const { vessels, incidents } = useRealTimeData();
  const position: [number, number] = [15.5, 65.5];

  return (
    <div className="map-layer">
      <LeafletMap 
        center={position} 
        zoom={9} 
        zoomControl={false}
        style={{ width: '100%', height: '100%', background: '#060913' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          className="dark-satellite-tiles"
        />

        {/* Nautical charts for OpenSeaMap if Wind/Currents active for extra realism */}
        {(activeLayers.wind || activeLayers.oceanCurrents) && (
          <TileLayer
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
          />
        )}

        {/* Render Real-Time Incidents (SAR Layer) */}
        {activeLayers.sar && incidents.map((incident) => (
          <React.Fragment key={incident.id}>
            {/* Highly realistic Sentinel-1 SAR imagery footprint */}
            {incident.id === 'INC-001' && (
              <ImageOverlay
                url="/sar_spill.jpg"
                bounds={[[15.35, 65.3], [15.65, 65.65]]}
                opacity={0.7}
              />
            )}
            {incident.polygon.length > 0 && (
              <Polygon 
                positions={incident.polygon} 
                pathOptions={{ 
                  color: incident.severity === 'HIGH' ? '#ff3b30' : '#ff9f0a', 
                  fillColor: incident.severity === 'HIGH' ? '#ff3b30' : '#ff9f0a', 
                  fillOpacity: 0.3, weight: 1 
                }}
              >
                <Tooltip direction="center" permanent className="bg-transparent border-none text-high text-mono shadow-none" opacity={1}>
                  <div style={{ background: 'rgba(0,0,0,0.6)', padding: '4px 8px', border: `1px solid ${incident.severity === 'HIGH' ? '#ff3b30' : '#ff9f0a'}`, backdropFilter: 'blur(4px)' }}>
                    {incident.type.toUpperCase()}<br/>
                    <span style={{ color: '#fff' }}>96.4% CONFIDENCE</span>
                  </div>
                </Tooltip>
              </Polygon>
            )}

            {incident.origin && (
              <CircleMarker 
                center={incident.origin} 
                radius={6} 
                pathOptions={{ color: '#00d2ff', fillColor: '#00d2ff', fillOpacity: 0.8, weight: 2 }}
              >
                <Tooltip direction="bottom" permanent opacity={1}>
                  <div style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid #00d2ff', padding: '4px', fontSize: '10px', color: '#00d2ff', fontFamily: 'var(--font-mono)' }}>
                    ★ PROBABLE ORIGIN<br/>
                    <span style={{ color: '#fff' }}>89% probability</span>
                  </div>
                </Tooltip>
              </CircleMarker>
            )}

            {incident.driftTrajectory.length > 0 && (
              <Polyline 
                positions={incident.driftTrajectory} 
                pathOptions={{ color: '#00d2ff', weight: 2, dashArray: '5, 5', opacity: 0.6 }} 
              />
            )}

            {mode === 'forecast' && incident.forecastTrajectory.length > 0 && (
              <>
                <Polyline 
                  positions={incident.forecastTrajectory} 
                  pathOptions={{ color: '#ff9f0a', weight: 2, dashArray: '5, 5' }} 
                />
                <CircleMarker center={incident.forecastTrajectory[1]} radius={30} pathOptions={{ color: 'transparent', fillColor: '#ff9f0a', fillOpacity: 0.2 }} />
                <CircleMarker center={incident.forecastTrajectory[2]} radius={50} pathOptions={{ color: 'transparent', fillColor: '#ff9f0a', fillOpacity: 0.1 }} />
              </>
            )}
          </React.Fragment>
        ))}

        {/* Render Real-Time Vessels (AIS Layer) */}
        {activeLayers.ais && vessels.map((vessel) => {
          // If in forecast mode, project position +6 hours into the future for demonstration
          const timeMultiplier = mode === 'forecast' ? 21600 : 0; // 6 hours in seconds
          const moveDistance = (vessel.speed / 3600) * timeMultiplier * 0.05; // scaled for demo
          const rad = vessel.heading * (Math.PI / 180);
          
          const displayLat = vessel.lat + Math.cos(rad) * moveDistance;
          const displayLng = vessel.lng + Math.sin(rad) * moveDistance;

          return (
          <React.Fragment key={vessel.id}>
            <Marker 
              position={[displayLat, displayLng]} 
              icon={vessel.isSuspect ? suspectVesselIcon(vessel.heading) : normalVesselIcon(vessel.heading)}
            >
              <Tooltip direction="top" opacity={0.9}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                  {vessel.name} {vessel.isSuspect && '(Suspect)'} {mode === 'forecast' && '(+6h Forecast)'}
                </div>
              </Tooltip>
            </Marker>

            {vessel.isSuspect && (
              <CircleMarker 
                center={[displayLat, displayLng]} 
                radius={20} 
                pathOptions={{ color: '#ff3b30', weight: 1, fillOpacity: 0.1, dashArray: '4' }} 
              />
            )}
          </React.Fragment>
          );
        })}

      </LeafletMap>
    </div>
  );
};
