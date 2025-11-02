import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Code, Copy, Key, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const APIManager = ({ assistantId }: { assistantId: string }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadApiKey();
  }, [assistantId]);

  const loadApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from("assistant_config")
        .select("config_value")
        .eq("assistant_id", assistantId)
        .eq("config_key", "api_key")
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        const configValue = typeof data.config_value === 'string' 
          ? JSON.parse(data.config_value) 
          : data.config_value;
        setApiKey(String(configValue));
      }
    } catch (error: any) {
      console.error("Error loading API key:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = () => {
    return `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  };

  const createApiKey = async () => {
    try {
      const newKey = generateApiKey();

      const { error } = await supabase.from("assistant_config").insert({
        assistant_id: assistantId,
        config_key: "api_key",
        config_value: JSON.stringify(newKey),
        description: "API Key for external integrations",
      });

      if (error) throw error;

      setApiKey(newKey);
      toast({
        title: "API Key creada",
        description: "La clave API se ha generado correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const regenerateApiKey = async () => {
    if (!confirm("¿Regenerar API Key? Esto invalidará la clave actual.")) return;

    try {
      const newKey = generateApiKey();

      const { error } = await supabase
        .from("assistant_config")
        .update({ config_value: JSON.stringify(newKey) })
        .eq("assistant_id", assistantId)
        .eq("config_key", "api_key");

      if (error) throw error;

      setApiKey(newKey);
      toast({
        title: "API Key regenerada",
        description: "Se ha generado una nueva clave API",
      });
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

  const getBaseUrl = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/bookings-api`;
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
            <Code className="w-6 h-6 text-primary" />
            API REST
          </h2>
          <p className="text-muted-foreground">
            Integra con tu software personalizado usando nuestra API
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Label>API Key</Label>
            {!apiKey ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  No tienes una API Key generada todavía
                </p>
                <Button onClick={createApiKey}>
                  <Key className="w-4 h-4 mr-2" />
                  Generar API Key
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input type="password" value={apiKey} readOnly />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(apiKey)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={regenerateApiKey}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Incluye esta clave en el header <code>x-api-key</code> de tus peticiones
                </p>
              </div>
            )}
          </div>

          <div>
            <Label>URL Base</Label>
            <div className="flex gap-2">
              <Input value={getBaseUrl()} readOnly />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(getBaseUrl())}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <Tabs defaultValue="list">
          <TabsList className="mb-4">
            <TabsTrigger value="list">Listar Reservas</TabsTrigger>
            <TabsTrigger value="get">Obtener Reserva</TabsTrigger>
            <TabsTrigger value="create">Crear Reserva</TabsTrigger>
            <TabsTrigger value="update">Actualizar Reserva</TabsTrigger>
            <TabsTrigger value="status">Cambiar Estado</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="space-y-2">
              <h3 className="font-semibold">GET /bookings</h3>
              <p className="text-sm text-muted-foreground">Listar todas las reservas</p>
              <pre className="bg-muted/50 p-4 rounded text-xs overflow-x-auto">
{`curl -X GET ${getBaseUrl()}/bookings \\
  -H "x-api-key: ${apiKey || 'TU_API_KEY'}" \\
  -H "Content-Type: application/json"

# Con filtros
curl -X GET "${getBaseUrl()}/bookings?status=confirmed&start_date=2024-01-01" \\
  -H "x-api-key: ${apiKey || 'TU_API_KEY'}"`}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="get">
            <div className="space-y-2">
              <h3 className="font-semibold">GET /bookings/:id</h3>
              <p className="text-sm text-muted-foreground">Obtener una reserva específica</p>
              <pre className="bg-muted/50 p-4 rounded text-xs overflow-x-auto">
{`curl -X GET ${getBaseUrl()}/bookings/BOOKING_ID \\
  -H "x-api-key: ${apiKey || 'TU_API_KEY'}" \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="create">
            <div className="space-y-2">
              <h3 className="font-semibold">POST /bookings</h3>
              <p className="text-sm text-muted-foreground">Crear una nueva reserva</p>
              <pre className="bg-muted/50 p-4 rounded text-xs overflow-x-auto">
{`curl -X POST ${getBaseUrl()}/bookings \\
  -H "x-api-key: ${apiKey || 'TU_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_phone": "+34600123456",
    "customer_name": "Juan Pérez",
    "service_type": "Reparación de motor",
    "start_time": "2024-12-15T10:00:00Z",
    "end_time": "2024-12-15T12:00:00Z",
    "price": 150.00,
    "notes": "Cambio de aceite incluido",
    "external_id": "REP-12345"
  }'`}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="update">
            <div className="space-y-2">
              <h3 className="font-semibold">PATCH /bookings/:id</h3>
              <p className="text-sm text-muted-foreground">Actualizar una reserva existente</p>
              <pre className="bg-muted/50 p-4 rounded text-xs overflow-x-auto">
{`curl -X PATCH ${getBaseUrl()}/bookings/BOOKING_ID \\
  -H "x-api-key: ${apiKey || 'TU_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "notes": "Cliente llamó para confirmar",
    "price": 175.00
  }'`}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="status">
            <div className="space-y-2">
              <h3 className="font-semibold">POST /bookings/:id/status</h3>
              <p className="text-sm text-muted-foreground">
                Cambiar estado (DISPARA NOTIFICACIONES AUTOMÁTICAS)
              </p>
              <pre className="bg-muted/50 p-4 rounded text-xs overflow-x-auto">
{`curl -X POST ${getBaseUrl()}/bookings/BOOKING_ID/status \\
  -H "x-api-key: ${apiKey || 'TU_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "completed"
  }'

# Estados válidos: pending, confirmed, completed, cancelled`}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6 bg-green-50 border-green-200">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Code className="w-5 h-5 text-green-600" />
          Flujo completo de ejemplo
        </h3>
        <pre className="text-xs overflow-x-auto bg-white p-4 rounded">
{`# 1. Crear reserva desde tu software
curl -X POST ${getBaseUrl()}/bookings \\
  -H "x-api-key: ${apiKey || 'sk_xxx'}" \\
  -d '{"customer_phone": "+34600...", "service_type": "Reparación", ...}'

# 2. Cuando termines el trabajo, cambiar a completado
curl -X POST ${getBaseUrl()}/bookings/BOOKING_ID/status \\
  -H "x-api-key: ${apiKey || 'sk_xxx'}" \\
  -d '{"status": "completed"}'

# 3. ✅ Se dispara automáticamente el WhatsApp:
#    "Hola Juan, tu Reparación está lista. Puedes pasar a recogerlo!"`}
        </pre>
      </Card>
    </div>
  );
};

export default APIManager;
