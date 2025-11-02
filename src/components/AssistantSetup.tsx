import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface AssistantSetupProps {
  onComplete?: () => void;
}

const AssistantSetup = ({ onComplete }: AssistantSetupProps) => {
  const { toast } = useToast();
  const [businessDescription, setBusinessDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!businessDescription || !industry) {
      toast({
        title: "Datos incompletos",
        description: "Describe tu negocio e indica la industria.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant-config", {
        body: { businessDescription, industry, phoneNumber: phoneNumber || null },
      });

      if (error) throw error;

      toast({
        title: "Asistente creado",
        description: "Configuración generada con IA correctamente.",
      });

      onComplete?.();
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "No se pudo crear el asistente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Crear asistente con IA</h3>
          <p className="text-sm text-muted-foreground">Completa los datos y generaremos la configuración inicial.</p>
        </div>

        <div className="space-y-2">
          <Label>Descripción del negocio</Label>
          <Textarea
            value={businessDescription}
            onChange={(e) => setBusinessDescription(e.target.value)}
            placeholder="¿Qué hace tu negocio? ¿Servicios, horarios, propuesta de valor?"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Industria</Label>
          <Input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="Ej: Restauración, Bienes raíces, Clínica..."
          />
        </div>

        <div className="space-y-2">
          <Label>Número de WhatsApp (opcional)</Label>
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+34 612 345 678"
          />
        </div>

        <Button onClick={handleCreate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando asistente...
            </>
          ) : (
            "Crear asistente"
          )}
        </Button>
      </div>
    </Card>
  );
};

export default AssistantSetup;