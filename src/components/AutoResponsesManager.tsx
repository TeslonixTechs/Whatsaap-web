import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Save } from "lucide-react";

interface AutoResponsesManagerProps {
  assistantId: string;
}

interface AutoResponse {
  id?: string;
  type: "welcome" | "after_hours" | "inactive";
  message: string;
  is_active: boolean;
}

const responseTypes = [
  {
    type: "welcome" as const,
    label: "Mensaje de Bienvenida",
    description: "Mensaje que se envía cuando un usuario inicia una conversación",
    placeholder: "¡Hola! Bienvenido a nuestro servicio. ¿En qué puedo ayudarte?",
  },
  {
    type: "after_hours" as const,
    label: "Fuera de Horario",
    description: "Mensaje cuando se contacta fuera del horario de atención",
    placeholder: "Gracias por contactarnos. Actualmente estamos fuera de horario. Responderemos lo antes posible.",
  },
  {
    type: "inactive" as const,
    label: "Asistente Inactivo",
    description: "Mensaje cuando el asistente está desactivado",
    placeholder: "Lo sentimos, el asistente está temporalmente inactivo. Intenta más tarde.",
  },
];

const AutoResponsesManager = ({ assistantId }: AutoResponsesManagerProps) => {
  const [responses, setResponses] = useState<Record<string, AutoResponse>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadResponses();
  }, [assistantId]);

  const loadResponses = async () => {
    try {
      const { data, error } = await supabase
        .from("auto_responses")
        .select("*")
        .eq("assistant_id", assistantId);

      if (error) throw error;

      const responsesMap: Record<string, AutoResponse> = {};
      data?.forEach((resp) => {
        responsesMap[resp.type] = {
          id: resp.id,
          type: resp.type as "welcome" | "after_hours" | "inactive",
          message: resp.message,
          is_active: resp.is_active,
        };
      });
      setResponses(responsesMap);
    } catch (error: any) {
      console.error("Error loading auto responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveResponse = async (type: string) => {
    try {
      const response = responses[type];
      
      if (!response?.message) {
        toast({
          title: "Error",
          description: "El mensaje no puede estar vacío",
          variant: "destructive",
        });
        return;
      }

      const responseData = {
        assistant_id: assistantId,
        type,
        message: response.message,
        is_active: response.is_active,
      };

      if (response.id) {
        const { error } = await supabase
          .from("auto_responses")
          .update(responseData)
          .eq("id", response.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("auto_responses")
          .insert(responseData)
          .select()
          .single();

        if (error) throw error;
        
        setResponses((prev) => ({
          ...prev,
          [type]: { ...response, id: data.id },
        }));
      }

      toast({
        title: "Guardado",
        description: "La respuesta automática se guardó correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateResponse = (type: string, field: keyof AutoResponse, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        type: type as any,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {responseTypes.map(({ type, label, description, placeholder }) => (
        <Card key={type} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold">{label}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`active-${type}`}>Activo</Label>
                <Switch
                  id={`active-${type}`}
                  checked={responses[type]?.is_active ?? true}
                  onCheckedChange={(checked) => updateResponse(type, "is_active", checked)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`message-${type}`}>Mensaje</Label>
              <Textarea
                id={`message-${type}`}
                value={responses[type]?.message ?? ""}
                onChange={(e) => updateResponse(type, "message", e.target.value)}
                placeholder={placeholder}
                rows={3}
              />
            </div>

            <Button onClick={() => saveResponse(type)} className="w-full">
              <Save className="w-4 h-4" />
              Guardar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AutoResponsesManager;