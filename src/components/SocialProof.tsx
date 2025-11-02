import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote } from "lucide-react";

const SocialProof = () => {
  const testimonials = [
    {
      name: "María González",
      role: "CEO, TechShop",
      company: "E-commerce",
      content: "Implementamos el asistente y en el primer mes redujimos costos operativos en un 60%. Increíble.",
      rating: 5,
    },
    {
      name: "Carlos Ruiz",
      role: "Director de Operaciones",
      company: "Logística Express",
      content: "La automatización nos permitió escalar sin contratar más personal. Ahora manejamos 3x más consultas.",
      rating: 5,
    },
    {
      name: "Ana Martínez",
      role: "Gerente de Ventas",
      company: "Retail Solutions",
      content: "Nuestros clientes están más satisfechos y respondemos en segundos. El ROI fue inmediato.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge className="mb-4" variant="secondary">
            Lo que dicen nuestros clientes
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Historias de <span className="text-primary">Éxito Real</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-hover transition-all duration-300 hover:-translate-y-2 gradient-card border-2 relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="w-10 h-10 text-primary/20 mb-4" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>

              <p className="text-foreground mb-6 italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-white font-bold text-xl">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
