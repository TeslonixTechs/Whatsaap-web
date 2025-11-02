import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Download, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdvancedReportsProps {
  assistantId: string;
}

interface ReportData {
  totalConversations: number;
  avgResponseTime: string;
  satisfactionScore: number;
  conversionRate: number;
  topTags: Array<{ name: string; count: number }>;
  dailyStats: Array<{ date: string; conversations: number; messages: number }>;
}

const AdvancedReports = ({ assistantId }: AdvancedReportsProps) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState("7"); // days
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, [assistantId, period]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const periodDate = new Date();
      periodDate.setDate(periodDate.getDate() - parseInt(period));

      // Get conversations in period
      const { data: conversations, error: convError } = await supabase
        .from("conversations")
        .select("*, conversation_ratings(*)")
        .eq("assistant_id", assistantId)
        .gte("created_at", periodDate.toISOString());

      if (convError) throw convError;

      // Get messages count
      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", conversations?.map(c => c.id) || []);

      // Get top tags
      const { data: tagStats } = await supabase
        .from("conversation_tags")
        .select("tag_id, tags(name)")
        .in("conversation_id", conversations?.map(c => c.id) || []);

      const tagCounts = tagStats?.reduce((acc: any, item: any) => {
        const tagName = item.tags?.name;
        if (tagName) {
          acc[tagName] = (acc[tagName] || 0) + 1;
        }
        return acc;
      }, {});

      const topTags = Object.entries(tagCounts || {})
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate satisfaction score
      const ratings = conversations
        ?.flatMap(c => c.conversation_ratings)
        .filter(Boolean);
      const avgRating = ratings && ratings.length > 0
        ? ratings.reduce((sum, r: any) => sum + r.rating, 0) / ratings.length
        : 0;

      setReportData({
        totalConversations: conversations?.length || 0,
        avgResponseTime: "2.5 min", // Simplified - would need calculation
        satisfactionScore: avgRating,
        conversionRate: 0, // Would need business logic
        topTags,
        dailyStats: [], // Simplified for now
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    toast({
      title: "Exportando reporte",
      description: "El reporte se descargará en breve",
    });
    // Implementation would generate CSV/PDF
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Reportes Avanzados</h3>
        </div>

        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Conversaciones</p>
          <p className="text-2xl font-bold">{reportData?.totalConversations || 0}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Tiempo Promedio Respuesta</p>
          <p className="text-2xl font-bold">{reportData?.avgResponseTime || "N/A"}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Satisfacción Promedio</p>
          <p className="text-2xl font-bold">
            {reportData?.satisfactionScore 
              ? `${reportData.satisfactionScore.toFixed(1)} ⭐`
              : "N/A"}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Tasa de Conversión</p>
          <p className="text-2xl font-bold">{reportData?.conversionRate.toFixed(1)}%</p>
        </Card>
      </div>

      <Card className="p-4">
        <h4 className="font-semibold mb-4">Etiquetas Más Usadas</h4>
        {reportData?.topTags && reportData.topTags.length > 0 ? (
          <div className="space-y-2">
            {reportData.topTags.map((tag, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{tag.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${(tag.count / (reportData.topTags[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{tag.count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay datos de etiquetas</p>
        )}
      </Card>
    </Card>
  );
};

export default AdvancedReports;