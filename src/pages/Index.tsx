import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Users, Calendar, MapPin, UserCog, Medal } from "lucide-react";
import heroImage from "@/assets/hero-tournament.jpg";

const Index = () => {
  const navigationCards = [
    {
      title: "Players",
      description: "Manage tournament players",
      icon: Users,
      href: "/players",
      gradient: "from-primary to-secondary",
    },
    {
      title: "Games",
      description: "Create and manage tournaments",
      icon: Trophy,
      href: "/games",
      gradient: "from-secondary to-accent",
    },
    {
      title: "Venues",
      description: "Tournament locations",
      icon: MapPin,
      href: "/venues",
      gradient: "from-accent to-primary",
    },
    {
      title: "Organizers",
      description: "Event coordinators",
      icon: UserCog,
      href: "/organizers",
      gradient: "from-primary to-accent",
    },
    {
      title: "Registrations",
      description: "Player sign-ups",
      icon: Calendar,
      href: "/registrations",
      gradient: "from-secondary to-primary",
    },
    {
      title: "Winners",
      description: "Tournament results",
      icon: Medal,
      href: "/winners",
      gradient: "from-accent to-secondary",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Tournament Arena" 
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6 px-4">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow">
              Tournament Pro
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Complete Game Tournament Management System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
          Manage Your Tournaments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationCards.map((card) => (
            <Link key={card.href} to={card.href}>
              <Card className="group relative overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 hover:shadow-glow cursor-pointer h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="p-6 space-y-4 relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                    <card.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{card.title}</h3>
                  <p className="text-muted-foreground">{card.description}</p>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Manage
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
