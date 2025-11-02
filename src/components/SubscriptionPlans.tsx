import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2 } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  max_whatsapp_numbers: number;
  max_monthly_messages: number;
  price_monthly: number;
  is_trial?: boolean;
  trial_days?: number;
}

interface SubscriptionPlansProps {
  currentPlan?: Plan | null;
  onSubscribe?: () => void;
}

const SubscriptionPlans = ({ currentPlan, onSubscribe }: SubscriptionPlansProps) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly");

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error("Error loading plans:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: Plan) => {
    try {
      setSubscribingTo(plan.id);
      
      // Si es un plan de prueba, activarlo directamente
      if (plan.is_trial) {
        toast({
          title: "Plan de Prueba Activado",
          description: `Has activado el plan de prueba con 50 mensajes mensuales y 1 número de WhatsApp`,
        });
        onSubscribe?.();
        setSubscribingTo(null);
        return;
      }

      // Para planes de pago, usar Stripe
      if (!plan.stripe_price_id) {
        throw new Error("Este plan no está disponible");
      }

      const { data, error } = await supabase.functions.invoke("create-subscription", {
        body: { priceId: plan.stripe_price_id },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
        onSubscribe?.();
      }
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la suscripción",
        variant: "destructive",
      });
    } finally {
      setSubscribingTo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => {
        const isCurrentPlan = currentPlan?.stripe_product_id === plan.stripe_product_id;
        
        return (
          <Card 
            key={plan.id} 
            className={`p-6 ${isCurrentPlan ? 'border-primary border-2 shadow-lg' : ''} ${plan.is_trial ? 'border-green-500 border-2' : ''}`}
          >
            {isCurrentPlan && (
              <div className="mb-4 text-center">
                <span className="inline-block px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-full">
                  Plan Actual
                </span>
              </div>
            )}
            
            {plan.is_trial && !isCurrentPlan && (
              <div className="mb-4 text-center">
                <span className="inline-block px-3 py-1 text-sm font-semibold text-green-600 bg-green-100 dark:bg-green-900/20 rounded-full">
                  Recomendado para empezar
                </span>
              </div>
            )}
            
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="mb-4">
              {plan.is_trial ? (
                <>
                  <span className="text-4xl font-bold text-green-600">Gratis</span>
                  <div className="text-sm text-muted-foreground mt-1">
                    {plan.trial_days} días de prueba
                  </div>
                </>
              ) : (
                <>
                  <span className="text-4xl font-bold">{(plan.price_monthly / 100).toFixed(0)}€</span>
                  <span className="text-muted-foreground">/mes</span>
                </>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  {plan.max_whatsapp_numbers === 999 
                    ? "Números ilimitados" 
                    : `${plan.max_whatsapp_numbers} ${plan.max_whatsapp_numbers === 1 ? 'número' : 'números'} de WhatsApp`}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  {plan.max_monthly_messages === 999999 
                    ? "Mensajes ilimitados" 
                    : `${plan.max_monthly_messages.toLocaleString()} mensajes/mes`}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Soporte por email</span>
              </li>
              {!plan.is_trial && (
                <>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Analytics avanzados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Integraciones</span>
                  </li>
                </>
              )}
            </ul>

            <Button
              className="w-full"
              onClick={() => handleSubscribe(plan)}
              disabled={isCurrentPlan || subscribingTo === plan.id}
              variant={isCurrentPlan ? "outline" : plan.is_trial ? "default" : "default"}
            >
              {subscribingTo === plan.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isCurrentPlan ? "Plan Actual" : plan.is_trial ? "Empezar Prueba" : "Suscribirse"}
            </Button>
          </Card>
        );
      })}
    </div>
  );
};

export default SubscriptionPlans;
