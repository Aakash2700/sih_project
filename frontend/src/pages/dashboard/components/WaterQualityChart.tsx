import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type Point = { timestamp: string; ph: number; turbidity: number; tds: number; temperature: number };

const WaterQualityChart = ({ data, title }: { data: Point[]; title: string }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card border rounded-xl shadow-sm p-4 h-96">
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
        <p className="text-muted-foreground">No historical data available.</p>
      </div>
    );
  }

  // Show only every 3rd data point to reduce clutter
  const filteredData = data.filter((_, index) => index % 3 === 0);
  const formatted = filteredData.map((d) => ({ ...d, time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));

  return (
    <div className="bg-card border rounded-xl shadow-sm p-4 h-96">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="ph" stroke="#8884d8" name="pH" />
          <Line type="monotone" dataKey="turbidity" stroke="#82ca9d" name="Turbidity (NTU)" />
          <Line type="monotone" dataKey="tds" stroke="#ffc658" name="TDS (ppm)" />
          <Line type="monotone" dataKey="temperature" stroke="#ff7300" name="Temp (°C)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WaterQualityChart;



