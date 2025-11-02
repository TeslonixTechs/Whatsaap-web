import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Eye, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ConversationsHistoryProps {
  assistantId: string;
}

interface Conversation {
  id: string;
  phone_number: string;
  started_at: string;
  ended_at: string | null;
  status: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

const ConversationsHistory = ({ assistantId }: ConversationsHistoryProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, [assistantId]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("started_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las conversaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setSelectedConversation(conversationId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive",
      });
    }
  };

  const closeConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from("conversations")
        .update({ status: "closed", ended_at: new Date().toISOString() })
        .eq("id", conversationId);

      if (error) throw error;
      loadConversations();
      toast({
        title: "Conversación cerrada",
        description: "La conversación ha sido marcada como cerrada",
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
    <>
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Historial de Conversaciones</h3>
        </div>

        {conversations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No hay conversaciones registradas aún
          </p>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{conv.phone_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.started_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        conv.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {conv.status === "active" ? "Activa" : "Cerrada"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadMessages(conv.id)}
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                    {conv.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => closeConversation(conv.id)}
                      >
                        <X className="w-4 h-4" />
                        Cerrar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>

      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mensajes de la Conversación</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-96 pr-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.role === "assistant"
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === "assistant" ? "text-muted-foreground" : "opacity-70"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString("es-ES")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ConversationsHistory;