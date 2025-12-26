import MapComponent from '../components/MapComponent';
import { fakeSensorData } from '@/lib/fake-sensor-data';

const MapViewPage = () => {
  return (
    <div>
      <MapComponent sensors={fakeSensorData} />
    </div>
  );
};

export default MapViewPage;
