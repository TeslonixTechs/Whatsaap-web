import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Package, Car, Building2, Clock, CheckCircle2 } from "lucide-react";

const industries = [
  {
    icon: Home,
    title: "Inmobiliario & Alquileres",
    description: "Cuida de tus huéspedes e inquilinos como si estuvieras siempre presente",
    features: [
      "Check-ins cálidos",
      "Códigos entregados con cariño",
      "Respuestas atentas sobre servicios",
      "Resolución empática de problemas",
    ],
  },
  {
    icon: Package,
    title: "Paquetería & Logística",
    description: "Tranquiliza a tus clientes con información clara y oportuna sobre sus envíos",
    features: [
      "Actualizaciones reconfortantes",
      "Notificaciones amigables",
      "Gestión cercana de recogidas",
      "Resolución cariñosa de incidencias",
    ],
  },
  {
    icon: Car,
    title: "Alquiler de Vehículos",
    description: "Acompaña a tus clientes en cada paso de su viaje con atención personalizada",
    features: [
      "Reservas amables",
      "Check-ins atentos",
      "Información clara de ubicaciones",
      "Asistencia continua en ruta",
    ],
  },
  {
    icon: Building2,
    title: "Servicios Profesionales",
    description: "Mantén a tus clientes informados con el toque humano que merece tu marca",
    features: [
      "Confirmaciones cordiales",
      "Recordatorios considerados",
      "Seguimiento afectuoso",
      "Gestión cercana de citas",
    ],
  },
];

const Industries = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">Cuidamos cada tipo de negocio</h2>
          <p className="text-lg text-muted-foreground">
            Cada sector tiene sus particularidades, y nuestro asistente las entiende con cariño
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {industries.map((industry, index) => {
            const Icon = industry.icon;
            return (
              <Card key={index} className="p-8 gradient-card shadow-soft hover:shadow-hover transition-all duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{industry.title}</h3>
                    <p className="text-muted-foreground">{industry.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {industry.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button variant="ghost" className="w-full">
                  Saber más
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Industries;
