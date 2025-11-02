import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Prueba Gratis",
    price: "0",
    description: "14 días para probar sin límites",
    trial: true,
    features: [
      "100 mensajes incluidos",
      "1 número de WhatsApp",
      "Todas las funcionalidades",
      "Sin tarjeta de crédito",
      "14 días de prueba",
    ],
  },
  {
    name: "Starter",
    price: "19",
    description: "Perfecto para empezar",
    features: [
      "500 mensajes al mes",
      "1 número de WhatsApp",
      "Respuestas automáticas",
      "Soporte por email",
      "Panel de analíticas",
    ],
  },
  {
    name: "Growth",
    price: "49",
    description: "Para negocios en crecimiento",
    featured: true,
    features: [
      "2,000 mensajes al mes",
      "3 números de WhatsApp",
      "IA avanzada personalizable",
      "Integraciones con tu sistema",
      "Soporte prioritario",
      "Reportes avanzados",
    ],
  },
  {
    name: "Professional",
    price: "99",
    description: "Para equipos completos",
    features: [
      "10,000 mensajes al mes",
      "10 números de WhatsApp",
      "Automatizaciones avanzadas",
      "Integraciones premium",
      "Soporte 24/7",
      "Dashboard personalizado",
    ],
  },
];

const Pricing = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">Planes que se adaptan a ti</h2>
          <p className="text-lg text-muted-foreground">
            Empieza gratis y escala cuando lo necesites
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`p-8 gradient-card shadow-soft hover:shadow-hover transition-all duration-300 ${
                plan.featured ? 'border-2 border-primary scale-105' : ''
              } ${
                plan.trial ? 'border-2 border-green-500' : ''
              }`}
            >
              {plan.trial && (
                <div className="bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  ¡Prueba gratis!
                </div>
              )}
              {plan.featured && !plan.trial && (
                <div className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Más popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Personalizado" && (
                  <span className="text-muted-foreground ml-2">€/mes</span>
                )}
              </div>
              
              <Button 
                variant={plan.featured ? "hero" : "outline"} 
                className="w-full mb-6"
                size="lg"
              >
                {plan.price === "Personalizado" ? "Contactar" : "Empezar ahora"}
              </Button>
              
              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
