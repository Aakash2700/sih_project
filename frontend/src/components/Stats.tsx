import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Thermometer, 
  Droplet, 
  Zap, 
  TrendingUp,
  Activity,
  Shield
} from "lucide-react";

const statsData = [
  {
    icon: Thermometer,
    title: "Temperature",
    value: "22.5°C",
    status: "normal",
    change: "+0.3°",
    color: "text-sensor-green"
  },
  {
    icon: Droplet,
    title: "pH Level",
    value: "7.2",
    status: "optimal", 
    change: "-0.1",
    color: "text-water-blue"
  },
  {
    icon: Zap,
    title: "TDS",
    value: "145 ppm",
    status: "good",
    change: "+5 ppm",
    color: "text-primary"
  },
  {
    icon: TrendingUp,
    title: "Turbidity",
    value: "2.1 NTU",
    status: "clear",
    change: "-0.2 NTU",
    color: "text-sensor-green"
  },
  {
    icon: Activity,
    title: "System Health",
    value: "99.2%",
    status: "excellent",
    change: "+0.1%",
    color: "text-water-blue"
  },
  {
    icon: Shield,
    title: "Data Quality",
    value: "98.8%",
    status: "reliable",
    change: "+0.3%",
    color: "text-primary"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'optimal':
    case 'excellent':
    case 'normal':
      return 'text-sensor-green';
    case 'good':
    case 'clear':
    case 'reliable':
      return 'text-water-blue';
    default:
      return 'text-muted-foreground';
  }
};

const Stats = () => {
  return (
    <section id="analytics" className="py-24 px-4 stats-gradient">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Real-time
            <span className="text-gradient"> Sensor Data</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Live monitoring dashboard showing current water quality parameters 
            and system performance metrics updated every second.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsData.map((stat, index) => (
            <Card 
              key={index} 
              className={`bg-white/80 backdrop-blur-sm shadow-card hover-lift border-0 group animate-pop-in stagger-${index + 1}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-medium ${getStatusColor(stat.status)} capitalize`}>
                      {stat.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stat.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Data updated every 30 seconds • Last update: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Stats;