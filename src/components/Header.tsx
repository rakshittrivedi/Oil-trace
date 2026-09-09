import React from 'react';
import { ShieldAlert, Satellite } from 'lucide-react';
import { useRealTimeData } from '../context/RealTimeContext';

export const Header: React.FC = () => {
  const { state } = useRealTimeData();
  const { lastScanTime, activeAlerts } = state;
  
  // Format time to HH:MM:SS UTC
  const formattedTime = new Date(lastScanTime).toLocaleTimeString('en-GB', { timeZone: 'UTC' }) + ' UTC';

  return (
    <header className="top-header">
      <div className="brand">
        <h1>OILTRACE AI</h1>
        <span className="brand-subtitle">Maritime Intelligence & Oil Spill Attribution</span>
      </div>
      
      <div className="system-status">
        <div className="status-indicator">
          <div className="status-dot"></div>
          SYSTEM OPERATIONAL
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Satellite size={14} />
          Last Satellite Scan: {formattedTime}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-status-medium)' }}>
          <ShieldAlert size={14} />
          Alerts: {String(activeAlerts).padStart(2, '0')}
        </div>
      </div>
    </header>
  );
};
