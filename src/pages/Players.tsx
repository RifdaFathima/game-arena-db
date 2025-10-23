import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Player {
  id: string;
  name: string;
  age: number;
  email: string;
  created_at: string;
}

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({ name: "", age: "", email: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching players", variant: "destructive" });
    } else {
      setPlayers(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const playerData = {
      name: formData.name,
      age: parseInt(formData.age),
      email: formData.email,
    };

    if (editingPlayer) {
      const { error } = await supabase
        .from("players")
        .update(playerData)
        .eq("id", editingPlayer.id);

      if (error) {
        toast({ title: "Error updating player", variant: "destructive" });
      } else {
        toast({ title: "Player updated successfully" });
        fetchPlayers();
        handleClose();
      }
    } else {
      const { error } = await supabase.from("players").insert(playerData);

      if (error) {
        toast({ title: "Error creating player", variant: "destructive" });
      } else {
        toast({ title: "Player created successfully" });
        fetchPlayers();
        handleClose();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this player?")) return;

    const { error } = await supabase.from("players").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting player", variant: "destructive" });
    } else {
      toast({ title: "Player deleted successfully" });
      fetchPlayers();
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      age: player.age.toString(),
      email: player.email,
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingPlayer(null);
    setFormData({ name: "", age: "", email: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Players Management
          </h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingPlayer ? "Edit Player" : "Add New Player"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Player name"
                  />
                </div>
                <div>
                  <Label>Age</Label>
                  <Input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Player age"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="player@email.com"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingPlayer ? "Update" : "Create"}
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
          {players.map((player) => (
            <Card key={player.id} className="p-6 border-2 border-border hover:border-primary transition-all hover:shadow-glow">
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{player.name}</h3>
                  <p className="text-muted-foreground">Age: {player.age}</p>
                  <p className="text-muted-foreground text-sm">{player.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(player)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(player.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {players.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No players yet. Add your first player!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;
