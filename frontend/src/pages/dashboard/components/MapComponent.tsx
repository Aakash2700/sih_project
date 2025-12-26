import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { SensorData } from '@/lib/fake-sensor-data';

type MapComponentProps = {
  sensors: SensorData[];
};

const MapComponent: React.FC<MapComponentProps> = ({ sensors }) => {

  return (
    <div className="relative bg-card border rounded-xl shadow-sm h-96">
      {sensors.length === 0 && (
        <div className="absolute z-[1000] inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-background/80 border rounded px-3 py-1 text-sm">No sensors available yet.</div>
        </div>
      )}
      <MapContainer center={[26.0, 92.9]} zoom={7} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        {sensors.map((sensor) => (
          <Marker key={sensor.id} position={[sensor.lat, sensor.lng]}>
            <Popup>
              <b>{sensor.name} ({sensor.id})</b><br />
              <b>Location:</b> {sensor.location}<br />
              <b>Status:</b> <span className={sensor.status === 'safe' ? 'text-green-600' : sensor.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}>{sensor.status}</span><br />
              <b>Temperature:</b> {sensor.readings.temperature} °C<br />
              <Link to={`/dashboard/sensors/${sensor.id}`} className="text-primary underline">View Details</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
