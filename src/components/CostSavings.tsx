import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, MessageSquare } from "lucide-react";

interface CostSavingsProps {
  totalConversations: number;
  totalMessages: number;
  avgConversationTime: number; // in minutes
}

const CostSavings = ({ totalConversations, totalMessages, avgConversationTime }: CostSavingsProps) => {
  // Cálculos de ahorro
  const costPerMinute = 0.5; // $0.50 por minuto de atención manual (ajustable)
  const avgMinutesPerConversation = avgConversationTime || 5; // default 5 minutos
  
  const totalMinutes = totalConversations * avgMinutesPerConversation;
  const totalSavings = totalMinutes * costPerMinute;
  const monthlySavings = totalSavings; // Asumiendo el período actual
  const yearlySavings = monthlySavings * 12;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ahorro Total</p>
            <p className="text-2xl font-bold">${totalSavings.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-500/10">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ahorro Anual</p>
            <p className="text-2xl font-bold">${yearlySavings.toFixed(2)}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-500/10">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tiempo Ahorrado</p>
            <p className="text-2xl font-bold">{totalMinutes.toFixed(0)} min</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Conversaciones</p>
            <p className="text-2xl font-bold">{totalConversations}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CostSavings;