import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  Users,
  Calendar
} from "lucide-react";

const ReportsTab = () => {
  const metrics = [
    {
      title: "Conversaciones",
      value: "1,247",
      change: "+12.5%",
      icon: MessageSquare,
      trend: "up"
    },
    {
      title: "Tiempo promedio",
      value: "2.3 min",
      change: "-8.2%",
      icon: Clock,
      trend: "down"
    },
    {
      title: "Satisfacción",
      value: "94%",
      change: "+3.1%",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Usuarios únicos",
      value: "843",
      change: "+18.7%",
      icon: Users,
      trend: "up"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Reportes y Analíticas</h2>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tus asistentes
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change} vs mes anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="conversations">Conversaciones</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actividad de los últimos 30 días</CardTitle>
              <CardDescription>
                Resumen de conversaciones y engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center border border-dashed rounded-lg">
                <div className="text-center space-y-2">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Gráfico de actividad aquí
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Conversaciones</CardTitle>
              <CardDescription>
                Métricas detalladas de las interacciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium">Total de mensajes</span>
                  <span className="text-2xl font-bold">4,328</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium">Tasa de respuesta automática</span>
                  <span className="text-2xl font-bold">87%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium">Escalado a humano</span>
                  <span className="text-2xl font-bold">13%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento del Bot</CardTitle>
              <CardDescription>
                Tiempos de respuesta y disponibilidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium">Tiempo de respuesta promedio</span>
                  <span className="text-2xl font-bold">0.8s</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium">Disponibilidad</span>
                  <span className="text-2xl font-bold">99.9%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium">Resolución en primera interacción</span>
                  <span className="text-2xl font-bold">76%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Usuarios</CardTitle>
              <CardDescription>
                Comportamiento y engagement de usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium">Usuarios activos (30d)</span>
                  <span className="text-2xl font-bold">843</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium">Nuevos usuarios</span>
                  <span className="text-2xl font-bold">127</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm font-medium">Usuarios recurrentes</span>
                  <span className="text-2xl font-bold">716</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsTab;
