import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const ComparisonTable = () => {
  const features = [
    { feature: "Disponibilidad 24/7", traditional: false, automated: true },
    { feature: "Respuesta instantánea", traditional: false, automated: true },
    { feature: "Costo mensual por agente", traditional: "$2,000+", automated: "$99" },
    { feature: "Capacidad de mensajes", traditional: "100-200/día", automated: "Ilimitado" },
    { feature: "Escalabilidad", traditional: false, automated: true },
    { feature: "Tiempo de entrenamiento", traditional: "2-4 semanas", automated: "5 minutos" },
    { feature: "Errores humanos", traditional: true, automated: false },
    { feature: "Análisis de datos en tiempo real", traditional: false, automated: true },
  ];

  return (
    <section className="py-20 gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge className="mb-4" variant="secondary">
            Comparativa
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Atención Tradicional vs <span className="text-primary">Automatizada</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre por qué miles de empresas están haciendo el cambio
          </p>
        </div>

        <Card className="overflow-hidden max-w-4xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/5">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Característica</th>
                  <th className="px-6 py-4 text-center font-semibold">Atención Tradicional</th>
                  <th className="px-6 py-4 text-center font-semibold bg-primary/10">
                    Con Nuestro Asistente
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {features.map((item, index) => (
                  <tr key={index} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{item.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {typeof item.traditional === 'boolean' ? (
                        item.traditional ? (
                          <X className="w-6 h-6 text-destructive mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-muted-foreground/30 mx-auto" />
                        )
                      ) : (
                        <span className="text-muted-foreground">{item.traditional}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center bg-primary/5">
                      {typeof item.automated === 'boolean' ? (
                        item.automated ? (
                          <Check className="w-6 h-6 text-primary mx-auto" />
                        ) : (
                          <X className="w-6 h-6 text-muted-foreground/30 mx-auto" />
                        )
                      ) : (
                        <span className="font-semibold text-primary">{item.automated}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="text-center mt-8">
          <p className="text-lg font-semibold text-primary">
            Ahorra hasta 95% en costos de atención al cliente
          </p>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
