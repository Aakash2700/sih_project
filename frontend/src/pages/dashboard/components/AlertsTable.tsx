import { AlertRow } from '@/lib/types';
import { Button } from '@/components/ui/button';

const levelClass: Record<string, string> = {
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
};

const AlertLevelBadge = ({ level }: { level: string }) => (
  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${levelClass[level] || 'bg-gray-100 text-gray-800'}`}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
);

type Props = { alerts: AlertRow[]; title: string; onSend?: (a: AlertRow) => void };

const AlertsTable = ({ alerts, title, onSend }: Props) => {
  return (
    <div className="bg-card border rounded-xl shadow-sm p-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      {(!alerts || alerts.length === 0) ? (
        <p className="text-muted-foreground">No alerts to display.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Timestamp</th>
                <th className="px-6 py-3 text-left">Sensor</th>
                <th className="px-6 py-3 text-left">Location</th>
                <th className="px-6 py-3 text-left">Level</th>
                {onSend && <th className="px-6 py-3 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-6 py-3">{new Date(a.lastUpdate).toLocaleString()}</td>
                  <td className="px-6 py-3">{a.name} ({a.sensorId})</td>
                  <td className="px-6 py-3">{a.location}{a.message ? ` — ${a.message}` : ''}</td>
                  <td className="px-6 py-3"><AlertLevelBadge level={a.status} /></td>
                  {onSend && (
                    <td className="px-6 py-3">
                      <Button size="sm" className="shadow-button hover-glow" onClick={() => onSend(a)}>
                        Send to All
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AlertsTable;
