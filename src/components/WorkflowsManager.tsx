import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Workflow, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface WorkflowsManagerProps {
  assistantId: string;
}

const WorkflowsManager = ({ assistantId }: WorkflowsManagerProps) => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger_type: "keyword",
    trigger_value: "",
    action_type: "send_message",
    action_value: "",
  });

  useEffect(() => {
    loadWorkflows();
  }, [assistantId]);

  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
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
      const { error } = await supabase.from("workflows").insert({
        assistant_id: assistantId,
        name: formData.name,
        description: formData.description,
        trigger_type: formData.trigger_type,
        trigger_value: { value: formData.trigger_value },
        actions: [
          {
            type: formData.action_type,
            value: formData.action_value,
          },
        ],
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Flujo creado",
        description: "El flujo automatizado ha sido creado",
      });

      setFormData({
        name: "",
        description: "",
        trigger_type: "keyword",
        trigger_value: "",
        action_type: "send_message",
        action_value: "",
      });
      setDialogOpen(false);
      loadWorkflows();
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
        .from("workflows")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Flujo activado" : "Flujo desactivado",
      });

      loadWorkflows();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase.from("workflows").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Flujo eliminado",
      });

      loadWorkflows();
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
          <h2 className="text-2xl font-bold">Flujos Automatizados</h2>
          <p className="text-muted-foreground">Crea workflows con triggers y acciones</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Flujo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Flujo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Respuesta automática a 'Hola'"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe qué hace este flujo..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Trigger</label>
                  <Select value={formData.trigger_type} onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keyword">Palabra clave</SelectItem>
                      <SelectItem value="tag">Etiqueta</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Valor del trigger</label>
                  <Input
                    value={formData.trigger_value}
                    onChange={(e) => setFormData({ ...formData, trigger_value: e.target.value })}
                    placeholder={
                      formData.trigger_type === "keyword"
                        ? "Ej: hola, ayuda"
                        : formData.trigger_type === "tag"
                        ? "Ej: interesado"
                        : "Ej: mensaje_recibido"
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Acción</label>
                  <Select value={formData.action_type} onValueChange={(value) => setFormData({ ...formData, action_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_message">Enviar mensaje</SelectItem>
                      <SelectItem value="add_tag">Añadir etiqueta</SelectItem>
                      <SelectItem value="notify_operator">Notificar operador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Valor de la acción</label>
                  <Input
                    value={formData.action_value}
                    onChange={(e) => setFormData({ ...formData, action_value: e.target.value })}
                    placeholder={
                      formData.action_type === "send_message"
                        ? "El mensaje a enviar"
                        : formData.action_type === "add_tag"
                        ? "Nombre de la etiqueta"
                        : "Email del operador"
                    }
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">Crear Flujo</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <Card key={workflow.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Workflow className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{workflow.name}</h3>
                  {workflow.is_active && <Badge>Activo</Badge>}
                </div>
                {workflow.description && (
                  <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                )}
                
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Trigger: </span>
                    <Badge variant="outline">{workflow.trigger_type}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Acciones: </span>
                    <Badge variant="outline">{workflow.actions?.length || 0}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={workflow.is_active}
                  onCheckedChange={() => toggleActive(workflow.id, workflow.is_active)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteWorkflow(workflow.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {workflows.length === 0 && (
          <Card className="p-12 text-center">
            <Workflow className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No hay flujos automatizados</h3>
            <p className="text-muted-foreground mb-4">Crea tu primer flujo automático</p>
            <Button onClick={() => setDialogOpen(true)}>Crear Flujo</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WorkflowsManager;
