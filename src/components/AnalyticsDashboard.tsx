import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BarChart, MessageSquare, Clock, TrendingUp } from "lucide-react";
import CostSavings from "./CostSavings";

interface AnalyticsDashboardProps {
  assistantId: string;
}

interface Stats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  todayConversations: number;
}

const AnalyticsDashboard = ({ assistantId }: AnalyticsDashboardProps) => {
  const [stats, setStats] = useState<Stats>({
    totalConversations: 0,
    activeConversations: 0,
    totalMessages: 0,
    avgMessagesPerConversation: 0,
    todayConversations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [assistantId]);

  const loadStats = async () => {
    try {
      // Total conversations
      const { count: totalConv } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("assistant_id", assistantId);

      // Active conversations
      const { count: activeConv } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("assistant_id", assistantId)
        .eq("status", "active");

      // Total messages
      const { count: totalMsg } = await supabase
        .from("messages")
        .select("conversation_id", { count: "exact", head: true })
        .in("conversation_id", 
          (await supabase
            .from("conversations")
            .select("id")
            .eq("assistant_id", assistantId)
          ).data?.map(c => c.id) || []
        );

      // Today's conversations
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: todayConv } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("assistant_id", assistantId)
        .gte("started_at", today.toISOString());

      const avgMessages = totalConv && totalMsg 
        ? Math.round(totalMsg / totalConv) 
        : 0;

      setStats({
        totalConversations: totalConv || 0,
        activeConversations: activeConv || 0,
        totalMessages: totalMsg || 0,
        avgMessagesPerConversation: avgMessages,
        todayConversations: todayConv || 0,
      });
    } catch (error: any) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CostSavings 
        totalConversations={stats.totalConversations}
        totalMessages={stats.totalMessages}
        avgConversationTime={5}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Conversaciones</p>
            <p className="text-2xl font-bold">{stats.totalConversations}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Activas Ahora</p>
            <p className="text-2xl font-bold">{stats.activeConversations}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <BarChart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mensajes Totales</p>
            <p className="text-2xl font-bold">{stats.totalMessages}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hoy</p>
            <p className="text-2xl font-bold">{stats.todayConversations}</p>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;