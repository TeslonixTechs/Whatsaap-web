import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <Card className="p-12 md:p-16 text-center gradient-accent border-0 shadow-glow">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              ¿Listo para Transformar tu Atención al Cliente?
            </h2>
            <p className="text-xl text-white/90 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Únete a miles de empresas que ya están ahorrando tiempo y dinero con nuestra plataforma de automatización inteligente
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                onClick={() => navigate("/auth")}
              >
                Comienza Gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Play className="mr-2 w-5 h-5" />
                Ver Demo
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                Sin tarjeta de crédito
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                Setup en 5 minutos
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                Cancela cuando quieras
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default CTASection;
