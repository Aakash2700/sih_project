import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Droplets, 
  Bell, 
  BarChart3, 
  Brain, 
  Users, 
  Smartphone 
} from "lucide-react";

const features = [
  {
    icon: Droplets,
    title: "Live Sensor Monitoring",
    description: "Real-time monitoring of pH, Turbidity, TDS, and Temperature with precision IoT sensors providing accurate water quality data.",
    color: "text-water-blue"
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Intelligent color-coded alert system: Green for low risk, yellow for medium risk, red for high risk situations requiring immediate attention.",
    color: "text-sensor-green"
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Comprehensive data visualization and reporting tools with historical trends, pattern analysis, and exportable insights.",
    color: "text-primary"
  },
  {
    icon: Brain,
    title: "AI Predictions",
    description: "Machine learning algorithms predict water quality issues before they occur, enabling proactive maintenance and prevention.",
    color: "text-alert-amber"
  },
  {
    icon: Users,
    title: "Role-based Access",
    description: "Secure multi-level access control for citizens, administrators, and technical staff with customized dashboards and permissions.",
    color: "text-muted-foreground"
  },
  {
    icon: Smartphone,
    title: "Responsive UI",
    description: "Fully responsive design optimized for desktop, tablet, and mobile devices ensuring accessibility anywhere, anytime.",
    color: "text-water-blue"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Advanced Water Quality
            <span className="text-gradient"> Solutions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive monitoring platform with cutting-edge IoT technology, 
            AI-powered insights, and user-friendly interfaces for all stakeholders.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`card-gradient shadow-card hover-lift border-0 group animate-fade-in stagger-${index + 1}`}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-water-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;