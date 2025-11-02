import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Webhook, Plus, Copy, Trash2, Power, Eye, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IncomingWebhook {
  id: string;
  name: string;
  webhook_url: string;
  secret_key: string;
  is_active: boolean;
  last_trigger: string | null;
  total_calls: number;
  failed_calls: number;
}

interface WebhookLog {
  id: string;
  payload: any;
  status: string;
  error_message: string | null;
  processing_time_ms: number;
  created_at: string;
}

const IncomingWebhooksManager = ({ assistantId }: { assistantId: string }) => {
  const [webhooks, setWebhooks] = useState<IncomingWebhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    loadWebhooks();
  }, [assistantId]);

  useEffect(() => {
    if (selectedWebhook) {
      loadLogs(selectedWebhook);
    }
  }, [selectedWebhook]);

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from("incoming_webhooks")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error: any) {
      console.error("Error loading webhooks:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los webhooks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (webhookId: string) => {
    try {
      const { data, error } = await supabase
        .from("incoming_webhook_logs")
        .select("*")
        .eq("webhook_id", webhookId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error("Error loading logs:", error);
    }
  };

  const generateSecretKey = () => {
    return `whk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  };

  const generateWebhookUrl = () => {
    return `wh_${Math.random().toString(36).substring(2, 10)}`;
  };

  const handleSubmit = async () => {
    try {
      const webhookUrl = generateWebhookUrl();
      const secretKey = generateSecretKey();

      const { error } = await supabase.from("incoming_webhooks").insert({
        assistant_id: assistantId,
        name: formData.name,
        webhook_url: webhookUrl,
        secret_key: secretKey,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Webhook creado",
        description: "El webhook entrante se ha configurado correctamente",
      });

      setDialogOpen(false);
      loadWebhooks();
      setFormData({ name: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Se ha copiado al portapapeles",
    });
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("incoming_webhooks")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: currentStatus ? "Webhook desactivado" : "Webhook activado",
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

  const deleteWebhook = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este webhook?")) return;

    try {
      const { error } = await supabase
        .from("incoming_webhooks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Webhook eliminado",
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

  const getFullWebhookUrl = (webhookUrl: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/incoming-webhook/${webhookUrl}`;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Webhook className="w-6 h-6 text-primary" />
            Webhooks Entrantes (CRM)
          </h2>
          <p className="text-muted-foreground">
            Recibe actualizaciones desde tu CRM o sistema externo
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Webhook Entrante</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre del Webhook</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="Ej: Salesforce Integration"
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Crear Webhook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {webhooks.length === 0 ? (
        <Card className="p-12 text-center">
          <Webhook className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay webhooks configurados</h3>
          <p className="text-muted-foreground mb-4">
            Crea un webhook para recibir actualizaciones de tu CRM
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Primer Webhook
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-6">
              <Tabs defaultValue="config">
                <TabsList className="mb-4">
                  <TabsTrigger value="config">Configuración</TabsTrigger>
                  <TabsTrigger value="logs" onClick={() => setSelectedWebhook(webhook.id)}>
                    Logs ({webhook.total_calls})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="config">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{webhook.name}</h3>
                          <Badge variant={webhook.is_active ? "default" : "secondary"}>
                            {webhook.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            Total llamadas: {webhook.total_calls} | Fallidas: {webhook.failed_calls}
                          </p>
                          {webhook.last_trigger && (
                            <p>
                              Última ejecución:{" "}
                              {new Date(webhook.last_trigger).toLocaleString("es-ES")}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(webhook.id, webhook.is_active)}
                        >
                          <Power className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteWebhook(webhook.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>URL del Webhook</Label>
                      <div className="flex gap-2">
                        <Input value={getFullWebhookUrl(webhook.webhook_url)} readOnly />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(getFullWebhookUrl(webhook.webhook_url))}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Secret Key (para header x-webhook-secret)</Label>
                      <div className="flex gap-2">
                        <Input type="password" value={webhook.secret_key} readOnly />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(webhook.secret_key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-md">
                      <h4 className="font-semibold mb-2">Ejemplo de uso (cURL):</h4>
                      <pre className="text-xs overflow-x-auto">
{`curl -X POST ${getFullWebhookUrl(webhook.webhook_url)} \\
  -H "Content-Type: application/json" \\
  -H "x-webhook-secret: ${webhook.secret_key}" \\
  -d '{
    "action": "status_changed",
    "data": {
      "booking_id": "uuid-here",
      "status": "completed"
    }
  }'`}
                      </pre>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logs">
                  <div className="space-y-2">
                    <div className="flex justify-end mb-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadLogs(webhook.id)}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                      </Button>
                    </div>
                    {logs.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No hay logs todavía
                      </p>
                    ) : (
                      logs.map((log) => (
                        <Card key={log.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant={
                                    log.status === "success"
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {log.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(log.created_at).toLocaleString("es-ES")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {log.processing_time_ms}ms
                                </span>
                              </div>
                              {log.error_message && (
                                <p className="text-sm text-destructive mb-2">
                                  {log.error_message}
                                </p>
                              )}
                              <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.payload, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Webhook className="w-5 h-5 text-blue-600" />
          Acciones soportadas
        </h3>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>
            • <code>booking_created</code>: Crear nueva reserva
          </li>
          <li>
            • <code>booking_updated</code>: Actualizar reserva existente
          </li>
          <li>
            • <code>status_changed</code>: Cambiar estado de reserva (dispara notificaciones)
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default IncomingWebhooksManager;
