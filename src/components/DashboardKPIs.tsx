import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { MessageSquare, Users, TrendingUp, CheckCircle, Calendar, Phone } from "lucide-react";

const DashboardKPIs = () => {
  const [stats, setStats] = useState({
    totalConversations: 0,
    activeConversations: 0,
    totalMessages: 0,
    avgResponseTime: "0m",
    todayBookings: 0,
    totalAssistants: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get assistants
      const { data: assistants } = await supabase
        .from("assistants")
        .select("id")
        .eq("user_id", user.id);

      const assistantIds = assistants?.map((a) => a.id) || [];

      if (assistantIds.length === 0) {
        setLoading(false);
        return;
      }

      // Get conversations
      const { data: conversations } = await supabase
        .from("conversations")
        .select("*")
        .in("assistant_id", assistantIds);

      // Get today's bookings
      const today = new Date().toISOString().split("T")[0];
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .in("assistant_id", assistantIds)
        .gte("start_time", today);

      // Calculate stats
      const activeConvos = conversations?.filter((c) => c.status === "active").length || 0;
      const totalMessages = conversations?.reduce((sum, c) => sum + (c.total_messages || 0), 0) || 0;

      setStats({
        totalConversations: conversations?.length || 0,
        activeConversations: activeConvos,
        totalMessages,
        avgResponseTime: "2m 30s", // Placeholder
        todayBookings: bookings?.length || 0,
        totalAssistants: assistants?.length || 0,
      });
    } catch (error: any) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    {
      title: "Conversaciones Totales",
      value: stats.totalConversations,
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Conversaciones Activas",
      value: stats.activeConversations,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Mensajes Totales",
      value: stats.totalMessages,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Tiempo Respuesta Promedio",
      value: stats.avgResponseTime,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Reservas Hoy",
      value: stats.todayBookings,
      icon: Calendar,
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
    },
    {
      title: "Asistentes Activos",
      value: stats.totalAssistants,
      icon: Phone,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/20",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-8 bg-muted rounded w-1/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </p>
                <h3 className="text-3xl font-bold mt-2">{kpi.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full ${kpi.bgColor} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardKPIs;
