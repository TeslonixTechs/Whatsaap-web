import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "María González",
    role: "Propietaria de 3 apartamentos",
    initials: "MG",
    content: "Ha transformado completamente la gestión de mis propiedades. Ahora puedo estar tranquila sabiendo que todo está automatizado y mis ingresos han aumentado un 40%.",
  },
  {
    name: "Roberto Silva",
    role: "Gerente de paquetería",
    initials: "RS",
    content: "Revolucionó nuestro servicio al cliente. Los clientes reciben actualizaciones de sus envíos automáticamente y nuestro equipo se enfoca en operaciones. Reducimos consultas en un 60%.",
  },
  {
    name: "Laura Martín",
    role: "Directora de alquiler de coches",
    initials: "LM",
    content: "La automatización de reservas y check-ins nos ahorró 20 horas semanales. Los clientes reciben toda la información necesaria sin que tengamos que intervenir.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl mb-4">Lo que dicen nuestros clientes</h2>
          <p className="text-lg text-muted-foreground">
            Miles de empresas ya confían en nosotros para cuidar de sus clientes
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 gradient-card shadow-soft hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
