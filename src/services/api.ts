export interface Vessel {
  id: string;
  name: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  isSuspect?: boolean;
  confidence?: number;
  level?: 'high' | 'medium' | 'low';
}

export interface Incident {
  id: string;
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  area: string;
  polygon: [number, number][];
  origin: [number, number];
  driftTrajectory: [number, number][];
  forecastTrajectory: [number, number][];
}

export interface SystemState {
  lastScanTime: string;
  activeAlerts: number;
  incidents: Incident[];
  vessels: Vessel[];
}

// Initial Mock State
let currentState: SystemState = {
  lastScanTime: new Date().toISOString(),
  activeAlerts: 3,
  incidents: [
    {
      id: 'INC-001',
      type: 'Oil Spill Detected',
      severity: 'HIGH',
      area: '18.7 km²',
      polygon: [[15.4, 65.4], [15.45, 65.35], [15.55, 65.42], [15.6, 65.5], [15.58, 65.6], [15.48, 65.55]],
      origin: [15.35, 65.3],
      driftTrajectory: [[15.35, 65.3], [15.42, 65.38], [15.48, 65.45]],
      forecastTrajectory: [[15.58, 65.6], [15.65, 65.68], [15.75, 65.75]]
    },
    {
      id: 'INC-002',
      type: 'Potential Slick',
      severity: 'MEDIUM',
      area: '4.3 km²',
      polygon: [[15.8, 65.1], [15.85, 65.15], [15.82, 65.2]],
      origin: [15.7, 65.0],
      driftTrajectory: [],
      forecastTrajectory: []
    }
  ],
  vessels: [
    { id: 'v1', name: 'MV OCEAN STAR', lat: 15.38, lng: 65.32, heading: 45, speed: 12, isSuspect: true, confidence: 94, level: 'high' },
    { id: 'v2', name: 'MV BLUE HORIZON', lat: 15.7, lng: 65.2, heading: 120, speed: 14, isSuspect: false, confidence: 81, level: 'high' },
    { id: 'v3', name: 'MV SEA TRADER', lat: 15.2, lng: 65.8, heading: 210, speed: 10, isSuspect: false, confidence: 37, level: 'medium' },
    { id: 'v4', name: 'MV PACIFIC ONE', lat: 15.8, lng: 65.5, heading: 330, speed: 16, isSuspect: false, confidence: 12, level: 'low' }
  ]
};

type Subscriber = (state: SystemState) => void;
const subscribers: Subscriber[] = [];

// Simulate real-time AIS and Satellite updates
setInterval(() => {
  const now = new Date();
  currentState = {
    ...currentState,
    lastScanTime: now.toISOString(),
    vessels: currentState.vessels.map(v => {
      // Simulate slow movement for vessels (sped up for hackathon demo)
      const moveDistance = (v.speed / 3600) * 1.5; // highly visible movement
      const rad = v.heading * (Math.PI / 180);
      return {
        ...v,
        lat: v.lat + Math.cos(rad) * moveDistance,
        lng: v.lng + Math.sin(rad) * moveDistance
      };
    })
  };

  subscribers.forEach(sub => sub(currentState));
}, 2000); // Push updates every 2 seconds

export const api = {
  subscribeToUpdates: (callback: Subscriber) => {
    subscribers.push(callback);
    callback(currentState); // Initial state
    return () => {
      const idx = subscribers.indexOf(callback);
      if (idx > -1) subscribers.splice(idx, 1);
    };
  }
};
