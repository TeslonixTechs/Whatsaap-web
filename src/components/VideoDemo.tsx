import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const VideoDemo = () => {
  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge className="mb-4" variant="secondary">
            Demo en Vivo
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ve el Asistente en <span className="text-primary">Acción</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre cómo nuestro asistente atiende a tus clientes de forma natural y eficiente
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden shadow-hover">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative cursor-pointer group">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                        <Play className="w-10 h-10 text-white ml-1" />
                      </div>
                      <p className="text-white text-lg font-semibold">Ver Demo Completa</p>
                      <p className="text-white/80 text-sm">3:24 minutos</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-medium">Conversación en tiempo real</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      En producción, aquí iría el video de YouTube/Vimeo
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </Card>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: "Respuesta instantánea", value: "< 1 seg" },
              { label: "Precisión", value: "98%" },
              { label: "Clientes satisfechos", value: "95%" },
            ].map((stat, index) => (
              <Card key={index} className="p-4 text-center">
                <p className="text-2xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoDemo;
