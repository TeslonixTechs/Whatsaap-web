import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Config {
  id: string;
  config_key: string;
  config_value: any;
  description: string;
}

interface ConfigManagerProps {
  assistantId: string;
}

const ConfigManager = ({ assistantId }: ConfigManagerProps) => {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConfigs();
  }, [assistantId]);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from("assistant_config")
        .select("*")
        .eq("assistant_id", assistantId);

      if (error) throw error;
      setConfigs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (configId: string) => {
    try {
      const config = configs.find(c => c.id === configId);
      if (!config) return;

      const { error } = await supabase
        .from("assistant_config")
        .update({
          config_value: config.config_value,
          description: config.description,
        })
        .eq("id", configId);

      if (error) throw error;

      toast({ title: "Configuración guardada" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addConfig = async () => {
    const key = prompt("Nombre de la configuración (ej: valid_postal_codes):");
    if (!key) return;

    try {
      const { error } = await supabase
        .from("assistant_config")
        .insert({
          assistant_id: assistantId,
          config_key: key,
          config_value: {},
          description: "",
        });

      if (error) throw error;

      toast({ title: "Configuración agregada" });
      loadConfigs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteConfig = async (id: string) => {
    if (!confirm("¿Eliminar esta configuración?")) return;

    try {
      const { error } = await supabase
        .from("assistant_config")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Configuración eliminada" });
      loadConfigs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Configuraciones Personalizadas</h3>
        <Button onClick={addConfig} variant="outline">
          <Plus className="w-4 h-4" />
          Agregar
        </Button>
      </div>

      {configs.length === 0 ? (
        <Card className="p-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No hay configuraciones personalizadas</p>
            <div className="bg-muted/50 p-4 rounded-lg text-left text-sm">
              <h4 className="font-semibold mb-2">Ejemplos de configuraciones:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>valid_postal_codes:</strong> ["28001", "28002", "28003"]</li>
                <li>• <strong>reference_format:</strong> "GLS-####-####"</li>
                <li>• <strong>working_hours:</strong> "Lunes a Viernes 9:00-18:00"</li>
                <li>• <strong>delivery_zones:</strong> ["Madrid", "Barcelona", "Valencia"]</li>
              </ul>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {configs.map((config) => (
            <Card key={config.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Label className="text-sm font-semibold">{config.config_key}</Label>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteConfig(config.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div>
                <Label htmlFor={`value-${config.id}`}>Valor (JSON)</Label>
                <Textarea
                  id={`value-${config.id}`}
                  value={JSON.stringify(config.config_value, null, 2)}
                  onChange={(e) => {
                    try {
                      const newValue = JSON.parse(e.target.value);
                      setConfigs(configs.map(c =>
                        c.id === config.id ? { ...c, config_value: newValue } : c
                      ));
                    } catch (e) {
                      // Invalid JSON, don't update yet
                    }
                  }}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor={`desc-${config.id}`}>Descripción</Label>
                <Input
                  id={`desc-${config.id}`}
                  value={config.description || ""}
                  onChange={(e) => {
                    setConfigs(configs.map(c =>
                      c.id === config.id ? { ...c, description: e.target.value } : c
                    ));
                  }}
                  placeholder="Descripción de esta configuración"
                />
              </div>

              <Button onClick={() => handleSave(config.id)}>
                <Save className="w-4 h-4" />
                Guardar
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConfigManager;
