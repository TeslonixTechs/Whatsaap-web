import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lightbulb, TrendingUp, MessageSquare, Workflow, Brain } from "lucide-react";

interface AIAssistantProps {
  assistantId: string;
}

const AIAssistant = ({ assistantId }: AIAssistantProps) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      // Get recent conversations for analysis
      const { data: conversations } = await supabase
        .from("conversations")
        .select(`
          *,
          messages(content, role)
        `)
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false })
        .limit(50);

      const analysisText = `
Analiza estas conversaciones recientes y sugiere mejoras específicas para:
1. FAQs que se repiten frecuentemente
2. Respuestas automáticas que podrían optimizarse
3. Nuevos flujos de trabajo que detectas
4. Intents que deberían configurarse

Conversaciones:
${conversations?.map(c => 
  `Cliente: ${c.messages?.filter((m: any) => m.role === 'user').map((m: any) => m.content).join(' | ')}
  Bot: ${c.messages?.filter((m: any) => m.role === 'assistant').map((m: any) => m.content).join(' | ')}`
).join('\n\n')}
      `;

      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          messages: [{ role: "user", content: analysisText }],
          type: "suggest",
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast({
            title: "Límite alcanzado",
            description: "Has alcanzado el límite de uso de IA. Espera unos minutos.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(data.error);
      }

      setSuggestions(data.suggestions || []);

      toast({
        title: "Análisis completado",
        description: `Se generaron ${data.suggestions?.length || 0} sugerencias`,
      });
    } catch (error: any) {
      console.error("Error generating suggestions:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar sugerencias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "faq":
        return <MessageSquare className="w-5 h-5" />;
      case "workflow":
        return <Workflow className="w-5 h-5" />;
      case "intent":
        return <Brain className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants: any = {
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Asistente de IA</h2>
          <p className="text-muted-foreground">Sugerencias automáticas para mejorar respuestas</p>
        </div>
        <Button onClick={generateSuggestions} disabled={loading}>
          <Sparkles className="w-4 h-4 mr-2" />
          {loading ? "Analizando..." : "Generar Sugerencias"}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="grid gap-4">
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="p-6 hover:shadow-hover transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {getCategoryIcon(suggestion.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{suggestion.title}</h3>
                    {getPriorityBadge(suggestion.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {suggestion.description}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {suggestion.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {suggestions.length === 0 && !loading && (
        <Card className="p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Análisis Inteligente con IA</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Nuestro asistente de IA analizará tus conversaciones recientes y te sugerirá:
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
            <div className="flex items-start gap-3 text-left">
              <MessageSquare className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Nuevas FAQs</p>
                <p className="text-sm text-muted-foreground">
                  Detecta preguntas que se repiten frecuentemente
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <TrendingUp className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Optimización de respuestas</p>
                <p className="text-sm text-muted-foreground">
                  Mejora la efectividad de tus mensajes automáticos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <Workflow className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Nuevos flujos</p>
                <p className="text-sm text-muted-foreground">
                  Identifica patrones para automatizar procesos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <Brain className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-medium">Configuración de intents</p>
                <p className="text-sm text-muted-foreground">
                  Mejora la comprensión del lenguaje natural
                </p>
              </div>
            </div>
          </div>
          <Button onClick={generateSuggestions} size="lg" disabled={loading}>
            <Sparkles className="w-5 h-5 mr-2" />
            Comenzar Análisis
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AIAssistant;
