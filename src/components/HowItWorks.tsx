import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Settings, Rocket, LineChart } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Settings,
      number: "01",
      title: "Configura tu Asistente",
      description: "En solo 5 minutos, personaliza las respuestas, tono y flujo según tu negocio.",
    },
    {
      icon: MessageSquare,
      number: "02",
      title: "Conecta WhatsApp",
      description: "Vincula tu número de WhatsApp Business de forma segura y rápida.",
    },
    {
      icon: Rocket,
      number: "03",
      title: "¡Listo para Operar!",
      description: "Tu asistente comienza a atender a tus clientes automáticamente.",
    },
    {
      icon: LineChart,
      number: "04",
      title: "Monitorea y Mejora",
      description: "Analiza métricas en tiempo real y optimiza continuamente.",
    },
  ];

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge className="mb-4" variant="secondary">
            Proceso Simple
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            ¿Cómo <span className="text-primary">Funciona</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Desde la configuración hasta la automatización completa en minutos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="p-6 relative overflow-hidden hover:shadow-hover transition-all duration-300 hover:-translate-y-2 gradient-card border-2"
              >
                <div className="absolute top-4 right-4 text-6xl font-bold text-primary/5">
                  {step.number}
                </div>
                
                <div className="relative z-10">
                  <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2 z-20">
                    <div className="w-6 h-6 rotate-45 bg-primary/20"></div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
