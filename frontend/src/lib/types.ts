export type AlertRow = {
  id: string;
  sensorId: string;
  name: string;
  location: string;
  status: 'danger' | 'warning' | 'info' | 'safe';
  lastUpdate: string;
  message?: string;
};
