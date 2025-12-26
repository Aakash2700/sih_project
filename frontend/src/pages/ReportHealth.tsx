import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { api, API_BASE_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ReportHealth() {
  const [village, setVillage] = useState('');
  const [symptomsText, setSymptomsText] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const symptoms = symptomsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!village || symptoms.length === 0 || !phone) {
      toast({ title: 'Please fill all fields', description: 'Village, phone and at least one symptom are required.' });
      return;
    }
    setLoading(true);
    try {
      // Use fetch directly to avoid auth header; endpoint is public
      const res = await fetch(`${API_BASE_URL}/public/health_report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ village, symptoms, phone })
      });
      if (!res.ok) throw new Error('Failed to submit');
      await res.json();
      toast({ title: 'Submitted', description: 'Thank you for reporting. Stay safe.' });
      setVillage('');
      setSymptomsText('');
      setPhone('');
    } catch (err: any) {
      toast({ title: 'Submission failed', description: err.message || 'Please try again' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mt-16">
        <section className="pt-20 pb-16 px-4 hero-gradient">
          <div className="max-w-xl mx-auto bg-card/70 backdrop-blur border rounded-2xl p-6 shadow-xl">
            <h1 className="text-2xl font-semibold mb-2 text-white">Report Health Issue</h1>
            <p className="text-white/80 mb-6">Help us monitor outbreaks by submitting your symptoms.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/80 mb-1">Village</label>
                <Input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="e.g. Guwahati" />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Phone Number</label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Symptoms (comma-separated)</label>
                <Textarea value={symptomsText} onChange={(e) => setSymptomsText(e.target.value)} placeholder="e.g. fever, nausea" rows={4} />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-white text-primary hover:bg-white/90">
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


