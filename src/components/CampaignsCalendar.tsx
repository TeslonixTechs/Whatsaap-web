import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Send, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CampaignsCalendarProps {
  assistantId: string;
}

const CampaignsCalendar = ({ assistantId }: CampaignsCalendarProps) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [scheduledCampaigns, setScheduledCampaigns] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, [assistantId]);

  const loadCampaigns = async () => {
    try {
      // Load regular campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("assistant_id", assistantId)
        .not("scheduled_for", "is", null)
        .order("scheduled_for", { ascending: true });

      if (campaignsError) throw campaignsError;

      // Load scheduled campaigns
      const { data: scheduledData, error: scheduledError } = await supabase
        .from("scheduled_campaigns")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("send_date", { ascending: true });

      if (scheduledError) throw scheduledError;

      setCampaigns(campaignsData || []);
      setScheduledCampaigns(scheduledData || []);
    } catch (error: any) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCampaignsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");

    const regularCampaigns = campaigns.filter((c) =>
      c.scheduled_for && format(new Date(c.scheduled_for), "yyyy-MM-dd") === dateStr
    );

    const scheduled = scheduledCampaigns.filter((c) =>
      format(new Date(c.send_date), "yyyy-MM-dd") === dateStr
    );

    return [...regularCampaigns, ...scheduled];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "sent":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "sending":
        return <Send className="w-4 h-4 text-primary animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      draft: "secondary",
      scheduled: "outline",
      sending: "default",
      completed: "default",
      sent: "default",
      paused: "secondary",
      cancelled: "destructive",
    };

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const modifiers = {
    hasCampaigns: campaigns
      .filter((c) => c.scheduled_for)
      .map((c) => new Date(c.scheduled_for))
      .concat(scheduledCampaigns.map((c) => new Date(c.send_date))),
  };

  const modifiersStyles = {
    hasCampaigns: {
      fontWeight: "bold",
      backgroundColor: "hsl(var(--primary) / 0.1)",
      borderRadius: "50%",
    },
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Calendario de Campañas</h2>
        <p className="text-muted-foreground">Visualiza y gestiona tus mensajes programados</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Calendario</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={es}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
          />
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-3 h-3 rounded-full bg-primary/20" />
            <span>Días con campañas programadas</span>
          </div>
        </Card>

        {/* Campaigns for selected date */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            {selectedDate
              ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })
              : "Selecciona una fecha"}
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedDate &&
              getCampaignsForDate(selectedDate).map((campaign, index) => (
                <Card key={index} className="p-4 border-l-4 border-primary">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(campaign.status)}
                      <h4 className="font-semibold">{campaign.name}</h4>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {campaign.message}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      🕐{" "}
                      {format(
                        new Date(campaign.scheduled_for || campaign.send_date),
                        "HH:mm"
                      )}
                    </span>
                    {campaign.total_recipients && (
                      <span>👥 {campaign.total_recipients} destinatarios</span>
                    )}
                    {campaign.repeat_type && (
                      <Badge variant="outline" className="text-xs">
                        Repite: {campaign.repeat_type}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}

            {selectedDate && getCampaignsForDate(selectedDate).length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No hay campañas programadas para este día
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Upcoming campaigns */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Próximas Campañas</h3>
        <div className="space-y-3">
          {[...campaigns, ...scheduledCampaigns]
            .filter(
              (c) =>
                new Date(c.scheduled_for || c.send_date) > new Date() &&
                (c.status === "draft" || c.status === "scheduled")
            )
            .sort(
              (a, b) =>
                new Date(a.scheduled_for || a.send_date).getTime() -
                new Date(b.scheduled_for || b.send_date).getTime()
            )
            .slice(0, 5)
            .map((campaign, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-soft transition-shadow"
              >
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{campaign.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {campaign.message}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium">
                    {format(
                      new Date(campaign.scheduled_for || campaign.send_date),
                      "d MMM, HH:mm",
                      { locale: es }
                    )}
                  </p>
                  {getStatusBadge(campaign.status)}
                </div>
              </div>
            ))}

          {[...campaigns, ...scheduledCampaigns].filter(
            (c) =>
              new Date(c.scheduled_for || c.send_date) > new Date() &&
              (c.status === "draft" || c.status === "scheduled")
          ).length === 0 && (
            <div className="text-center py-8">
              <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay campañas programadas</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CampaignsCalendar;
