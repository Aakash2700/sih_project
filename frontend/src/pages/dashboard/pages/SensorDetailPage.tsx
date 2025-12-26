import { useParams } from 'react-router-dom';

const SensorDetailPage = () => {
  const { sensorId } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold">Sensor Details</h1>
      <p>Details for sensor: {sensorId}</p>
    </div>
  );
};

export default SensorDetailPage;
