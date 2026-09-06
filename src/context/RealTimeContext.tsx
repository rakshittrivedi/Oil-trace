import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, type SystemState } from '../services/api';

const RealTimeContext = createContext<SystemState | null>(null);

export const RealTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SystemState | null>(null);

  useEffect(() => {
    // Subscribe to the real-time API (WebSocket simulation)
    const unsubscribe = api.subscribeToUpdates((newState) => {
      setState(newState);
    });

    return () => unsubscribe();
  }, []);

  if (!state) {
    return <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#060913' }}>INITIALIZING REAL-TIME SYSTEMS...</div>;
  }

  return (
    <RealTimeContext.Provider value={state}>
      {children}
    </RealTimeContext.Provider>
  );
};

export const useRealTimeData = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTimeData must be used within a RealTimeProvider');
  }
  return context;
};
