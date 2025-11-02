import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Brain, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

interface IntentsManagerProps {
  assistantId: string;
}

const IntentsManager = ({ assistantId }: IntentsManagerProps) => {
  const [intents, setIntents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    examples: "",
    response: "",
    confidence: 0.7,
  });

  useEffect(() => {
    loadIntents();
  }, [assistantId]);

  const loadIntents = async () => {
    try {
      const { data, error } = await supabase
        .from("intents")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIntents(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const examples = formData.examples.split("\n").map(e => e.trim()).filter(e => e);
      
      const { error } = await supabase.from("intents").insert({
        assistant_id: assistantId,
        name: formData.name,
        description: formData.description,
        examples,
        response: formData.response,
        confidence_threshold: formData.confidence,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Intent creado",
        description: "La intención ha sido creada correctamente",
      });

      setFormData({
        name: "",
        description: "",
        examples: "",
        response: "",
        confidence: 0.7,
      });
      setDialogOpen(false);
      loadIntents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("intents")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Intent activado" : "Intent desactivado",
      });

      loadIntents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteIntent = async (id: string) => {
    try {
      const { error } = await supabase.from("intents").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Intent eliminado",
      });

      loadIntents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Intents & Entities</h2>
          <p className="text-muted-foreground">Configura intenciones del bot</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Intent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Intent</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: consulta_precio"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Cuando el usuario pregunta por precios"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Ejemplos (uno por línea)</label>
                <Textarea
                  value={formData.examples}
                  onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                  placeholder="¿Cuánto cuesta?&#10;¿Qué precio tiene?&#10;¿Cuál es el costo?"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Respuesta</label>
                <Textarea
                  value={formData.response}
                  onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                  placeholder="Nuestros precios van desde..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Umbral de confianza: {formData.confidence.toFixed(2)}
                </label>
                <Slider
                  value={[formData.confidence]}
                  onValueChange={([value]) => setFormData({ ...formData, confidence: value })}
                  min={0.1}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nivel de certeza mínimo para activar este intent
                </p>
              </div>

              <Button type="submit" className="w-full">Crear Intent</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {intents.map((intent) => (
          <Card key={intent.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{intent.name}</h3>
                  {intent.is_active && <Badge>Activo</Badge>}
                </div>
                {intent.description && (
                  <p className="text-sm text-muted-foreground mb-3">{intent.description}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Ejemplos:</span>
                    <Badge variant="outline">{intent.examples?.length || 0}</Badge>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Confianza mínima: </span>
                    <span className="font-medium">{(intent.confidence_threshold * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={intent.is_active}
                  onCheckedChange={() => toggleActive(intent.id, intent.is_active)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteIntent(intent.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {intents.length === 0 && (
          <Card className="p-12 text-center">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No hay intents configurados</h3>
            <p className="text-muted-foreground mb-4">Crea intents para mejorar la comprensión del bot</p>
            <Button onClick={() => setDialogOpen(true)}>Crear Intent</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default IntentsManager;
