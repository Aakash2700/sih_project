import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Droplets, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: "Dashboard", href: "#dashboard" },
    { name: "Features", href: "#features" },
    { name: "Analytics", href: "#analytics" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border shadow-soft animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Droplets className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Smart Water</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, i) => (
              link.name === 'Dashboard' ? (
                <Link
                  key={link.name}
                  to={user ? '/dashboard' : '/auth'}
                  className="text-muted-foreground hover:text-primary transition-colors font-medium animate-fade-in-down"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors font-medium animate-fade-in-down"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {link.name}
                </a>
              )
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {!user ? (
              <>
                <Button asChild variant="ghost" size="sm" className="hover-glow">
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild size="sm" className="hover-glow shadow-button">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground">{user.username} ({user.role})</span>
                <Button size="sm" onClick={logout}>Logout</Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4 animate-fade-in">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link, i) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 animate-fade-in-down"
                  style={{ animationDelay: `${i * 100}ms` }}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <div className="flex flex-col space-y-2 pt-3 border-t border-border">
                {!user ? (
                  <>
                    <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>Login</Link>
                    </Button>
                    <Button asChild size="sm" className="w-full">
                      <Link to="/auth" onClick={() => setIsOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm" className="w-full justify-start">
                      <Link to={user.role === 'admin' ? '/dashboard' : '/'} onClick={() => setIsOpen(false)}>View Dashboard</Link>
                    </Button>
                    <Button size="sm" className="w-full" onClick={() => { logout(); setIsOpen(false); }}>Logout</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;