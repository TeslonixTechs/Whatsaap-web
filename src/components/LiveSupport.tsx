import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";

const LiveSupport = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:scale-110 transition-transform"
        aria-label="Abrir chat de soporte"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-80 shadow-xl">
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
            <h3 className="font-semibold">Chat en vivo</h3>
            <p className="text-sm opacity-90">Estamos aquí para ayudarte</p>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm">
                👋 ¡Hola! ¿En qué podemos ayudarte hoy?
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.open('https://wa.me/34600123456', '_blank')}
              >
                💬 Hablar por WhatsApp
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = 'mailto:contacto@asistentebot.com'}
              >
                📧 Enviar un email
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  const element = document.getElementById('contacto');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    setIsOpen(false);
                  }
                }}
              >
                📝 Formulario de contacto
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Respondemos en menos de 5 minutos
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default LiveSupport;
