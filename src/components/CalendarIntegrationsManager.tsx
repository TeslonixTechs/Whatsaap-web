import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, Plus, Trash2, Power, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface CalendarIntegration {
  id: string;
  name: string;
  provider: string;
  is_active: boolean;
  sync_enabled: boolean;
  last_sync: string | null;
  config: any;
}

const CalendarIntegrationsManager = ({ assistantId }: { assistantId: string }) => {
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    provider: "google",
    calendar_url: "",
    api_key: "",
    api_secret: "",
    sync_enabled: true,
  });

  useEffect(() => {
    loadIntegrations();
  }, [assistantId]);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from("calendar_integrations")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error: any) {
      console.error("Error loading integrations:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las integraciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from("calendar_integrations").insert({
        assistant_id: assistantId,
        name: formData.name,
        provider: formData.provider,
        credentials: {
          api_key: formData.api_key,
          api_secret: formData.api_secret,
        },
        config: {
          calendar_url: formData.calendar_url,
        },
        sync_enabled: formData.sync_enabled,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Integración agregada",
        description: "La integración de calendario se ha configurado correctamente",
      });

      setDialogOpen(false);
      loadIntegrations();
      setFormData({
        name: "",
        provider: "google",
        calendar_url: "",
        api_key: "",
        api_secret: "",
        sync_enabled: true,
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
        .from("calendar_integrations")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: currentStatus ? "Integración desactivada" : "Integración activada",
      });

      loadIntegrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleSync = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("calendar_integrations")
        .update({ sync_enabled: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: currentStatus ? "Sincronización desactivada" : "Sincronización activada",
      });

      loadIntegrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteIntegration = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta integración?")) return;

    try {
      const { error } = await supabase
        .from("calendar_integrations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Integración eliminada",
      });

      loadIntegrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const syncNow = async (id: string) => {
    toast({
      title: "Sincronizando...",
      description: "Esto puede tardar unos segundos",
    });

    try {
      const { error } = await supabase
        .from("calendar_integrations")
        .update({ last_sync: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sincronización completada",
      });

      loadIntegrations();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Integraciones de Calendario
          </h2>
          <p className="text-muted-foreground">
            Conecta calendarios externos para gestionar disponibilidad automáticamente
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Integración
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Integración de Calendario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Google Calendar Principal"
                />
              </div>

              <div>
                <Label>Proveedor</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Calendar</SelectItem>
                    <SelectItem value="outlook">Outlook Calendar</SelectItem>
                    <SelectItem value="caldav">CalDAV</SelectItem>
                    <SelectItem value="ical">iCal URL</SelectItem>
                    <SelectItem value="custom">API Personalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>URL del Calendario (opcional)</Label>
                <Input
                  value={formData.calendar_url}
                  onChange={(e) => setFormData({ ...formData, calendar_url: e.target.value })}
                  placeholder="https://calendar.google.com/..."
                />
              </div>

              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder="Tu API Key"
                />
              </div>

              <div>
                <Label>API Secret (opcional)</Label>
                <Input
                  type="password"
                  value={formData.api_secret}
                  onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                  placeholder="Tu API Secret"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.sync_enabled}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, sync_enabled: checked })
                  }
                />
                <Label>Sincronización automática habilitada</Label>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                Guardar Integración
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {integrations.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarClock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay integraciones configuradas</h3>
          <p className="text-muted-foreground mb-4">
            Conecta calendarios externos para gestionar reservas automáticamente
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primera Integración
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {integrations.map((integration) => (
            <Card key={integration.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{integration.name}</h3>
                    <Badge variant={integration.is_active ? "default" : "secondary"}>
                      {integration.is_active ? "Activa" : "Inactiva"}
                    </Badge>
                    <Badge variant="outline">{integration.provider}</Badge>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      Sincronización: {integration.sync_enabled ? "Habilitada" : "Deshabilitada"}
                    </p>
                    {integration.last_sync && (
                      <p>
                        Última sincronización:{" "}
                        {new Date(integration.last_sync).toLocaleString("es-ES")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => syncNow(integration.id)}
                    disabled={!integration.is_active}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSync(integration.id, integration.sync_enabled)}
                  >
                    <CalendarClock className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(integration.id, integration.is_active)}
                  >
                    <Power className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteIntegration(integration.id)}
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

export default CalendarIntegrationsManager;
