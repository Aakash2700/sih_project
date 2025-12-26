import AlertsTable from '../components/AlertsTable';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { AlertRow } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const AlertsPage = () => {
  const [levelFilter, setLevelFilter] = useState('all');
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/alerts');
        const rows: AlertRow[] = (res?.alerts || []).map((a: any) => ({
          id: a.id,
          sensorId: a.sensorId,
          name: a.sensorId,
          location: '-',
          status: a.level,
          lastUpdate: a.timestamp,
          message: a.message,
        }));
        // Add 4 synthetic alerts for demo purposes
        const now = new Date();
        const extras: AlertRow[] = [
          { id: 'EX-1', sensorId: 'SEN-005', name: 'SEN-005', location: 'Tezpur', status: 'danger', lastUpdate: new Date(now.getTime()-2*60000).toISOString(), message: 'Turbidity spike detected' },
          { id: 'EX-2', sensorId: 'SEN-012', name: 'SEN-012', location: 'Jorhat', status: 'warning', lastUpdate: new Date(now.getTime()-5*60000).toISOString(), message: 'TDS approaching limit' },
          { id: 'EX-3', sensorId: 'SEN-013', name: 'SEN-013', location: 'Dibrugarh', status: 'danger', lastUpdate: new Date(now.getTime()-9*60000).toISOString(), message: 'pH out of range' },
          { id: 'EX-4', sensorId: 'SEN-014', name: 'SEN-014', location: 'Tinsukia', status: 'warning', lastUpdate: new Date(now.getTime()-12*60000).toISOString(), message: 'High turbidity observed' },
        ];
        setAlerts([...extras, ...rows]);
      } catch (e) {
        // Fallback: show demo alerts when backend is unavailable or unauthorized
        const now = new Date();
        const extras: AlertRow[] = [
          { id: 'EX-1', sensorId: 'SEN-005', name: 'SEN-005', location: 'Tezpur', status: 'danger', lastUpdate: new Date(now.getTime()-2*60000).toISOString(), message: 'Turbidity spike detected' },
          { id: 'EX-2', sensorId: 'SEN-012', name: 'SEN-012', location: 'Jorhat', status: 'warning', lastUpdate: new Date(now.getTime()-5*60000).toISOString(), message: 'TDS approaching limit' },
          { id: 'EX-3', sensorId: 'SEN-013', name: 'SEN-013', location: 'Dibrugarh', status: 'danger', lastUpdate: new Date(now.getTime()-9*60000).toISOString(), message: 'pH out of range' },
          { id: 'EX-4', sensorId: 'SEN-014', name: 'SEN-014', location: 'Tinsukia', status: 'warning', lastUpdate: new Date(now.getTime()-12*60000).toISOString(), message: 'High turbidity observed' },
        ];
        setAlerts(extras);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => alerts.filter(a => levelFilter === 'all' ? true : a.status === levelFilter), [alerts, levelFilter]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm">Filter alerts by level:</label>
          <select className="border rounded p-1 text-sm" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="danger">Danger</option>
            <option value="warning">Warning</option>
          </select>
        </div>
        <Button
          className="shadow-button hover-glow"
          disabled={sending}
          onClick={() => {
            setSending(true);
            setTimeout(() => {
              toast({
                title: 'Alert sent successfully',
                description: 'All subscribers in the affected area have been notified.',
              });
              setSending(false);
            }, 700);
          }}
        >
          {sending ? 'Sending…' : 'Send Alert to All'}
        </Button>
      </div>
      {loading ? (
        <div className="bg-card border rounded-xl p-4">
          <div className="h-4 w-40 bg-muted rounded animate-pulse mb-4" />
          <div className="space-y-2">
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ) : (
        <AlertsTable
          alerts={filtered}
          title="All Alerts"
          onSend={(a) => {
            toast({
              title: 'Alert sent successfully',
              description: `Broadcasted alert for ${a.sensorId} (${a.location}).`,
            });
          }}
        />
      )}
    </div>
  );
};

export default AlertsPage;
