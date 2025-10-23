import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, UserCog } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Organizer {
  id: string;
  name: string;
  phone_no: string;
  game_id: string;
  created_at: string;
}

interface Game {
  id: string;
  name: string;
}

const Organizers = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingOrganizer, setEditingOrganizer] = useState<Organizer | null>(null);
  const [formData, setFormData] = useState({ name: "", phone_no: "", game_id: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizers();
    fetchGames();
  }, []);

  const fetchOrganizers = async () => {
    const { data, error } = await supabase
      .from("organizers")
      .select("*, games(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching organizers", variant: "destructive" });
    } else {
      setOrganizers(data || []);
    }
  };

  const fetchGames = async () => {
    const { data, error } = await supabase.from("games").select("id, name");
    if (!error && data) setGames(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const organizerData = {
      name: formData.name,
      phone_no: formData.phone_no,
      game_id: formData.game_id || null,
    };

    if (editingOrganizer) {
      const { error } = await supabase
        .from("organizers")
        .update(organizerData)
        .eq("id", editingOrganizer.id);

      if (error) {
        toast({ title: "Error updating organizer", variant: "destructive" });
      } else {
        toast({ title: "Organizer updated successfully" });
        fetchOrganizers();
        handleClose();
      }
    } else {
      const { error } = await supabase.from("organizers").insert(organizerData);

      if (error) {
        toast({ title: "Error creating organizer", variant: "destructive" });
      } else {
        toast({ title: "Organizer created successfully" });
        fetchOrganizers();
        handleClose();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this organizer?")) return;

    const { error } = await supabase.from("organizers").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting organizer", variant: "destructive" });
    } else {
      toast({ title: "Organizer deleted successfully" });
      fetchOrganizers();
    }
  };

  const handleEdit = (organizer: Organizer) => {
    setEditingOrganizer(organizer);
    setFormData({
      name: organizer.name,
      phone_no: organizer.phone_no,
      game_id: organizer.game_id || "",
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingOrganizer(null);
    setFormData({ name: "", phone_no: "", game_id: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            Organizers Management
          </h1>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add Organizer
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-2 border-border">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingOrganizer ? "Edit Organizer" : "Add New Organizer"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Organizer name"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    required
                    value={formData.phone_no}
                    onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <Label>Game (Optional)</Label>
                  <Select value={formData.game_id} onValueChange={(value) => setFormData({ ...formData, game_id: value })}>
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
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingOrganizer ? "Update" : "Create"}
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
          {organizers.map((organizer: any) => (
            <Card key={organizer.id} className="p-6 border-2 border-border hover:border-accent transition-all hover:shadow-neon">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-accent flex items-center justify-center flex-shrink-0">
                    <UserCog className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground">{organizer.name}</h3>
                    <p className="text-muted-foreground">{organizer.phone_no}</p>
                    {organizer.games && (
                      <p className="text-sm text-muted-foreground">Game: {organizer.games.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(organizer)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(organizer.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {organizers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No organizers yet. Add your first organizer!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Organizers;
