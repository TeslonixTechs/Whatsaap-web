import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, Filter, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Segment {
  id: string;
  name: string;
  description: string;
  filters: any;
  customer_count: number;
}

const CustomerSegmentation = () => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    filters: "{}",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("customer_segments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSegments(data || []);
    } catch (error: any) {
      console.error("Error loading segments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("customer_segments")
        .insert([{
          ...formData,
          user_id: user.id,
          filters: JSON.parse(formData.filters),
        }]);

      if (error) throw error;

      toast({ title: "Segmento creado" });
      setDialogOpen(false);
      setFormData({ name: "", description: "", filters: "{}" });
      loadSegments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("customer_segments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Segmento eliminado" });
      loadSegments();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Segmentación de Clientes</h3>
          <p className="text-muted-foreground">Organiza y segmenta tus contactos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Segmento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Segmento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Filtros (JSON)</Label>
                <Textarea
                  value={formData.filters}
                  onChange={(e) => setFormData({ ...formData, filters: e.target.value })}
                  rows={4}
                  placeholder='{"tags": ["vip"], "last_message_days": 30}'
                />
              </div>
              <Button type="submit" className="w-full">Crear Segmento</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {segments.map((segment) => (
          <Card key={segment.id} className="p-6 hover:shadow-hover transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Filter className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{segment.name}</h4>
                  <p className="text-xs text-muted-foreground">{segment.description}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(segment.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{segment.customer_count} contactos</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomerSegmentation;
