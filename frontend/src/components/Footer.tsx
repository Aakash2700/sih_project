import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Twitter, 
  Linkedin, 
  Github,
  Droplets
} from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mr-3">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Smart Water Monitoring</h3>
              </div>
              <p className="text-white/80 leading-relaxed mb-6 max-w-lg">
                Leading the future of water quality monitoring with innovative IoT solutions, 
                AI-powered analytics, and real-time data for safer communities worldwide.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Github className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Contact Us</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-white/70 mr-3" />
                  <span className="text-white/80">aakash4102004@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-white/70 mr-3" />
                  <span className="text-white/80">9389874603</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-white/70 mr-3 mt-1" />
                  <span className="text-white/80">
                    VIT-AP, Vijayawada
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6">Solutions</h4>
              <div className="space-y-3">
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Live Monitoring
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Smart Alerts
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  AI Analytics
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  API Access
                </a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">
                  Support Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm mb-4 md:mb-0">
            © 2024 Smart Water Monitoring. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-white/70 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;