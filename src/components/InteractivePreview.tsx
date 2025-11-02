import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

const InteractivePreview = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickReplies = [
    "¿Cuál es el horario?",
    "¿Cuánto cuesta?",
    "¿Cómo funciona?",
    "Quiero una demo",
  ];

  const responses: Record<string, string> = {
    "horario": "Nuestro asistente está disponible 24/7, los 365 días del año. ¡Nunca descansa! 🌟",
    "cuesta": "Nuestros planes comienzan desde €99/mes con todo incluido. Sin costos ocultos ni permanencias. 💰",
    "funciona": "Es súper simple: 1) Configuras el asistente en 5 minutos 2) Conectas tu WhatsApp 3) ¡Listo! Ya está atendiendo clientes. 🚀",
    "demo": "¡Perfecto! Te encantará ver cómo funciona. Haz clic en 'Empezar gratis' arriba para crear tu cuenta y probar gratis. 🎉",
  };

  const handleSend = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    setMessages([...messages, { role: "user", content: messageText }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lowerMessage = messageText.toLowerCase();
      let response = "Interesante pregunta. En producción, nuestro asistente usaría IA para dar una respuesta personalizada. 🤖";

      for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
          response = value;
          break;
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge className="mb-4" variant="secondary">
            Prueba Interactiva
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Chatea con el <span className="text-primary">Asistente</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prueba una conversación real y descubre cómo se siente
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden shadow-hover">
            {/* WhatsApp-style header */}
            <div className="bg-primary p-4 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                🤖
              </div>
              <div>
                <p className="font-semibold">Asistente Virtual</p>
                <p className="text-xs text-white/80">En línea</p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-secondary/10">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-card border-2 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === "user" ? "text-white/70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date().toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-card border-2 rounded-2xl rounded-bl-none px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick replies */}
            <div className="p-3 bg-secondary/20 border-t flex gap-2 flex-wrap">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="outline"
                  onClick={() => handleSend(reply)}
                  className="text-xs"
                >
                  {reply}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Escribe un mensaje..."
                className="flex-1"
              />
              <Button onClick={() => handleSend()} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-4">
            ⚡ Este es un ejemplo simplificado. El asistente real es mucho más inteligente.
          </p>
        </div>
      </div>
    </section>
  );
};

export default InteractivePreview;
