import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar } from "lucide-react";

const ActivityLog = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const variants: any = {
      create: "default",
      update: "secondary",
      delete: "destructive",
      login: "outline",
    };
    return <Badge variant={variants[action] || "default"}>{action}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Registro de Actividad</h2>
        <p className="text-muted-foreground">Historial de acciones realizadas</p>
      </div>

      <Card className="p-6">
        <ScrollArea className="h-[600px]">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4" />
              <p>No hay actividad registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getActionBadge(activity.action)}
                      <span className="font-semibold">{activity.entity_type}</span>
                    </div>
                    {activity.details && Object.keys(activity.details).length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {JSON.stringify(activity.details)}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(activity.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

export default ActivityLog;
