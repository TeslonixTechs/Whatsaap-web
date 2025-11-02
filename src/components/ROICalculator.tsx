import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, DollarSign, Clock, Users } from "lucide-react";

const ROICalculator = () => {
  const [employees, setEmployees] = useState(3);
  const [salaryPerEmployee, setSalaryPerEmployee] = useState(2000);
  const [messagesPerDay, setMessagesPerDay] = useState(200);

  // Cálculos
  const monthlyCostTraditional = employees * salaryPerEmployee;
  const monthlyCostAutomated = 99; // Plan básico
  const monthlySavings = monthlyCostTraditional - monthlyCostAutomated;
  const yearlySavings = monthlySavings * 12;
  const savingsPercentage = ((monthlySavings / monthlyCostTraditional) * 100).toFixed(0);
  const timeResponseTraditional = 5; // minutos
  const timeResponseAutomated = 0.1; // segundos
  const timeSavedPerMessage = timeResponseTraditional - (timeResponseAutomated / 60);
  const totalTimeSavedPerMonth = (timeSavedPerMessage * messagesPerDay * 30 / 60).toFixed(0);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <Badge className="mb-4" variant="secondary">
            Calculadora de ROI
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            ¿Cuánto Podrías <span className="text-primary">Ahorrar</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Calcula tu retorno de inversión en segundos
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <Card className="p-8">
              <h3 className="text-xl font-bold mb-6">Tu Situación Actual</h3>
              
              <div className="space-y-6">
                <div>
                  <Label>Empleados dedicados a atención: {employees}</Label>
                  <Slider
                    value={[employees]}
                    onValueChange={([value]) => setEmployees(value)}
                    min={1}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Salario mensual por empleado (€)</Label>
                  <Input
                    type="number"
                    value={salaryPerEmployee}
                    onChange={(e) => setSalaryPerEmployee(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Mensajes promedio por día: {messagesPerDay}</Label>
                  <Slider
                    value={[messagesPerDay]}
                    onValueChange={([value]) => setMessagesPerDay(value)}
                    min={50}
                    max={2000}
                    step={50}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ahorro Mensual</p>
                    <p className="text-4xl font-bold text-primary">€{monthlySavings.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  ¡Ahorra un {savingsPercentage}% cada mes!
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ahorro Anual</p>
                    <p className="text-3xl font-bold">€{yearlySavings.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Horas Ahorradas/Mes</p>
                    <p className="text-3xl font-bold">{totalTimeSavedPerMonth}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Respuesta instantánea vs {timeResponseTraditional} min promedio
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Mensajes/Mes</p>
                    <p className="text-3xl font-bold">{(messagesPerDay * 30).toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Sin límite de capacidad
                </p>
              </Card>
            </div>
          </div>

          <Card className="mt-8 p-6 bg-primary/5 border-2 border-primary/20">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">
                💡 Recuperarías la inversión en menos de 1 hora de uso
              </p>
              <p className="text-muted-foreground">
                Basado en €{monthlyCostAutomated}/mes vs €{monthlyCostTraditional.toLocaleString()}/mes en costos tradicionales
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;
