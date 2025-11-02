import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Webhook, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface WebhooksManagerProps {
  assistantId: string;
}

interface WebhookType {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret: string | null;
}

const availableEvents = [
  { value: "conversation.started", label: "Conversación iniciada" },
  { value: "conversation.ended", label: "Conversación finalizada" },
  { value: "message.received", label: "Mensaje recibido" },
  { value: "message.sent", label: "Mensaje enviado" },
  { value: "rating.submitted", label: "Calificación recibida" },
];

const WebhooksManager = ({ assistantId }: WebhooksManagerProps) => {
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: [] as string[],
    secret: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadWebhooks();
  }, [assistantId]);

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("name");

      if (error) throw error;
      setWebhooks(data || []);
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

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      events: [],
      secret: "",
      is_active: true,
    });
    setEditingId(null);
  };

  const handleEdit = (webhook: WebhookType) => {
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret || "",
      is_active: webhook.is_active,
    });
    setEditingId(webhook.id);
  };

  const toggleEvent = (event: string) => {
    setFormData({
      ...formData,
      events: formData.events.includes(event)
        ? formData.events.filter((e) => e !== event)
        : [...formData.events, event],
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      toast({
        title: "Error",
        description: "El nombre y URL son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (formData.events.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos un evento",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = {
        assistant_id: assistantId,
        name: formData.name.trim(),
        url: formData.url.trim(),
        events: formData.events,
        secret: formData.secret.trim() || null,
        is_active: formData.is_active,
      };

      if (editingId) {
        const { error } = await supabase
          .from("webhooks")
          .update(data)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Webhook actualizado",
          description: "El webhook se actualizó correctamente",
        });
      } else {
        const { error } = await supabase
          .from("webhooks")
          .insert(data);

        if (error) throw error;

        toast({
          title: "Webhook creado",
          description: "El webhook se creó correctamente",
        });
      }

      resetForm();
      loadWebhooks();
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
        .from("webhooks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Webhook eliminado",
        description: "El webhook se eliminó correctamente",
      });

      loadWebhooks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Webhook className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Webhooks</h3>
      </div>

      <div className="space-y-6">
        <Card className="p-4 bg-muted/50">
          <h4 className="text-sm font-semibold mb-4">
            {editingId ? "Editar Webhook" : "Nuevo Webhook"}
          </h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Notificación CRM"
              />
            </div>

            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://tu-servidor.com/webhook"
              />
            </div>

            <div>
              <Label htmlFor="secret">Secret (opcional)</Label>
              <Input
                id="secret"
                type="password"
                value={formData.secret}
                onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                placeholder="Para verificar la autenticidad"
              />
            </div>

            <div>
              <Label className="mb-2 block">Eventos</Label>
              <div className="space-y-2">
                {availableEvents.map((event) => (
                  <div key={event.value} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.events.includes(event.value)}
                      onCheckedChange={() => toggleEvent(event.value)}
                    />
                    <label className="text-sm">{event.label}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Activo</Label>
              </div>

              <div className="flex gap-2">
                {editingId && (
                  <Button variant="outline" onClick={resetForm}>
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                )}
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  {editingId ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div>
          <h4 className="text-sm font-medium mb-3">Webhooks Configurados</h4>
          {webhooks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay webhooks configurados aún
            </p>
          ) : (
            <div className="space-y-2">
              {webhooks.map((webhook) => (
                <Card key={webhook.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium">{webhook.name}</h5>
                        {!webhook.is_active && (
                          <span className="text-xs text-muted-foreground">(Inactivo)</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {webhook.url}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <span
                            key={event}
                            className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                          >
                            {availableEvents.find((e) => e.value === event)?.label || event}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(webhook)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(webhook.id)}
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
      </div>
    </Card>
  );
};

export default WebhooksManager;