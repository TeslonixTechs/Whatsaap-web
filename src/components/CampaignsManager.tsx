import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Pause, Play, X, BarChart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface CampaignsManagerProps {
  assistantId: string;
}

const CampaignsManager = ({ assistantId }: CampaignsManagerProps) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    message: "",
    segment_id: "",
  });

  useEffect(() => {
    loadCampaigns();
    loadSegments();
  }, [assistantId]);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*, customer_segments(name)")
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
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

  const loadSegments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("customer_segments")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setSegments(data || []);
    } catch (error: any) {
      console.error("Error loading segments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("campaigns").insert({
        user_id: user.id,
        assistant_id: assistantId,
        name: formData.name,
        message: formData.message,
        segment_id: formData.segment_id || null,
        status: "draft",
      });

      if (error) throw error;

      toast({
        title: "Campaña creada",
        description: "La campaña ha sido creada correctamente",
      });

      setFormData({ name: "", message: "", segment_id: "" });
      setDialogOpen(false);
      loadCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      toast({
        title: "Enviando campaña",
        description: "La campaña se está enviando en segundo plano...",
      });

      const { error } = await supabase.functions.invoke("send-campaign", {
        body: { campaignId },
      });

      if (error) throw error;

      toast({
        title: "Campaña enviada",
        description: "La campaña se ha completado exitosamente",
      });

      loadCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const pauseCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: "paused" })
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: "Campaña pausada",
        description: "La campaña ha sido pausada",
      });

      loadCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resumeCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: "sending" })
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: "Campaña reanudada",
        description: "La campaña continuará enviándose",
      });

      loadCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const cancelCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: "cancelled" })
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: "Campaña cancelada",
        description: "La campaña ha sido cancelada",
      });

      loadCampaigns();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      draft: "secondary",
      sending: "default",
      completed: "default",
      paused: "secondary",
      cancelled: "destructive",
    };

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Campañas de Broadcast</h2>
          <p className="text-muted-foreground">Envía mensajes masivos a tus clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="w-4 h-4 mr-2" />
              Nueva Campaña
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Campaña</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre de la campaña</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Promoción Navidad 2024"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Mensaje</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Escribe el mensaje que se enviará a tus clientes..."
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo 60 mensajes por minuto (límite WhatsApp)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Segmento (opcional)</label>
                <Select value={formData.segment_id} onValueChange={(value) => setFormData({ ...formData, segment_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los clientes</SelectItem>
                    {segments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name} ({segment.customer_count} clientes)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">Crear Campaña</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{campaign.name}</h3>
                  {getStatusBadge(campaign.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-4">{campaign.message}</p>
                
                {campaign.total_recipients > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso: {campaign.sent_count + campaign.failed_count} / {campaign.total_recipients}</span>
                      <span className="text-muted-foreground">
                        {Math.round(((campaign.sent_count + campaign.failed_count) / campaign.total_recipients) * 100)}%
                      </span>
                    </div>
                    <Progress value={((campaign.sent_count + campaign.failed_count) / campaign.total_recipients) * 100} />
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>✓ Enviados: {campaign.sent_count}</span>
                      <span>✗ Fallidos: {campaign.failed_count}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {campaign.status === "draft" && (
                  <Button size="sm" onClick={() => sendCampaign(campaign.id)}>
                    <Send className="w-4 h-4" />
                  </Button>
                )}
                {campaign.status === "sending" && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => pauseCampaign(campaign.id)}>
                      <Pause className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => cancelCampaign(campaign.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
                {campaign.status === "paused" && (
                  <>
                    <Button size="sm" onClick={() => resumeCampaign(campaign.id)}>
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => cancelCampaign(campaign.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}

        {campaigns.length === 0 && (
          <Card className="p-12 text-center">
            <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No hay campañas</h3>
            <p className="text-muted-foreground mb-4">Crea tu primera campaña de broadcast</p>
            <Button onClick={() => setDialogOpen(true)}>Crear Campaña</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CampaignsManager;
