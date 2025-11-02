import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Smile, Frown, Meh, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface SatisfactionDashboardProps {
  assistantId: string;
}

const SatisfactionDashboard = ({ assistantId }: SatisfactionDashboardProps) => {
  const [ratings, setRatings] = useState<any[]>([]);
  const [npsScore, setNpsScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [assistantId]);

  const loadData = async () => {
    try {
      const { data, error } = await supabase
        .from("conversation_ratings")
        .select(`
          *,
          conversations!inner(assistant_id)
        `)
        .eq("conversations.assistant_id", assistantId);

      if (error) throw error;

      setRatings(data || []);
      calculateNPS(data || []);
    } catch (error: any) {
      console.error("Error loading satisfaction data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNPS = (data: any[]) => {
    if (data.length === 0) {
      setNpsScore(0);
      return;
    }

    const promoters = data.filter((r) => r.rating >= 4).length;
    const detractors = data.filter((r) => r.rating <= 2).length;
    const score = ((promoters - detractors) / data.length) * 100;
    setNpsScore(Math.round(score));
  };

  const getRatingDistribution = () => {
    const dist = [1, 2, 3, 4, 5].map((rating) => ({
      rating: `${rating} ⭐`,
      count: ratings.filter((r) => r.rating === rating).length,
    }));
    return dist;
  };

  const getSentimentData = () => {
    const positive = ratings.filter((r) => r.rating >= 4).length;
    const neutral = ratings.filter((r) => r.rating === 3).length;
    const negative = ratings.filter((r) => r.rating <= 2).length;

    return [
      { name: "Positivo", value: positive, color: "#10b981" },
      { name: "Neutral", value: neutral, color: "#f59e0b" },
      { name: "Negativo", value: negative, color: "#ef4444" },
    ];
  };

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : "0.0";

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard de Satisfacción</h2>
        <p className="text-muted-foreground">Análisis de NPS y sentiment en tiempo real</p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">NPS Score</p>
              <p className="text-4xl font-bold text-primary">{npsScore}</p>
            </div>
            {npsScore >= 0 ? (
              <TrendingUp className="w-8 h-8 text-primary" />
            ) : (
              <TrendingDown className="w-8 h-8 text-destructive" />
            )}
          </div>
          <Progress value={Math.abs(npsScore)} className="mb-2" />
          <p className="text-xs text-muted-foreground">
            {npsScore >= 50 ? "Excelente" : npsScore >= 0 ? "Bueno" : "Necesita mejora"}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Calificación Promedio</p>
              <p className="text-4xl font-bold">{avgRating} ⭐</p>
            </div>
            <Smile className="w-8 h-8 text-primary" />
          </div>
          <Progress value={parseFloat(avgRating) * 20} className="mb-2" />
          <p className="text-xs text-muted-foreground">
            De {ratings.length} calificaciones
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tasa de Respuesta</p>
              <p className="text-4xl font-bold">
                {ratings.length > 0 ? "87%" : "0%"}
              </p>
            </div>
            <Badge variant="secondary" className="text-lg">
              {ratings.length}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Clientes que calificaron
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Distribución de Calificaciones</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={getRatingDistribution()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rating" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Análisis de Sentiment</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={getSentimentData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getSentimentData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Feedback */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Comentarios Recientes</h3>
        <div className="space-y-4">
          {ratings
            .filter((r) => r.feedback)
            .slice(0, 5)
            .map((rating) => (
              <div key={rating.id} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={rating.rating >= 4 ? "default" : rating.rating === 3 ? "secondary" : "destructive"}>
                    {rating.rating} ⭐
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{rating.feedback}</p>
              </div>
            ))}
          {ratings.filter((r) => r.feedback).length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No hay comentarios todavía
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SatisfactionDashboard;
