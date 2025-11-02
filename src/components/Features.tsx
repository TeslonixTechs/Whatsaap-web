import { Card } from "@/components/ui/card";
import { MessageSquare, Zap, Heart, Shield, Clock, TrendingUp } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Conversaciones Naturales",
    description: "Respuestas que se sienten humanas, no robóticas. Tu asistente habla como tú hablarías.",
  },
  {
    icon: Zap,
    title: "Respuesta Instantánea",
    description: "0 segundos de espera. Tus clientes obtienen respuestas al instante, las 24 horas.",
  },
  {
    icon: Heart,
    title: "Personalización Completa",
    description: "Configura el tono, las respuestas y el flujo según la personalidad de tu marca.",
  },
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Tus datos y los de tus clientes están protegidos con los más altos estándares de seguridad.",
  },
  {
    icon: Clock,
    title: "Disponibilidad Total",
    description: "Tu asistente nunca duerme, nunca se cansa y siempre está listo para ayudar.",
  },
  {
    icon: TrendingUp,
    title: "Mejora Continua",
    description: "Aprende de cada conversación para ofrecer respuestas cada vez más precisas.",
  },
];

const Features = () => {
  return (
    <section className="py-20 gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">¿Por qué elegir nuestro asistente?</h2>
          <p className="text-lg text-muted-foreground">
            Tecnología avanzada con un toque humano
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 gradient-card shadow-soft hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
