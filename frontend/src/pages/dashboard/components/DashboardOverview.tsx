import StatCard from './StatCard';
import { SensorData } from '@/lib/fake-sensor-data';
import { AlertRow } from '@/lib/types';

type Props = { sensors: SensorData[]; alerts?: AlertRow[]; healthReportsCount?: number };

const DashboardOverview = ({ sensors, alerts = [], healthReportsCount = 0 }: Props) => {
  const stats = {
    sensorsOnline: sensors.filter(s => s.status === 'safe').length,
    totalSensors: sensors.length,
    activeAlerts: sensors.filter(s => s.status === 'danger' || s.status === 'warning').length,
    healthReports: healthReportsCount,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Sensors Online" value={`${stats.sensorsOnline} / ${stats.totalSensors}`} description="All active water quality sensors" />
      <StatCard title="Active Alerts" value={stats.activeAlerts} description="High-priority warnings" />
      <StatCard title="Health Reports Today" value={stats.healthReports} description="New symptom reports" />
      <StatCard title="Water Quality Index" value={'N/A'} description={'Select a sensor to predict'} />

      {/* High Priority Alerts Panel */}
      <div className="md:col-span-2 lg:col-span-4 bg-card border rounded-xl p-4">
        <h3 className="text-lg font-semibold text-foreground mb-3">High Priority Alerts</h3>
        {alerts.filter(a => a.status === 'danger').length === 0 ? (
          <p className="text-sm text-muted-foreground">No high priority alerts right now.</p>
        ) : (
          <ul className="divide-y">
            {alerts.filter(a => a.status === 'danger').slice(0, 3).map(a => (
              <li key={a.id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.name} ({a.sensorId})</div>
                  <div className="text-sm text-muted-foreground">{new Date(a.lastUpdate).toLocaleString()} • {a.location}{a.message ? ` — ${a.message}` : ''}</div>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Danger</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
