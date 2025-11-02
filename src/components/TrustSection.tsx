import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, CheckCircle2, RefreshCw } from "lucide-react";

const TrustSection = () => {
  const trustPoints = [
    {
      icon: Shield,
      title: "Seguridad Garantizada",
      description: "Encriptación end-to-end y cumplimiento con GDPR y normativas internacionales",
    },
    {
      icon: Lock,
      title: "Privacidad Total",
      description: "Tus datos nunca se comparten. Control total sobre tu información",
    },
    {
      icon: CheckCircle2,
      title: "99.9% Uptime",
      description: "Disponibilidad garantizada con servidores redundantes en múltiples regiones",
    },
    {
      icon: RefreshCw,
      title: "Soporte 24/7",
      description: "Equipo técnico disponible en todo momento para ayudarte",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge className="mb-4 gradient-accent text-white border-0">
            Confianza y Seguridad
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tu Tranquilidad es Nuestra <span className="text-primary">Prioridad</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Implementamos los más altos estándares de seguridad para proteger tu negocio
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-glow transition-all duration-300 hover:-translate-y-2 bg-card/80 backdrop-blur-sm border-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-accent">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{point.title}</h3>
                <p className="text-muted-foreground text-sm">{point.description}</p>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border-2 max-w-3xl mx-auto">
            <div className="text-center min-w-[100px]">
              <p className="text-2xl md:text-3xl font-bold text-primary">ISO 27001</p>
              <p className="text-xs md:text-sm text-muted-foreground">Certificado</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-border"></div>
            <div className="text-center min-w-[100px]">
              <p className="text-2xl md:text-3xl font-bold text-primary">GDPR</p>
              <p className="text-xs md:text-sm text-muted-foreground">Cumplimiento</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-border"></div>
            <div className="text-center min-w-[100px]">
              <p className="text-2xl md:text-3xl font-bold text-primary">SOC 2</p>
              <p className="text-xs md:text-sm text-muted-foreground">Certificado</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
