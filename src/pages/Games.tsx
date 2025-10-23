import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Trophy } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Game {
  id: string;
  name: string;
  description: string;
  date: string;
  venue_id: string;
  created_at: string;
}

interface Venue {
  id: string;
  name: string;
}

const Games = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", date: "", venue_id: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchGames();
    fetchVenues();
  }, []);

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from("games")
      .select("*, venues(name)")
      .order("date", { ascending: false });

    if (error) {
      toast({ title: "Error fetching games", variant: "destructive" });
    } else {
      setGames(data || []);
    }
  };

  const fetchVenues = async () => {
    const { data, error } = await supabase.from("venues").select("id, name");
    if (!error && data) setVenues(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const gameData = {
      name: formData.name,
      description: formData.description,
      date: formData.date,
      venue_id: formData.venue_id || null,
    };

    if (editingGame) {
      const { error } = await supabase
        .from("games")
        .update(gameData)
        .eq("id", editingGame.id);

      if (error) {
        toast({ title: "Error updating game", variant: "destructive" });
      } else {
        toast({ title: "Game updated successfully" });
        fetchGames();
        handleClose();
      }
    } else {
      const { error } = await supabase.from("games").insert(gameData);

      if (error) {
        toast({ title: "Error creating game", variant: "destructive" });
      } else {
        toast({ title: "Game created successfully" });
        fetchGames();
        handleClose();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;

    const { error } = await supabase.from("games").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting game", variant: "destructive" });
    } else {
      toast({ title: "Game deleted successfully" });
      fetchGames();
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      description: game.description || "",
      date: game.date.split('T')[0],
      venue_id: game.venue_id || "",
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingGame(null);
    setFormData({ name: "", description: "", date: "", venue_id: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Games & Tournaments
          </h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingGame ? "Edit Game" : "Add New Game"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tournament name"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tournament details"
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Venue</Label>
                  <Select value={formData.venue_id} onValueChange={(value) => setFormData({ ...formData, venue_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingGame ? "Update" : "Create"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {games.map((game: any) => (
            <Card key={game.id} className="p-6 border-2 border-border hover:border-secondary transition-all hover:shadow-neon">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground">{game.name}</h3>
                    <p className="text-muted-foreground text-sm">{game.description}</p>
                    <p className="text-muted-foreground mt-2">
                      Date: {new Date(game.date).toLocaleDateString()}
                    </p>
                    {game.venues && (
                      <p className="text-muted-foreground">Venue: {game.venues.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(game)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(game.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {games.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No games yet. Create your first tournament!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
