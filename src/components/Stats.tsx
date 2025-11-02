import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, Users, Zap } from "lucide-react";

const Stats = () => {
  const stats = [
    { icon: Users, value: "50K+", label: "Clientes Satisfechos", color: "text-blue-500" },
    { icon: TrendingUp, value: "95%", label: "Tasa de Satisfacción", color: "text-purple-500" },
    { icon: Zap, value: "24/7", label: "Disponibilidad", color: "text-cyan-500" },
    { icon: CheckCircle2, value: "1M+", label: "Mensajes Procesados", color: "text-green-500" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <Badge className="mb-4" variant="secondary">
            Números que hablan por sí solos
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Resultados <span className="text-primary">Comprobados</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Miles de empresas ya confían en nuestra plataforma para automatizar su atención al cliente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="p-8 text-center hover:shadow-hover transition-all duration-300 hover:-translate-y-2 gradient-card border-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${
                  index === 0 ? 'from-blue-500/10 to-blue-500/5' :
                  index === 1 ? 'from-purple-500/10 to-purple-500/5' :
                  index === 2 ? 'from-cyan-500/10 to-cyan-500/5' :
                  'from-green-500/10 to-green-500/5'
                } mb-4`}>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-2 text-primary">
                  {stat.value}
                </h3>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Stats;
