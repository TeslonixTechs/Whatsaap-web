import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Trash2, Power, MessageSquare, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NotificationTrigger {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: any;
  message_template: string;
  is_active: boolean;
}

const NotificationTriggersManager = ({ assistantId }: { assistantId: string }) => {
  const [triggers, setTriggers] = useState<NotificationTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trigger_type: "status_change",
    trigger_config: {
      target_status: "completed",
      hours_before: "24",
    },
    message_template: "",
  });

  useEffect(() => {
    loadTriggers();
  }, [assistantId]);

  const loadTriggers = async () => {
    try {
      const { data, error } = await supabase
        .from("notification_triggers")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTriggers(data || []);
    } catch (error: any) {
      console.error("Error loading triggers:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los triggers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from("notification_triggers").insert({
        assistant_id: assistantId,
        name: formData.name,
        description: formData.description || null,
        trigger_type: formData.trigger_type,
        trigger_config: formData.trigger_config,
        message_template: formData.message_template,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Trigger creado",
        description: "El trigger de notificación se ha configurado correctamente",
      });

      setDialogOpen(false);
      loadTriggers();
      setFormData({
        name: "",
        description: "",
        trigger_type: "status_change",
        trigger_config: {
          target_status: "completed",
          hours_before: "24",
        },
        message_template: "",
      });
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
        .from("notification_triggers")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: currentStatus ? "Trigger desactivado" : "Trigger activado",
      });

      loadTriggers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTrigger = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este trigger?")) return;

    try {
      const { error } = await supabase
        .from("notification_triggers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Trigger eliminado",
      });

      loadTriggers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTriggerTypeLabel = (type: string) => {
    switch (type) {
      case "booking_confirmed":
        return "Reserva Confirmada";
      case "booking_reminder":
        return "Recordatorio de Reserva";
      case "status_change":
        return "Cambio de Estado";
      case "custom_event":
        return "Evento Personalizado";
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-sm">
          <strong>⚠️ Importante - Políticas de WhatsApp:</strong>
          <br />
          Solo se pueden enviar notificaciones automáticas a clientes que hayan iniciado una conversación 
          por WhatsApp en las últimas 24 horas. Si el cliente reservó por teléfono o web sin escribir 
          por WhatsApp, estas notificaciones NO se enviarán automáticamente.
          <br />
          <span className="text-xs text-muted-foreground mt-1 block">
            💡 Próximamente: Integración SMS para clientes sin WhatsApp activo
          </span>
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notificaciones Automáticas
          </h2>
          <p className="text-muted-foreground">
            Configura mensajes automáticos que se envían cuando ocurre un evento
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Trigger
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Trigger de Notificación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre del Trigger *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Notificar trabajo completado"
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descripción del trigger"
                />
              </div>

              <div>
                <Label>Tipo de Evento *</Label>
                <Select
                  value={formData.trigger_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, trigger_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="booking_confirmed">Reserva Confirmada</SelectItem>
                    <SelectItem value="booking_reminder">Recordatorio de Reserva</SelectItem>
                    <SelectItem value="status_change">Cambio de Estado</SelectItem>
                    <SelectItem value="custom_event">Evento Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.trigger_type === "status_change" && (
                <div>
                  <Label>Estado Objetivo</Label>
                  <Select
                    value={formData.trigger_config.target_status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        trigger_config: { ...formData.trigger_config, target_status: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.trigger_type === "booking_reminder" && (
                <div>
                  <Label>Horas antes del evento</Label>
                  <Input
                    type="number"
                    value={formData.trigger_config.hours_before}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        trigger_config: {
                          ...formData.trigger_config,
                          hours_before: e.target.value,
                        },
                      })
                    }
                    placeholder="24"
                  />
                </div>
              )}

              <div>
                <Label>Plantilla del Mensaje *</Label>
                <Textarea
                  value={formData.message_template}
                  onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                  placeholder="Hola {{customer_name}}, tu {{service_type}} está listo. Puedes pasar a recogerlo. ¡Gracias!"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Variables disponibles: {`{{customer_name}}, {{customer_phone}}, {{service_type}}, {{price}}, {{start_time}}, {{end_time}}`}
                </p>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                Crear Trigger
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {triggers.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay triggers configurados</h3>
          <p className="text-muted-foreground mb-4">
            Crea triggers para enviar notificaciones automáticas por WhatsApp
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Primer Trigger
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {triggers.map((trigger) => (
            <Card key={trigger.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{trigger.name}</h3>
                    <Badge variant={trigger.is_active ? "default" : "secondary"}>
                      {trigger.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                    <Badge variant="outline">{getTriggerTypeLabel(trigger.trigger_type)}</Badge>
                  </div>

                  {trigger.description && (
                    <p className="text-sm text-muted-foreground mb-3">{trigger.description}</p>
                  )}

                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm font-mono">{trigger.message_template}</p>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    <strong>Config:</strong> {JSON.stringify(trigger.trigger_config)}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(trigger.id, trigger.is_active)}
                  >
                    <Power className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteTrigger(trigger.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationTriggersManager;
