import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, MessageCircle, BookOpen, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import WhatsAppConnection from "./WhatsAppConnection";
import BotSettingsManager from "./BotSettingsManager";
import FAQManager from "./FAQManager";

interface AssistantConfigTabProps {
  assistantId: string;
  onDeleted?: () => void;
}

const AssistantConfigTab = ({ assistantId, onDeleted }: AssistantConfigTabProps) => {
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteAssistant = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("assistants")
        .delete()
        .eq("id", assistantId);

      if (error) throw error;

      toast({
        title: "Asistente eliminado",
        description: "Puedes crear uno nuevo cuando quieras",
      });

      onDeleted?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Configuración del Asistente</h2>
          <p className="text-muted-foreground">
            Gestiona WhatsApp, comportamiento del bot y preguntas frecuentes
          </p>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar asistente
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                ¿Eliminar asistente?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará todo el asistente incluyendo:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Configuración de WhatsApp</li>
                  <li>Todas las FAQs</li>
                  <li>Respuestas automáticas</li>
                  <li>Historial de conversaciones</li>
                </ul>
                <p className="mt-3 font-semibold">Esta acción no se puede deshacer.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAssistant}
                disabled={deleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="whatsapp">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <Settings className="w-4 h-4 mr-2" />
            Comportamiento
          </TabsTrigger>
          <TabsTrigger value="faqs">
            <BookOpen className="w-4 h-4 mr-2" />
            FAQs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp" className="space-y-4">
          <WhatsAppConnection assistantId={assistantId} />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <BotSettingsManager assistantId={assistantId} />
        </TabsContent>

        <TabsContent value="faqs" className="space-y-4">
          <FAQManager assistantId={assistantId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssistantConfigTab;