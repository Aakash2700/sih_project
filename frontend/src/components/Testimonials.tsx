import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, Building, Heart } from "lucide-react";

const testimonials = [
  {
    quote: "The smart alert system helped us identify contamination 48 hours before traditional testing would have caught it. This platform is saving lives.",
    author: "Dr. Sarah Chen",
    role: "Water Quality Director",
    organization: "Metro Health Department",
    avatar: "👩‍⚕️"
  },
  {
    quote: "Real-time data and AI predictions have reduced our maintenance costs by 40% while improving water quality standards across the city.",
    author: "Michael Rodriguez",
    role: "City Water Manager",
    organization: "Springfield Municipal",
    avatar: "👨‍💼"
  },
  {
    quote: "Finally, a system that lets citizens see exactly what's in their water. Transparency and trust have never been higher in our community.",
    author: "Lisa Thompson",
    role: "Community Leader",
    organization: "Riverside Neighborhood",
    avatar: "👩‍🦳"
  }
];

const impactStats = [
  {
    icon: Users,
    value: "250K+",
    label: "Citizens Protected",
    color: "text-sensor-green"
  },
  {
    icon: Building,
    value: "45",
    label: "Cities Covered",
    color: "text-water-blue"
  },
  {
    icon: Heart,
    value: "99.7%",
    label: "Safety Rating",
    color: "text-primary"
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Impact Stats */}
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Trusted by Communities
            <span className="text-gradient"> Worldwide</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Making a real difference in water safety and community health 
            through innovative monitoring and transparent reporting.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {impactStats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-water-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="card-gradient shadow-card hover-scale border-0 group"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <CardContent className="p-8">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-alert-amber text-alert-amber" />
                  ))}
                </div>
                
                <blockquote className="text-foreground leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-water-light flex items-center justify-center text-2xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-water-blue font-medium">{testimonial.organization}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;