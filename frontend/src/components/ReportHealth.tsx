import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';

const ReportHealth = () => {
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <section id="report-health" className="py-12 px-4">
      <div className="max-w-3xl mx-auto bg-card border rounded-2xl p-6 shadow-card">
        <h2 className="text-2xl font-bold mb-2">Report Health</h2>
        <p className="text-muted-foreground mb-6">Help us monitor outbreaks. Report symptoms observed in your area.</p>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            try {
              const payload = {
                village: village.trim(),
                phone: phone.trim(),
                symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
              };
              await api.post('/public/health_report', payload);
              toast({ title: 'Report submitted', description: 'Thank you for helping keep your community safe.' });
              setVillage(''); setPhone(''); setSymptoms('');
            } catch (e: any) {
              toast({ title: 'Failed to submit', description: e?.message || 'Please try again later.' });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="village">Village</Label>
              <Input id="village" value={village} onChange={(e) => setVillage(e.target.value)} placeholder="e.g. Guwahati" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="symptoms">Symptoms (comma-separated)</Label>
              <Input id="symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="e.g. fever, diarrhea" required />
            </div>
          </div>
          <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Report'}</Button>
        </form>
      </div>
    </section>
  );
};

export default ReportHealth;
