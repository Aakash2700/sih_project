
export type SensorData = {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  status: 'safe' | 'warning' | 'danger';
  lastUpdate: string;
  readings: {
    ph: number;
    turbidity: number;
    tds: number;
    temperature: number;
  };
};

export const fakeSensorData: SensorData[] = [
  {
    id: 'SENSOR-001',
    name: 'Brahmaputra River Sensor',
    location: 'Majuli, Assam',
    lat: 26.9121,
    lng: 94.1228,
    status: 'safe',
    lastUpdate: '2025-09-28T10:00:00Z',
    readings: {
      ph: 7.2,
      turbidity: 4.5,
      tds: 350,
      temperature: 22,
    },
  },
  {
    id: 'SENSOR-002',
    name: 'Loktak Lake Sensor',
    location: 'Moirang, Manipur',
    lat: 24.5939,
    lng: 93.7742,
    status: 'warning',
    lastUpdate: '2025-09-28T10:05:00Z',
    readings: {
      ph: 6.2,
      turbidity: 15.0,
      tds: 550,
      temperature: 25,
    },
  },
  {
    id: 'SENSOR-003',
    name: 'Umiam Lake Sensor',
    location: 'Shillong, Meghalaya',
    lat: 25.6739,
    lng: 91.9090,
    status: 'safe',
    lastUpdate: '2025-09-28T10:10:00Z',
    readings: {
      ph: 7.8,
      turbidity: 3.2,
      tds: 300,
      temperature: 19,
    },
  },
  {
    id: 'SENSOR-004',
    name: 'Dzukou Valley Sensor',
    location: 'Viswema, Nagaland',
    lat: 25.5696,
    lng: 94.1186,
    status: 'danger',
    lastUpdate: '2025-09-28T10:15:00Z',
    readings: {
      ph: 5.5,
      turbidity: 25.5,
      tds: 800,
      temperature: 28,
    },
  },
  {
    id: 'SENSOR-005',
    name: 'Tawang Chu River Sensor',
    location: 'Tawang, Arunachal Pradesh',
    lat: 27.5859,
    lng: 91.8582,
    status: 'safe',
    lastUpdate: '2025-09-28T10:20:00Z',
    readings: {
      ph: 7.5,
      turbidity: 5.0,
      tds: 400,
      temperature: 15,
    },
  },
  {
    id: 'SENSOR-006',
    name: 'VIT-AP University Sensor',
    location: 'Vijayawada, Andhra Pradesh',
    lat: 16.5062,
    lng: 80.6480,
    status: 'warning',
    lastUpdate: '2025-09-28T10:25:00Z',
    readings: {
      ph: 8.2,
      turbidity: 12.8,
      tds: 600,
      temperature: 30,
    },
  },
];
