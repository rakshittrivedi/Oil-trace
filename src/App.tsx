import { useState } from 'react';
import './App.css';
import { Header } from './components/Header';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { TimelineControl } from './components/TimelineControl';
import { MapContainer } from './components/MapContainer';

import { RealTimeProvider } from './context/RealTimeContext';

function App() {
  const [mode, setMode] = useState<'observation' | 'forecast'>('observation');
  const [activeLayers, setActiveLayers] = useState({
    sar: true,
    optical: true,
    ais: true,
    oceanCurrents: true,
    wind: true,
    weather: false,
    historicalSpills: false,
  });

  return (
    <RealTimeProvider>
      <div className="app-container">
        {/* Background Hero Map */}
        <MapContainer mode={mode} activeLayers={activeLayers} />

        {/* Foreground UI Layer */}
        <div className="ui-layer">
          <Header />
          
          <div className="main-content">
            <LeftPanel activeLayers={activeLayers} setActiveLayers={setActiveLayers} />
            <div style={{ flex: 1 }}></div> {/* Empty space for map interaction */}
            <RightPanel />
          </div>
          
          <TimelineControl mode={mode} setMode={setMode} />
        </div>
      </div>
    </RealTimeProvider>
  );
}

export default App;
