import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { TestTube, Plus, Play, Pause, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface ABTest {
  id: string;
  name: string;
  description: string;
  variant_a: string;
  variant_b: string;
  status: string;
  winner: string | null;
  start_date: string;
  end_date: string;
}

const ABTestingManager = ({ assistantId }: { assistantId: string }) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    variant_a: "",
    variant_b: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTests();
  }, [assistantId]);

  const loadTests = async () => {
    try {
      const { data, error } = await supabase
        .from("ab_tests")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error: any) {
      console.error("Error loading AB tests:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("ab_tests")
        .insert([{
          ...formData,
          assistant_id: assistantId,
          status: "draft",
        }]);

      if (error) throw error;

      toast({ title: "Test A/B creado" });
      setDialogOpen(false);
      setFormData({ name: "", description: "", variant_a: "", variant_b: "" });
      loadTests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleTestStatus = async (testId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "running" ? "paused" : "running";
      const updateData: any = { status: newStatus };
      
      if (newStatus === "running" && currentStatus === "draft") {
        updateData.start_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from("ab_tests")
        .update(updateData)
        .eq("id", testId);

      if (error) throw error;

      toast({
        title: newStatus === "running" ? "Test iniciado" : "Test pausado",
      });
      loadTests();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">A/B Testing</h3>
          <p className="text-muted-foreground">Prueba diferentes respuestas y optimiza resultados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Test A/B</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nombre del Test</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Descripción</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Variante A (Control)</Label>
                  <Textarea
                    value={formData.variant_a}
                    onChange={(e) => setFormData({ ...formData, variant_a: e.target.value })}
                    rows={4}
                    placeholder="Mensaje actual..."
                    required
                  />
                </div>
                <div>
                  <Label>Variante B (Experimental)</Label>
                  <Textarea
                    value={formData.variant_b}
                    onChange={(e) => setFormData({ ...formData, variant_b: e.target.value })}
                    rows={4}
                    placeholder="Nuevo mensaje..."
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">Crear Test</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {tests.map((test) => (
          <Card key={test.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TestTube className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  test.status === "running" ? "bg-green-100 text-green-700" :
                  test.status === "paused" ? "bg-yellow-100 text-yellow-700" :
                  test.status === "completed" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {test.status === "running" && "En ejecución"}
                  {test.status === "paused" && "Pausado"}
                  {test.status === "completed" && "Completado"}
                  {test.status === "draft" && "Borrador"}
                </span>
                {test.status !== "completed" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleTestStatus(test.id, test.status)}
                  >
                    {test.status === "running" ? (
                      <><Pause className="w-4 h-4 mr-1" /> Pausar</>
                    ) : (
                      <><Play className="w-4 h-4 mr-1" /> Iniciar</>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Variante A</span>
                  {test.winner === "A" && <Trophy className="w-4 h-4 text-yellow-500" />}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{test.variant_a}</p>
                <Progress value={50} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">50% tráfico</p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Variante B</span>
                  {test.winner === "B" && <Trophy className="w-4 h-4 text-yellow-500" />}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{test.variant_b}</p>
                <Progress value={50} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">50% tráfico</p>
              </div>
            </div>

            {test.status === "running" && (
              <div className="text-xs text-muted-foreground">
                Iniciado: {new Date(test.start_date).toLocaleDateString()}
              </div>
            )}
          </Card>
        ))}

        {tests.length === 0 && (
          <Card className="p-12 text-center">
            <TestTube className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No hay tests A/B creados. Crea uno para empezar a optimizar tus respuestas.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ABTestingManager;
