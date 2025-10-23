import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Registration {
  id: string;
  game_id: string;
  player_id: string;
  registration_date: string;
}

interface Game {
  id: string;
  name: string;
}

interface Player {
  id: string;
  name: string;
}

const Registrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ game_id: "", player_id: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchRegistrations();
    fetchGames();
    fetchPlayers();
  }, []);

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select("*, games(name), players(name)")
      .order("registration_date", { ascending: false });

    if (error) {
      toast({ title: "Error fetching registrations", variant: "destructive" });
    } else {
      setRegistrations(data || []);
    }
  };

  const fetchGames = async () => {
    const { data, error } = await supabase.from("games").select("id, name");
    if (!error && data) setGames(data);
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase.from("players").select("id, name");
    if (!error && data) setPlayers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const registrationData = {
      game_id: formData.game_id,
      player_id: formData.player_id,
    };

    const { error } = await supabase.from("registrations").insert(registrationData);

    if (error) {
      toast({ title: "Error creating registration", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Registration created successfully" });
      fetchRegistrations();
      handleClose();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this registration?")) return;

    const { error } = await supabase.from("registrations").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting registration", variant: "destructive" });
    } else {
      toast({ title: "Registration deleted successfully" });
      fetchRegistrations();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({ game_id: "", player_id: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Registrations Management
          </h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Registration
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl">Register Player to Game</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Game</Label>
                  <Select required value={formData.game_id} onValueChange={(value) => setFormData({ ...formData, game_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a game" />
                    </SelectTrigger>
                    <SelectContent>
                      {games.map((game) => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Player</Label>
                  <Select required value={formData.player_id} onValueChange={(value) => setFormData({ ...formData, player_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a player" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Register
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrations.map((registration: any) => (
            <Card key={registration.id} className="p-6 border-2 border-border hover:border-secondary transition-all hover:shadow-neon">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{registration.players?.name}</h3>
                    <p className="text-muted-foreground">{registration.games?.name}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Registered: {new Date(registration.registration_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(registration.id)}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {registrations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No registrations yet. Register players to games!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registrations;
