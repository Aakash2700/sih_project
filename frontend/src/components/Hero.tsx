import { Button } from "./ui/button";
import riverImage from "@/assets/flowing-river.jpg";
import { useCountUp } from "@/hooks/useCountUp";
import { Link } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { LogIn, UserPlus, ArrowRight } from "lucide-react";

const Hero = () => {
  const { user } = useAuth();
  const sensors = useCountUp({ end: 10, duration: 2500, delay: 500 });
  const uptime = useCountUp({ end: 99.9, duration: 2000, delay: 700 });
  const dataPoints = useCountUp({ end: 5, duration: 2200, delay: 900 });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-gradient">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        <img 
          src={riverImage} 
          alt="Flowing river with clean water"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-water-blue/30"></div>
      </div>
      
      {/* Floating Water Effects */}
      <div className="absolute top-20 left-10 water-ripple"></div>
      <div className="absolute bottom-32 right-16 water-ripple"></div>
      <div className="absolute top-1/3 right-20 water-ripple"></div>
      <div className="absolute bottom-1/4 left-1/4 water-ripple"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm animate-float"></div>
      <div className="absolute bottom-32 right-16 w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/3 right-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm animate-float" style={{animationDelay: '2s'}}></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Smart Water{" "}
            <span className="text-gradient bg-gradient-to-r from-white to-water-light bg-clip-text text-transparent">
              Monitoring
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '0.3s'}}>
            Real-time IoT sensors monitoring water quality with AI-powered predictions, 
            smart alerts, and comprehensive analytics for citizens and administrators.
          </p>
          
          <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"></div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              {!user && (
                <>
                  <Button 
                    asChild
                    variant="secondary"
                    size="lg"
                    className="bg-primary/20 backdrop-blur-sm text-white border-0 hover:bg-primary/30 px-6 py-3 font-medium hover-glow shadow-button rounded-lg"
                  >
                    <Link to="/auth">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                  
                  <Button 
                    asChild
                    variant="secondary"
                    size="lg"
                    className="bg-sensor-green/20 backdrop-blur-sm text-white border-0 hover:bg-sensor-green/30 px-6 py-3 font-medium hover-glow shadow-button rounded-lg"
                  >
                    <Link to="/auth">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}

              <Button 
                asChild
                variant="secondary"
                size="lg"
                className="bg-water-blue/30 backdrop-blur-sm text-white border-0 hover:bg-water-blue/40 px-6 py-3 font-medium hover-glow shadow-button rounded-lg"
              >
                <Link to="/report-health">
                  Report Health Issue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.9s'}}>
            <div className="text-center" ref={sensors.elementRef}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 animate-count-up">
                {sensors.count}+
              </div>
              <div className="text-white/80 text-sm">Active Sensors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80 text-sm">Monitoring</div>
            </div>
            <div className="text-center" ref={uptime.elementRef}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 animate-count-up">
                {uptime.count}%
              </div>
              <div className="text-white/80 text-sm">Uptime</div>
            </div>
            <div className="text-center" ref={dataPoints.elementRef}>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 animate-count-up">
                {dataPoints.count}K+
              </div>
              <div className="text-white/80 text-sm">Data Points</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;