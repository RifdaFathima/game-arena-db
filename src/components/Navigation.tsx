import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Calendar, MapPin, UserCog, Medal, Home } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const links = [
    { name: "Home", path: "/", icon: Home },
    { name: "Players", path: "/players", icon: Users },
    { name: "Games", path: "/games", icon: Trophy },
    { name: "Venues", path: "/venues", icon: MapPin },
    { name: "Organizers", path: "/organizers", icon: UserCog },
    { name: "Registrations", path: "/registrations", icon: Calendar },
    { name: "Winners", path: "/winners", icon: Medal },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Trophy className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Tournament Pro
            </span>
          </Link>
          
          <div className="flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={isActive ? "shadow-glow" : ""}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {link.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
