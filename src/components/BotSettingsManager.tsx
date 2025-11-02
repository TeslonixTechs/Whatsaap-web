import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface BotSettingsManagerProps {
  assistantId: string;
}

interface BotSettings {
  id?: string;
  tone: "professional" | "casual" | "friendly";
  language: string;
  custom_instructions: string;
  require_consent: boolean;
  operator_email?: string;
  operator_whatsapp?: string;
  frustration_threshold: number;
  response_mode: "all" | "whitelist" | "blacklist";
  allowed_numbers: string[];
  blocked_numbers: string[];
}

const tones = [
  { value: "professional", label: "Profesional" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Amigable" },
];

const languages = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "fr", label: "Francés" },
  { value: "de", label: "Alemán" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Portugués" },
];

const BotSettingsManager = ({ assistantId }: BotSettingsManagerProps) => {
  const [settings, setSettings] = useState<BotSettings>({
    tone: "professional",
    language: "es",
    custom_instructions: "",
    require_consent: true,
    operator_email: "",
    operator_whatsapp: "",
    frustration_threshold: 3,
    response_mode: "all",
    allowed_numbers: [],
    blocked_numbers: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, [assistantId]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("bot_settings")
        .select("*")
        .eq("assistant_id", assistantId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setSettings({
          id: data.id,
          tone: data.tone as "professional" | "casual" | "friendly",
          language: data.language,
          custom_instructions: data.custom_instructions || "",
          require_consent: data.require_consent ?? true,
          operator_email: data.operator_email || "",
          operator_whatsapp: data.operator_whatsapp || "",
          frustration_threshold: data.frustration_threshold || 3,
          response_mode: (data.response_mode || "all") as "all" | "whitelist" | "blacklist",
          allowed_numbers: data.allowed_numbers || [],
          blocked_numbers: data.blocked_numbers || [],
        });
      }
    } catch (error: any) {
      console.error("Error loading bot settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const settingsData = {
        assistant_id: assistantId,
        tone: settings.tone,
        language: settings.language,
        custom_instructions: settings.custom_instructions,
        require_consent: settings.require_consent,
        operator_email: settings.operator_email,
        operator_whatsapp: settings.operator_whatsapp,
        frustration_threshold: settings.frustration_threshold,
        response_mode: settings.response_mode,
        allowed_numbers: settings.allowed_numbers,
        blocked_numbers: settings.blocked_numbers,
      };

      if (settings.id) {
        const { error } = await supabase
          .from("bot_settings")
          .update(settingsData)
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("bot_settings")
          .insert(settingsData)
          .select()
          .single();

        if (error) throw error;
        setSettings({ ...settings, id: data.id });
      }

      toast({
        title: "Configuración guardada",
        description: "La configuración del bot se guardó correctamente",
      });
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
        <Settings className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Configuración del Bot</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="tone">Tono de Respuesta</Label>
          <Select
            value={settings.tone}
            onValueChange={(value: any) => setSettings({ ...settings, tone: value })}
          >
            <SelectTrigger id="tone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tones.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  {tone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Define cómo se comunicará el bot con los usuarios
          </p>
        </div>

        <div>
          <Label htmlFor="language">Idioma Principal</Label>
          <Select
            value={settings.language}
            onValueChange={(value) => setSettings({ ...settings, language: value })}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="instructions">Instrucciones Personalizadas</Label>
          <Textarea
            id="instructions"
            value={settings.custom_instructions}
            onChange={(e) => setSettings({ ...settings, custom_instructions: e.target.value })}
            placeholder="Ej: Siempre preguntar el nombre del cliente, mencionar nuestros descuentos especiales, etc."
            rows={6}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Instrucciones adicionales para personalizar el comportamiento del asistente
          </p>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Consentimiento y Privacidad</h4>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Requerir Aceptación de Comunicaciones</Label>
              <p className="text-sm text-muted-foreground">
                El bot solicitará consentimiento en el primer mensaje
              </p>
            </div>
            <Switch
              checked={settings.require_consent}
              onCheckedChange={(checked) => setSettings({ ...settings, require_consent: checked })}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Escalamiento a Operador</h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="threshold">Umbral de Frustración (1-5)</Label>
              <Input
                id="threshold"
                type="number"
                min="1"
                max="5"
                value={settings.frustration_threshold}
                onChange={(e) => setSettings({ ...settings, frustration_threshold: parseInt(e.target.value) || 3 })}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Número de respuestas insatisfactorias antes de escalar a operador
              </p>
            </div>

            <div>
              <Label htmlFor="operator-email">Email del Operador</Label>
              <Input
                id="operator-email"
                type="email"
                value={settings.operator_email}
                onChange={(e) => setSettings({ ...settings, operator_email: e.target.value })}
                placeholder="operador@empresa.com"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Se enviará notificación a este email cuando se escale
              </p>
            </div>

            <div>
              <Label htmlFor="operator-whatsapp">WhatsApp del Operador</Label>
              <Input
                id="operator-whatsapp"
                type="tel"
                value={settings.operator_whatsapp}
                onChange={(e) => setSettings({ ...settings, operator_whatsapp: e.target.value })}
                placeholder="+34 612 345 678"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Número al que se transferirá la conversación (formato internacional)
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Filtro de Números</h4>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="response-mode">Modo de Respuesta</Label>
              <Select
                value={settings.response_mode}
                onValueChange={(value: any) => setSettings({ ...settings, response_mode: value })}
              >
                <SelectTrigger id="response-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Responder a todos los números</SelectItem>
                  <SelectItem value="whitelist">Solo números permitidos (whitelist)</SelectItem>
                  <SelectItem value="blacklist">Todos excepto bloqueados (blacklist)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Controla desde qué números el bot responderá automáticamente
              </p>
            </div>

            {settings.response_mode === "whitelist" && (
              <div>
                <Label htmlFor="allowed-numbers">Números Permitidos</Label>
                <Textarea
                  id="allowed-numbers"
                  value={settings.allowed_numbers.join("\n")}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    allowed_numbers: e.target.value.split("\n").filter(n => n.trim()) 
                  })}
                  placeholder="+34612345678&#10;+34687654321&#10;..."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Un número por línea en formato internacional (ej: +34612345678)
                </p>
              </div>
            )}

            {settings.response_mode === "blacklist" && (
              <div>
                <Label htmlFor="blocked-numbers">Números Bloqueados</Label>
                <Textarea
                  id="blocked-numbers"
                  value={settings.blocked_numbers.join("\n")}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    blocked_numbers: e.target.value.split("\n").filter(n => n.trim()) 
                  })}
                  placeholder="+34612345678&#10;+34687654321&#10;..."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Un número por línea en formato internacional (ej: +34612345678)
                </p>
              </div>
            )}
          </div>
        </div>

        <Button onClick={saveSettings} className="w-full">
          <Save className="w-4 h-4" />
          Guardar Configuración
        </Button>
      </div>
    </Card>
  );
};

export default BotSettingsManager;