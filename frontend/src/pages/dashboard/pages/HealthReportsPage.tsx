import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';

type HealthReport = {
  id: string;
  village: string;
  symptoms: string[];
  created_at: string;
  phone?: string;
};

const HealthReportsPage = () => {
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (start) qs.set('start', start);
      if (end) qs.set('end', end);
      const res = await api.get(`/health_reports${qs.toString() ? `?${qs.toString()}` : ''}`);
      setReports(res?.health_reports || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Load today's by default
    const today = new Date().toISOString().slice(0, 10);
    setStart(today);
    setEnd(today);
  }, []);

  useEffect(() => {
    if (start && end) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end]);

  const total = useMemo(() => reports.length, [reports]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Health Reports</h1>
        <div className="text-sm text-muted-foreground">Total: {total}</div>
      </div>

      <div className="bg-card border rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-sm block mb-1">From</label>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label className="text-sm block mb-1">To</label>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded">{error}</div>
      )}

      <div className="bg-card border rounded-xl p-4">
        {loading && reports.length === 0 ? (
          <div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
              <div className="h-10 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-sm text-muted-foreground">No reports to display.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Village</th>
                  <th className="px-4 py-2 text-left">Symptoms</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} className="border-t">
                    <td className="px-4 py-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2">{r.village}</td>
                    <td className="px-4 py-2">{r.symptoms.join(', ')}</td>
                    <td className="px-4 py-2">{r.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthReportsPage;
