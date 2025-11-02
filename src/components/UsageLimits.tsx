import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Phone } from "lucide-react";

interface UsageLimitsProps {
  plan: {
    max_whatsapp_numbers: number;
    max_monthly_messages: number;
  } | null;
}

const UsageLimits = ({ plan }: UsageLimitsProps) => {
  const [usage, setUsage] = useState({
    messages_sent: 0,
    whatsapp_numbers_count: 0,
  });

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      const { data, error } = await supabase
        .from("usage_tracking")
        .select("*")
        .eq("user_id", user.id)
        .eq("month_year", currentMonth)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setUsage(data);
      }
    } catch (error: any) {
      console.error("Error loading usage:", error);
    }
  };

  if (!plan) return null;

  const messagesPercent = plan.max_monthly_messages === 999999 
    ? 0 
    : (usage.messages_sent / plan.max_monthly_messages) * 100;
  
  const numbersPercent = plan.max_whatsapp_numbers === 999 
    ? 0 
    : (usage.whatsapp_numbers_count / plan.max_whatsapp_numbers) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mensajes este mes</p>
            <p className="text-2xl font-bold">
              {usage.messages_sent.toLocaleString()} 
              {plan.max_monthly_messages !== 999999 && ` / ${plan.max_monthly_messages.toLocaleString()}`}
            </p>
          </div>
        </div>
        {plan.max_monthly_messages !== 999999 && (
          <Progress value={messagesPercent} className="h-2" />
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Números activos</p>
            <p className="text-2xl font-bold">
              {usage.whatsapp_numbers_count}
              {plan.max_whatsapp_numbers !== 999 && ` / ${plan.max_whatsapp_numbers}`}
            </p>
          </div>
        </div>
        {plan.max_whatsapp_numbers !== 999 && (
          <Progress value={numbersPercent} className="h-2" />
        )}
      </Card>
    </div>
  );
};

export default UsageLimits;
