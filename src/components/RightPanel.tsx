import React, { useState, useRef } from 'react';
import { BrainCircuit, Crosshair, Ship, FileText, ActivitySquare } from 'lucide-react';
import { useRealTimeData } from '../context/RealTimeContext';
import { api } from '../services/api';

export const RightPanel: React.FC = () => {
  const { state: { vessels, incidents }, setPredictionMaskUrl } = useRealTimeData();
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [tracing, setTracing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // We default to the first incident for AI Incident Analysis display
  const activeIncident = incidents[0];

  const handleTraceOrigin = () => {
    setTracing(true);
    setTimeout(() => setTracing(false), 2000);
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsDetecting(true);
      const url = await api.runModelInference(file);
      setPredictionMaskUrl(url);
    } catch (error) {
      console.error('Failed to run inference', error);
      alert('ML Backend Inference Failed. Is the FastAPI server running?');
    } finally {
      setIsDetecting(false);
    }
  };

  const selectedVesselData = vessels.find(v => v.id === selectedVessel);

  return (
    <div className="side-panel">
      {/* AI Incident Analysis */}
      <div className="glass-panel panel-section">
        <div className="glass-panel-header">
          <BrainCircuit size={14} /> AI INCIDENT ANALYSIS
        </div>
        <div className="panel-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className={`severity-badge severity-${activeIncident?.severity.toLowerCase()}`}>{activeIncident?.severity} PRIORITY</span>
          </div>
          <div className="data-row">
            <span className="data-label">Spill Area</span>
            <span className="data-value">{activeIncident?.area || '--'}</span>
          </div>
          <div className="data-row">
            <span className="data-label">AI Confidence</span>
            <span className="data-value text-blue">96.4%</span>
          </div>
          <div className="data-row">
            <span className="data-label">Estimated Age</span>
            <span className="data-value">7–10 hours</span>
          </div>
          
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}
              onClick={handleUploadClick}
              disabled={isDetecting}
            >
              <BrainCircuit size={14} />
              {isDetecting ? 'RUNNING UNET MODEL...' : 'LIVE SAR DETECTION'}
            </button>
          </div>
        </div>
      </div>

      {/* Origin Reconstruction */}
      <div className="glass-panel panel-section">
        <div className="glass-panel-header">
          <Crosshair size={14} /> ORIGIN RECONSTRUCTION
        </div>
        <div className="panel-content">
          <div className="data-row">
            <span className="data-label">Origin Probability</span>
            <span className="data-value text-blue">89%</span>
          </div>
          <div className="data-row">
            <span className="data-label">Time Window</span>
            <span className="data-value">13:50–14:45 UTC</span>
          </div>
          <button 
            className="btn-primary" 
            style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}
            onClick={handleTraceOrigin}
          >
            {tracing ? <ActivitySquare size={14} className="spin" /> : <Crosshair size={14} />}
            {tracing ? 'TRACING...' : 'TRACE ORIGIN'}
          </button>
        </div>
      </div>

      {/* Suspect Vessels */}
      <div className="glass-panel panel-section" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="glass-panel-header">
          <Ship size={14} /> SUSPECT VESSELS
        </div>
        <div className="panel-content">
          {selectedVesselData ? (
            <div className="vessel-detail">
              <div 
                style={{ cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                onClick={() => setSelectedVessel(null)}
              >
                ← Back to list
              </div>
              <h3 style={{ fontSize: '1rem', margin: '0 0 1rem 0', fontFamily: 'var(--font-mono)' }}>{selectedVesselData.name}</h3>
              
              <div className="data-row">
                <span className="data-label">Current Speed</span>
                <span className="data-value text-blue">{selectedVesselData.speed.toFixed(1)} kts</span>
              </div>
              <div className="data-row">
                <span className="data-label">AI Attribution Confidence</span>
                <span className={`data-value text-${selectedVesselData.level}`}>{selectedVesselData.confidence}%</span>
              </div>
              
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-accent-blue)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Why this vessel?</div>
                
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
                    <span className="data-label">Proximity Match</span>
                    <span className="data-value text-blue">91%</span>
                  </div>
                  <div className="confidence-bar-container">
                    <div className="confidence-bar" style={{ width: '91%', background: 'var(--color-accent-blue)' }}></div>
                  </div>
                </div>

                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.25rem' }}>
                    <span className="data-label">Trajectory Match</span>
                    <span className="data-value text-blue">96%</span>
                  </div>
                  <div className="confidence-bar-container">
                    <div className="confidence-bar" style={{ width: '96%', background: 'var(--color-accent-blue)' }}></div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Vessel Timeline</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '3px', top: '5px', bottom: '5px', width: '1px', background: 'var(--color-border)' }}></div>
                  
                  {[
                    { t: '18:20', d: 'Entered analysis region' },
                    { t: '19:05', d: 'Course deviation detected', alert: true },
                    { t: '19:40', d: 'Closest approach to probable origin', alert: true },
                    { t: '21:00', d: 'Satellite slick detected' }
                  ].map((evt, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: evt.alert ? 'var(--color-status-high)' : 'var(--color-text-muted)', marginTop: '4px' }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: evt.alert ? 'var(--color-status-high)' : 'var(--color-text-primary)' }}>{evt.t}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{evt.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {vessels.map(v => (
                <div 
                  key={v.id} 
                  className={`vessel-item ${v.isSuspect ? 'active' : ''}`}
                  onClick={() => setSelectedVessel(v.id)}
                >
                  <div className="vessel-header">
                    <span>{v.name}</span>
                    <span className={`text-${v.level}`}>{v.confidence}%</span>
                  </div>
                  <div className="confidence-bar-container">
                    <div className={`confidence-bar ${v.level}`} style={{ width: `${v.confidence}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button className="btn-primary" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.25rem', alignItems: 'center', background: 'rgba(0,0,0,0.5)', borderColor: 'var(--color-text-secondary)', color: 'var(--color-text-primary)', padding: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <FileText size={14} /> GENERATE INCIDENT REPORT
        </div>
        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'none', letterSpacing: 'normal' }}>
          Powered by Sentinel-1 SAR & MarineCadastre AIS
        </div>
      </button>
    </div>
  );
};
