import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Check, X, Clock, Phone, User, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Booking {
  id: string;
  customer_phone: string;
  customer_name: string | null;
  service_type: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number | null;
  notes: string | null;
  created_at: string;
}

const BookingsManager = ({ assistantId }: { assistantId: string }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customer_phone: "",
    customer_name: "",
    service_type: "",
    start_time: "",
    end_time: "",
    price: "",
    notes: "",
  });

  useEffect(() => {
    loadBookings();
  }, [assistantId, filterStatus]);

  const loadBookings = async () => {
    try {
      let query = supabase
        .from("bookings")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("start_time", { ascending: true });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      console.error("Error loading bookings:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las reservas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase.from("bookings").insert({
        assistant_id: assistantId,
        customer_phone: formData.customer_phone,
        customer_name: formData.customer_name || null,
        service_type: formData.service_type,
        start_time: formData.start_time,
        end_time: formData.end_time,
        price: formData.price ? parseFloat(formData.price) : null,
        notes: formData.notes || null,
        status: "confirmed",
      });

      if (error) throw error;

      toast({
        title: "Reserva creada",
        description: "La reserva se ha registrado correctamente",
      });

      setDialogOpen(false);
      loadBookings();
      setFormData({
        customer_phone: "",
        customer_name: "",
        service_type: "",
        start_time: "",
        end_time: "",
        price: "",
        notes: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      // Verificar si existe conversación activa con el cliente
      const { data: booking } = await supabase
        .from("bookings")
        .select("customer_phone")
        .eq("id", id)
        .single();

      if (booking) {
        const { data: conversation } = await supabase
          .from("conversations")
          .select("id, started_at")
          .eq("phone_number", booking.customer_phone)
          .eq("assistant_id", assistantId)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!conversation) {
          toast({
            title: "⚠️ Sin conversación activa",
            description: "Este cliente no ha iniciado conversación por WhatsApp. Las notificaciones automáticas no se enviarán.",
            variant: "destructive",
          });
        } else {
          const hoursSinceLastMessage = (Date.now() - new Date(conversation.started_at).getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastMessage > 24) {
            toast({
              title: "⚠️ Ventana de 24h expirada",
              description: "Han pasado más de 24h desde el último mensaje. La notificación no se enviará por políticas de WhatsApp.",
              variant: "destructive",
            });
          }
        }
      }

      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
      });

      loadBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "confirmed":
        return "Confirmada";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
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
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-sm">
          <strong>💡 Recordatorio:</strong> Para que las notificaciones automáticas funcionen, 
          el cliente debe haber iniciado una conversación por WhatsApp en las últimas 24 horas.
          <br />
          <span className="text-xs text-muted-foreground mt-1 block">
            Si creaste esta reserva manualmente y el cliente no te escribió primero por WhatsApp, 
            la notificación automática no se enviará.
          </span>
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Gestión de Reservas
          </h2>
          <p className="text-muted-foreground">
            Administra todas las reservas y citas de tus clientes
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Reserva
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Reserva</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Teléfono del Cliente *</Label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    placeholder="+34 600 123 456"
                  />
                </div>
                <div>
                  <Label>Nombre del Cliente</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>

              <div>
                <Label>Tipo de Servicio *</Label>
                <Input
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  placeholder="Ej: Corte de cabello, Check-in apartamento, Reparación"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha y Hora de Inicio *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fecha y Hora de Fin *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Precio (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="50.00"
                />
              </div>

              <div>
                <Label>Notas</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Información adicional sobre la reserva..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                Crear Reserva
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
          <Button
            key={status}
            variant={filterStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(status)}
          >
            {status === "all" ? "Todas" : getStatusLabel(status)}
          </Button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay reservas</h3>
          <p className="text-muted-foreground mb-4">
            Crea la primera reserva o espera a que los clientes reserven por WhatsApp
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Primera Reserva
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">{booking.service_type}</h3>
                    <Badge variant={getStatusColor(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.customer_name || "Sin nombre"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{booking.customer_phone}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {format(new Date(booking.start_time), "PPp", { locale: es })}
                        </span>
                      </div>
                      {booking.price && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">€{booking.price}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {booking.notes && (
                    <p className="mt-3 text-sm text-muted-foreground italic">
                      {booking.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {booking.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(booking.id, "confirmed")}
                    >
                      <Check className="w-4 h-4" />
                      Confirmar
                    </Button>
                  )}
                  {booking.status === "confirmed" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateStatus(booking.id, "completed")}
                    >
                      <Check className="w-4 h-4" />
                      Completar
                    </Button>
                  )}
                  {booking.status !== "cancelled" && booking.status !== "completed" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateStatus(booking.id, "cancelled")}
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsManager;
