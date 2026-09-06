import React, { useState } from 'react';
import { Play, SkipBack, SkipForward, Pause } from 'lucide-react';

interface TimelineControlProps {
  mode: 'observation' | 'forecast';
  setMode: (m: 'observation' | 'forecast') => void;
}

export const TimelineControl: React.FC<TimelineControlProps> = ({ mode, setMode }) => {
  const [playing, setPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(4); // Default NOW

  const timePoints = [
    { label: 'T-12h', val: -12 },
    { label: 'T-6h', val: -6 },
    { label: 'T-3h', val: -3 },
    { label: 'T-1h', val: -1 },
    { label: 'NOW', val: 0 },
    { label: '+6h', val: 6 },
    { label: '+12h', val: 12 },
    { label: '+24h', val: 24 }
  ];

  const handlePlayToggle = () => {
    setPlaying(!playing);
  };

  const handleModeToggle = (newMode: 'observation' | 'forecast') => {
    setMode(newMode);
    if (newMode === 'forecast') {
      setActiveIndex(5); // jump to +6h
    } else {
      setActiveIndex(4); // jump to NOW
    }
  };

  return (
    <div className="bottom-panel">
      <div className="glass-panel timeline-container">
        
        <div className="mode-toggle">
          <button 
            className={`mode-btn ${mode === 'observation' ? 'active' : ''}`}
            onClick={() => handleModeToggle('observation')}
          >
            OBSERVATION
          </button>
          <button 
            className={`mode-btn ${mode === 'forecast' ? 'active' : ''}`}
            onClick={() => handleModeToggle('forecast')}
          >
            FORECAST
          </button>
        </div>

        <div className="timeline-controls">
          <button className="timeline-btn" onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}>
            <SkipBack size={14} />
          </button>
          <button className="timeline-btn" onClick={handlePlayToggle} style={{ width: '40px', height: '40px', color: 'var(--color-accent-blue)', borderColor: 'var(--color-accent-blue)' }}>
            {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
          <button className="timeline-btn" onClick={() => setActiveIndex(Math.min(timePoints.length - 1, activeIndex + 1))}>
            <SkipForward size={14} />
          </button>
        </div>

        <div className="timeline-track">
          <div className="timeline-line"></div>
          {timePoints.map((tp, idx) => (
            <div 
              key={idx} 
              className={`timeline-point ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
            >
              <div className="point-dot"></div>
              <div className="point-label">{tp.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
