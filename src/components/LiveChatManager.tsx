import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, MessageSquare, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Conversation {
  id: string;
  phone_number: string;
  status: string;
  started_at: string;
}

const LiveChatManager = ({ assistantId }: { assistantId: string }) => {
  const [activeChats, setActiveChats] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadActiveChats();
    subscribeToChats();
  }, [assistantId]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
      subscribeToMessages(selectedChat);
    }
  }, [selectedChat]);

  const loadActiveChats = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("assistant_id", assistantId)
        .eq("status", "active")
        .order("started_at", { ascending: false });

      if (error) throw error;
      setActiveChats(data || []);
    } catch (error: any) {
      console.error("Error loading active chats:", error);
    }
  };

  const subscribeToChats = () => {
    const channel = supabase
      .channel("live-chats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `assistant_id=eq.${assistantId}`,
        },
        () => {
          loadActiveChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    } catch (error: any) {
      console.error("Error loading messages:", error);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const takeover = async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("live_chat_sessions").insert({
        conversation_id: conversationId,
        operator_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Chat tomado",
        description: "Ahora puedes responder manualmente",
      });

      setSelectedChat(conversationId);
      setDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!selectedChat || !messageText.trim()) return;

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedChat,
        role: "assistant",
        content: messageText,
        is_from_operator: true,
      });

      if (error) throw error;

      setMessageText("");
      toast({ title: "Mensaje enviado" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Chats Activos</h3>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeChats.map((chat) => (
          <Card key={chat.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="font-semibold">{chat.phone_number}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(chat.started_at).toLocaleTimeString()}
              </span>
            </div>
            <Button size="sm" onClick={() => takeover(chat.id)} className="w-full">
              Tomar Control
            </Button>
          </Card>
        ))}

        {activeChats.length === 0 && (
          <Card className="p-8 col-span-full">
            <p className="text-center text-muted-foreground">
              No hay chats activos en este momento
            </p>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Chat en Vivo</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto space-y-2 p-4 border rounded-lg mb-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-muted"
                        : msg.is_from_operator
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.is_from_operator && (
                      <p className="text-xs mt-1 opacity-70">Enviado manualmente</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Escribe tu mensaje..."
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveChatManager;
