import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative overflow-hidden gradient-hero py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <MessageCircle className="w-4 h-4" />
              Más de 2,500 empresas confían en nosotros
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
              Atiende a tus clientes con cariño en{" "}
              <span className="text-primary">WhatsApp</span>,{" "}
              <span className="text-primary">las 24 horas del día</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Cuida de tus clientes como lo harías tú, pero sin descanso. Desde inmobiliarias hasta paquetería, 
              desde alquiler de coches hasta servicios especializados. Automatización que se siente humana.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => navigate("/auth?mode=signup")}
              >
                Empezar gratis
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={() => {
                  const element = document.getElementById('funciones');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Ver cómo funciona
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl animate-float" />
            <img 
              src={heroImage} 
              alt="Asistente de WhatsApp automatizado" 
              className="relative rounded-2xl shadow-hover w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
