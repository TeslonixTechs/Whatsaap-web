import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExportJob {
  id: string;
  export_type: string;
  format: string;
  status: string;
  file_url: string | null;
  created_at: string;
}

const DataExportManager = () => {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportType, setExportType] = useState("conversations");
  const [format, setFormat] = useState("csv");
  const { toast } = useToast();

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("export_jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error("Error loading export jobs:", error);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke("export-data", {
        body: { exportType, format },
      });

      if (error) throw error;

      toast({
        title: "Exportación iniciada",
        description: "Te notificaremos cuando esté lista",
      });

      loadJobs();
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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Exportar Datos</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Tipo de datos</label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conversations">Conversaciones</SelectItem>
                <SelectItem value="messages">Mensajes</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="contacts">Contactos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Formato</label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleExport} disabled={loading} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Exportaciones Recientes</h3>
        <div className="space-y-2">
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay exportaciones aún
            </p>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {job.export_type} ({job.format.toUpperCase()})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      job.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : job.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {job.status === "completed" && "Completado"}
                    {job.status === "pending" && "Procesando"}
                    {job.status === "failed" && "Error"}
                  </span>
                  {job.file_url && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={job.file_url} download>
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default DataExportManager;
