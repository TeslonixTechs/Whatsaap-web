import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plug, Plus, Trash2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CRMIntegration {
  id: string;
  crm_type: string;
  is_active: boolean;
  last_sync: string | null;
}

const CRMIntegrations = () => {
  const [integrations, setIntegrations] = useState<CRMIntegration[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    crm_type: "",
    api_key: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("crm_integrations")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error: any) {
      console.error("Error loading CRM integrations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("crm_integrations")
        .insert([{
          user_id: user.id,
          crm_type: formData.crm_type,
          api_key_encrypted: formData.api_key, // En producción, encriptar
          config: {},
        }]);

      if (error) throw error;

      toast({ title: "Integración agregada" });
      setDialogOpen(false);
      setFormData({ crm_type: "", api_key: "" });
      loadIntegrations();
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
        .from("crm_integrations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Integración eliminada" });
      loadIntegrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSync = async (id: string) => {
    try {
      const { error } = await supabase
        .from("crm_integrations")
        .update({ last_sync: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Sincronización iniciada" });
      loadIntegrations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const crmLogos = {
    salesforce: "🔷",
    hubspot: "🟠",
    zoho: "🔴",
    pipedrive: "🟢",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Integraciones CRM</h3>
          <p className="text-muted-foreground">Conecta con tu CRM favorito</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Integración
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Conectar CRM</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>CRM</Label>
                <Select value={formData.crm_type} onValueChange={(value) => setFormData({ ...formData, crm_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un CRM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salesforce">Salesforce</SelectItem>
                    <SelectItem value="hubspot">HubSpot</SelectItem>
                    <SelectItem value="zoho">Zoho CRM</SelectItem>
                    <SelectItem value="pipedrive">Pipedrive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder="Ingresa tu API key"
                  required
                />
              </div>
              <Button type="submit" className="w-full">Conectar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.id} className="p-6 hover:shadow-hover transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-4xl">
                  {crmLogos[integration.crm_type as keyof typeof crmLogos] || "📊"}
                </div>
                <div>
                  <h4 className="font-semibold capitalize">{integration.crm_type}</h4>
                  <span className={`text-xs ${integration.is_active ? "text-green-600" : "text-gray-500"}`}>
                    {integration.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSync(integration.id)}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(integration.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {integration.last_sync && (
              <p className="text-xs text-muted-foreground">
                Última sincronización: {new Date(integration.last_sync).toLocaleString()}
              </p>
            )}
          </Card>
        ))}

        {integrations.length === 0 && (
          <Card className="p-12 col-span-full text-center">
            <Plug className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No hay integraciones configuradas. Conecta tu CRM para sincronizar contactos.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CRMIntegrations;
