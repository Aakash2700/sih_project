import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import AppLoader from '@/components/AppLoader';
import { SensorData } from '@/lib/fake-sensor-data';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const PredictionPage = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Manual input state
  const [village, setVillage] = useState('');
  const [temperature, setTemperature] = useState<string>('');
  const [ph, setPh] = useState<string>('');
  const [turbidity, setTurbidity] = useState<string>('');
  const [tds, setTds] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  function computeStatus(r: { ph: number; turbidity: number; tds: number }): SensorData['status'] {
    if (r.ph < 6.5 || r.ph > 8.5 || r.turbidity > 10 || r.tds > 500) return 'danger';
    if ((r.turbidity > 5 && r.turbidity <= 10) || (r.tds > 300 && r.tds <= 500)) return 'warning';
    return 'safe';
  }

  useEffect(() => {
    if (sensorId) {
      (async () => {
        try {
          const sensorsData = await api.get('/sensors');
          const normalized: SensorData[] = (sensorsData?.sensors || [])
            .map((s: any) => {
              const lat = s?.location?.lat ?? s?.lat;
              const lng = s?.location?.lng ?? s?.lng;
              const readings = s?.readings || {};
              if (typeof lat !== 'number' || typeof lng !== 'number') return null;
              return {
                id: s.id,
                name: s?.metadata?.name || s.id,
                location: s?.village || `${lat}, ${lng}`,
                lat,
                lng,
                status: computeStatus({
                  ph: Number(readings.ph ?? 7),
                  turbidity: Number(readings.turbidity ?? 0),
                  tds: Number(readings.tds ?? 0),
                }),
                lastUpdate: s?.last_updated || new Date().toISOString(),
                readings: {
                  ph: Number(readings.ph ?? 7),
                  turbidity: Number(readings.turbidity ?? 0),
                  tds: Number(readings.tds ?? 0),
                  temperature: Number(readings.temperature ?? 0),
                },
              } as SensorData;
            })
            .filter(Boolean);
          const selectedSensor = normalized.find((s: SensorData) => s.id === sensorId) || null;
          setSensor(selectedSensor);
          // Prefill manual form from selected sensor if available
          if (selectedSensor) {
            setVillage(selectedSensor.location);
            setTemperature(String(selectedSensor.readings.temperature ?? ''));
            setPh(String(selectedSensor.readings.ph ?? ''));
            setTurbidity(String(selectedSensor.readings.turbidity ?? ''));
            setTds(String(selectedSensor.readings.tds ?? ''));
          }
          if (selectedSensor) {
            const payload = {
              sensor_id: selectedSensor.id,
              village: selectedSensor.location, // best-effort: location string holds village if available
              temperature: selectedSensor.readings.temperature,
              ph: selectedSensor.readings.ph,
              turbidity: selectedSensor.readings.turbidity,
              tds: selectedSensor.readings.tds,
            };
            const predictionData = await api.post('/public/predict', payload);
            setPrediction(predictionData);
          }
        } catch (e: any) {
          setError(e?.message || 'Failed to load prediction');
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [sensorId]);

  if (isLoading) {
    return <AppLoader />;
  }

  if (!sensor) {
    return <div>Sensor not found</div>;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{error}</div>
      )}
      <h2 className="text-2xl font-bold">Prediction for {sensor.id}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-foreground mb-2">Sensor Details</h3>
          <div><strong>Location:</strong> {sensor.location}</div>
          <div><strong>Coordinates:</strong> {sensor.lat}, {sensor.lng}</div>
          <div><strong>Last Updated:</strong> {new Date(sensor.lastUpdate).toLocaleString()}</div>
        </div>
        <div className="bg-card p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-foreground mb-3">Manual Prediction</h3>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              setPrediction(null);
              try {
                const payload = {
                  sensor_id: sensor?.id || 'MANUAL',
                  village: village || 'N/A',
                  temperature: Number(temperature),
                  ph: Number(ph),
                  turbidity: Number(turbidity),
                  tds: Number(tds),
                };
                const data = await api.post('/public/predict', payload);
                setPrediction(data);
              } catch (e: any) {
                setError(e?.message || 'Prediction failed');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="village">Village</Label>
              <Input id="village" value={village} onChange={(e) => setVillage(e.target.value)} placeholder="e.g. Guwahati" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input id="temperature" type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="e.g. 25" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ph">pH</Label>
                <Input id="ph" type="number" step="0.1" value={ph} onChange={(e) => setPh(e.target.value)} placeholder="e.g. 7.2" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="turbidity">Turbidity (NTU)</Label>
                <Input id="turbidity" type="number" step="0.1" value={turbidity} onChange={(e) => setTurbidity(e.target.value)} placeholder="e.g. 4.5" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tds">TDS (ppm)</Label>
                <Input id="tds" type="number" step="1" value={tds} onChange={(e) => setTds(e.target.value)} placeholder="e.g. 350" required />
              </div>
            </div>
            <Button type="submit" disabled={submitting}>{submitting ? 'Predicting…' : 'Predict'}</Button>
          </form>
        </div>
      </div>
      {prediction && (
        <div className="bg-card p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-foreground mb-2">Prediction Details</h3>
          <div className="space-y-2">
            {prediction.water_safety ? (
              <>
                <div>
                  <strong>Water Safety:</strong> {prediction.water_safety.is_safe ? 'Safe' : 'Unsafe'} (Confidence: {Number(prediction.water_safety.confidence).toFixed(2)})
                </div>
                <div>
                  <strong>Risk Level:</strong> {prediction.water_safety.risk_level}
                </div>
                <div>
                  <strong>Predicted Disease:</strong> {prediction.disease_prediction.predicted_disease} (Confidence: {Number(prediction.disease_prediction.confidence).toFixed(2)})
                </div>
                {prediction.disease_prediction.top_predictions && (
                  <div>
                    <strong>Top Predictions:</strong>
                    <ul className="list-disc list-inside">
                      {prediction.disease_prediction.top_predictions.map((p: any) => (
                        <li key={p.disease}>{p.disease}: {Number(p.probability).toFixed(2)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div>
                <strong>Result:</strong> {prediction.result} (Confidence: {Number(prediction.confidence).toFixed(2)})
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionPage;
