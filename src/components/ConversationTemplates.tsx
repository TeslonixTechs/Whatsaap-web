import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, LayoutTemplate, Trash2, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ConversationTemplatesProps {
  assistantId: string;
}

const ConversationTemplates = ({ assistantId }: ConversationTemplatesProps) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    flow: "",
  });

  useEffect(() => {
    loadTemplates();
  }, [assistantId]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("conversation_templates")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("usage_count", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
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
      const flowSteps = formData.flow.split("\n").filter((s) => s.trim());
      
      const { error } = await supabase.from("conversation_templates").insert({
        assistant_id: assistantId,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        flow: flowSteps.map((step, index) => ({
          step: index + 1,
          message: step.trim(),
        })),
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Plantilla creada",
        description: "La plantilla de conversación ha sido creada",
      });

      setFormData({ name: "", description: "", category: "", flow: "" });
      setDialogOpen(false);
      loadTemplates();
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
        .from("conversation_templates")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Plantilla activada" : "Plantilla desactivada",
      });

      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const duplicateTemplate = async (template: any) => {
    try {
      const { error } = await supabase.from("conversation_templates").insert({
        assistant_id: assistantId,
        name: `${template.name} (Copia)`,
        description: template.description,
        category: template.category,
        flow: template.flow,
        is_active: false,
      });

      if (error) throw error;

      toast({
        title: "Plantilla duplicada",
      });

      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase.from("conversation_templates").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Plantilla eliminada",
      });

      loadTemplates();
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
          <h2 className="text-2xl font-bold">Plantillas de Conversación</h2>
          <p className="text-muted-foreground">Flujos pre-construidos para casos comunes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Plantilla de Conversación</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Proceso de reserva"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Categoría</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ej: Ventas, Soporte, Reservas"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe cuándo usar esta plantilla..."
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Flujo (un mensaje por línea)</label>
                <Textarea
                  value={formData.flow}
                  onChange={(e) => setFormData({ ...formData, flow: e.target.value })}
                  placeholder="¡Hola! Bienvenido a nuestro servicio&#10;¿En qué puedo ayudarte hoy?&#10;Perfecto, déjame ayudarte con eso..."
                  rows={8}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Cada línea será un paso en la conversación
                </p>
              </div>

              <Button type="submit" className="w-full">Crear Plantilla</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutTemplate className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{template.name}</h3>
                  {template.is_active && <Badge>Activa</Badge>}
                  {template.category && (
                    <Badge variant="outline">{template.category}</Badge>
                  )}
                </div>

                {template.description && (
                  <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                )}
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Flujo de conversación:</p>
                  <div className="space-y-1 pl-4 border-l-2 border-primary/20">
                    {template.flow?.slice(0, 3).map((step: any, idx: number) => (
                      <p key={idx} className="text-sm">
                        {step.step}. {step.message}
                      </p>
                    ))}
                    {template.flow?.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        ... y {template.flow.length - 3} pasos más
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span>📊 Usado {template.usage_count || 0} veces</span>
                  <span>💬 {template.flow?.length || 0} pasos</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => duplicateTemplate(template)}
                  title="Duplicar"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Switch
                  checked={template.is_active}
                  onCheckedChange={() => toggleActive(template.id, template.is_active)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteTemplate(template.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {templates.length === 0 && (
          <Card className="p-12 text-center">
            <LayoutTemplate className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No hay plantillas de conversación</h3>
            <p className="text-muted-foreground mb-4">Crea flujos pre-construidos para agilizar las respuestas</p>
            <Button onClick={() => setDialogOpen(true)}>Crear Plantilla</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConversationTemplates;
