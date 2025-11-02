import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Users, Clock } from "lucide-react";

const SuccessStories = () => {
  const stories = [
    {
      company: "InmoPlus",
      industry: "Inmobiliaria",
      logo: "🏠",
      stats: [
        { label: "Reducción de costos", value: "73%", icon: TrendingUp },
        { label: "Consultas atendidas", value: "+15K", icon: Users },
        { label: "Tiempo de respuesta", value: "< 30 seg", icon: Clock },
      ],
      quote:
        "Antes tardábamos horas en responder consultas sobre propiedades. Ahora el asistente responde al instante con fotos, precios y disponibilidad. Nuestras conversiones subieron un 40%.",
      author: "María González",
      role: "Directora Comercial",
      results: [
        "Automatización del 85% de consultas iniciales",
        "Disponibilidad 24/7 sin contratar personal nocturno",
        "Reducción de 40% en tiempo de cierre de ventas",
      ],
    },
    {
      company: "LogiRápid",
      industry: "Paquetería",
      logo: "📦",
      stats: [
        { label: "Ahorro mensual", value: "€12K", icon: TrendingUp },
        { label: "Clientes atendidos", value: "50K+", icon: Users },
        { label: "Satisfacción", value: "4.8/5", icon: Clock },
      ],
      quote:
        "Gestionar el seguimiento de 2,000 paquetes diarios era un caos. El asistente ahora responde automáticamente sobre estados, ubicaciones y entregas. Ahorramos 6 empleados.",
      author: "Carlos Ramírez",
      role: "CEO",
      results: [
        "98% de consultas de tracking resueltas sin humanos",
        "Reducción del 60% en llamadas al call center",
        "Actualización automática de estado de pedidos",
      ],
    },
    {
      company: "RentCar Pro",
      industry: "Alquiler de Vehículos",
      logo: "🚗",
      stats: [
        { label: "Incremento reservas", value: "+156%", icon: TrendingUp },
        { label: "Mensajes/día", value: "800+", icon: Users },
        { label: "Tasa conversión", value: "42%", icon: Clock },
      ],
      quote:
        "Los clientes querían información inmediata sobre disponibilidad y precios. El asistente responde al instante y hasta procesa reservas. Triplicamos nuestras ventas online.",
      author: "Ana Martínez",
      role: "Gerente de Operaciones",
      results: [
        "Sistema de reservas 100% automatizado vía WhatsApp",
        "Confirmaciones y recordatorios automáticos",
        "Check-in digital sin intervención humana",
      ],
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge className="mb-4" variant="secondary">
            Casos de Éxito
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Empresas que <span className="text-primary">Transformaron</span> su Atención
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Resultados reales de negocios como el tuyo
          </p>
        </div>

        <div className="space-y-12 max-w-6xl mx-auto">
          {stories.map((story, index) => (
            <Card key={index} className="overflow-hidden shadow-hover hover:-translate-y-1 transition-all duration-300">
              <div className="grid lg:grid-cols-5 gap-8">
                {/* Company Info */}
                <div className="lg:col-span-2 p-8 bg-gradient-to-br from-primary/10 to-accent/10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-soft">
                      {story.logo}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{story.company}</h3>
                      <Badge variant="outline">{story.industry}</Badge>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {story.stats.map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-primary">{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Story Details */}
                <div className="lg:col-span-3 p-8">
                  <div className="mb-6">
                    <p className="text-lg italic text-muted-foreground mb-4">"{story.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {story.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{story.author}</p>
                        <p className="text-sm text-muted-foreground">{story.role}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <p className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Resultados Clave:
                    </p>
                    {story.results.map((result, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{result}</p>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" size="sm">
                    Leer Historia Completa
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-12 p-8 bg-primary/5 border-2 border-primary/20 max-w-4xl mx-auto">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">¿Quieres ser el próximo caso de éxito?</h3>
            <p className="text-muted-foreground mb-6">
              Únete a las +2,500 empresas que ya transformaron su atención al cliente
            </p>
            <Button size="lg">
              Empezar Gratis
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default SuccessStories;
