import React, { useState } from 'react';
import { Layers, AlertTriangle } from 'lucide-react';
import { useRealTimeData } from '../context/RealTimeContext';

export interface LayerState {
  sar: boolean;
  optical: boolean;
  ais: boolean;
  oceanCurrents: boolean;
  wind: boolean;
  weather: boolean;
  historicalSpills: boolean;
}

interface LeftPanelProps {
  activeLayers: LayerState;
  setActiveLayers: React.Dispatch<React.SetStateAction<LayerState>>;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ activeLayers, setActiveLayers }) => {
  const { incidents } = useRealTimeData();
  const [activeIncident, setActiveIncident] = useState('INC-001');

  const toggleLayer = (key: keyof LayerState) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="side-panel">
      {/* Active Incidents */}
      <div className="glass-panel panel-section">
        <div className="glass-panel-header">
          <AlertTriangle size={14} /> ACTIVE INCIDENTS
        </div>
        <div className="panel-content">
          {incidents.map((incident) => (
            <div 
              key={incident.id}
              className={`incident-item ${activeIncident === incident.id ? 'active' : ''}`}
              onClick={() => setActiveIncident(incident.id)}
            >
              <div className="incident-header">
                <span className="incident-id">{incident.id}</span>
                <span className={`severity-badge severity-${incident.severity.toLowerCase()}`}>{incident.severity}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{incident.type}</div>
              <div className="text-mono" style={{ fontSize: '0.85rem' }}>{incident.area || '--'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Layers */}
      <div className="glass-panel panel-section">
        <div className="glass-panel-header">
          <Layers size={14} /> DATA LAYERS
        </div>
        <div className="panel-content" style={{ gap: '0.5rem' }}>
          {Object.entries(activeLayers).map(([key, active]) => {
            let label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            if (key === 'sar') label = 'Sentinel-1 SAR (Zenodo)';
            if (key === 'ais') label = 'MarineCadastre AIS';
            if (key === 'oceanCurrents') label = 'Nautical Charts (OpenSeaMap)';
            if (key === 'wind') label = 'Meteorological (NOAA)';
            
            return (
              <div 
                key={key} 
                className={`toggle-item ${active ? 'active' : ''}`}
                onClick={() => toggleLayer(key as keyof LayerState)}
              >
                <div style={{
                  width: '12px', height: '12px', 
                  border: `1px solid ${active ? 'var(--color-accent-blue)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-accent-blue)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '2px'
                }}>
                  {active && <div style={{width: '6px', height: '6px', background: '#fff'}} />}
                </div>
                {label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
