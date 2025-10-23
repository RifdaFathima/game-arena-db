import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Medal } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Winner {
  id: string;
  game_id: string;
  player_id: string;
  position: number;
  created_at: string;
}

interface Game {
  id: string;
  name: string;
}

interface Player {
  id: string;
  name: string;
}

const Winners = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingWinner, setEditingWinner] = useState<Winner | null>(null);
  const [formData, setFormData] = useState({ game_id: "", player_id: "", position: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchWinners();
    fetchGames();
    fetchPlayers();
  }, []);

  const fetchWinners = async () => {
    const { data, error } = await supabase
      .from("winners")
      .select("*, games(name), players(name)")
      .order("position", { ascending: true });

    if (error) {
      toast({ title: "Error fetching winners", variant: "destructive" });
    } else {
      setWinners(data || []);
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
    
    const winnerData = {
      game_id: formData.game_id,
      player_id: formData.player_id,
      position: parseInt(formData.position),
    };

    if (editingWinner) {
      const { error } = await supabase
        .from("winners")
        .update(winnerData)
        .eq("id", editingWinner.id);

      if (error) {
        toast({ title: "Error updating winner", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Winner updated successfully" });
        fetchWinners();
        handleClose();
      }
    } else {
      const { error } = await supabase.from("winners").insert(winnerData);

      if (error) {
        toast({ title: "Error creating winner", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Winner recorded successfully" });
        fetchWinners();
        handleClose();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this winner record?")) return;

    const { error } = await supabase.from("winners").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting winner", variant: "destructive" });
    } else {
      toast({ title: "Winner deleted successfully" });
      fetchWinners();
    }
  };

  const handleEdit = (winner: Winner) => {
    setEditingWinner(winner);
    setFormData({
      game_id: winner.game_id,
      player_id: winner.player_id,
      position: winner.position.toString(),
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingWinner(null);
    setFormData({ game_id: "", player_id: "", position: "" });
  };

  const getPositionBadge = (position: number) => {
    const colors = {
      1: "bg-gradient-to-br from-yellow-400 to-yellow-600",
      2: "bg-gradient-to-br from-gray-300 to-gray-500",
      3: "bg-gradient-to-br from-orange-400 to-orange-600",
    };
    return colors[position as keyof typeof colors] || "bg-gradient-accent";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            Winners & Results
          </h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Winner
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingWinner ? "Edit Winner" : "Record Winner"}
                </DialogTitle>
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
                <div>
                  <Label>Position</Label>
                  <Input
                    type="number"
                    required
                    min="1"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="1, 2, 3..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingWinner ? "Update" : "Record"}
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
          {winners.map((winner: any) => (
            <Card key={winner.id} className="p-6 border-2 border-border hover:border-accent transition-all hover:shadow-neon">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-lg ${getPositionBadge(winner.position)} flex items-center justify-center flex-shrink-0 shadow-glow`}>
                    <Medal className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-foreground">{winner.players?.name}</h3>
                      <span className="text-lg font-bold text-accent">#{winner.position}</span>
                    </div>
                    <p className="text-muted-foreground">{winner.games?.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(winner)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(winner.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {winners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No winners yet. Record tournament results!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Winners;
