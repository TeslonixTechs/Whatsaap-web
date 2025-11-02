import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Clock, Save } from "lucide-react";

interface BusinessHoursManagerProps {
  assistantId: string;
}

interface BusinessHour {
  id?: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_active: boolean;
}

const daysOfWeek = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

const BusinessHoursManager = ({ assistantId }: BusinessHoursManagerProps) => {
  const [hours, setHours] = useState<Record<number, BusinessHour>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBusinessHours();
  }, [assistantId]);

  const loadBusinessHours = async () => {
    try {
      const { data, error } = await supabase
        .from("business_hours")
        .select("*")
        .eq("assistant_id", assistantId);

      if (error) throw error;

      const hoursMap: Record<number, BusinessHour> = {};
      data?.forEach((hour) => {
        hoursMap[hour.day_of_week] = hour;
      });
      
      // Initialize with default hours for days not set
      daysOfWeek.forEach(({ value }) => {
        if (!hoursMap[value]) {
          hoursMap[value] = {
            day_of_week: value,
            open_time: "09:00",
            close_time: "18:00",
            is_active: true,
          };
        }
      });

      setHours(hoursMap);
    } catch (error: any) {
      console.error("Error loading business hours:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveHours = async (dayOfWeek: number) => {
    try {
      const hour = hours[dayOfWeek];
      
      if (!hour.open_time || !hour.close_time) {
        toast({
          title: "Error",
          description: "Los horarios no pueden estar vacíos",
          variant: "destructive",
        });
        return;
      }

      const hourData = {
        assistant_id: assistantId,
        day_of_week: dayOfWeek,
        open_time: hour.open_time,
        close_time: hour.close_time,
        is_active: hour.is_active,
      };

      if (hour.id) {
        const { error } = await supabase
          .from("business_hours")
          .update(hourData)
          .eq("id", hour.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("business_hours")
          .insert(hourData)
          .select()
          .single();

        if (error) throw error;
        
        setHours((prev) => ({
          ...prev,
          [dayOfWeek]: { ...hour, id: data.id },
        }));
      }

      toast({
        title: "Guardado",
        description: "El horario se guardó correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateHour = (dayOfWeek: number, field: keyof BusinessHour, value: any) => {
    setHours((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value,
      },
    }));
  };

  const copyToAll = (dayOfWeek: number) => {
    const sourceHour = hours[dayOfWeek];
    const newHours = { ...hours };
    
    daysOfWeek.forEach(({ value }) => {
      newHours[value] = {
        ...newHours[value],
        open_time: sourceHour.open_time,
        close_time: sourceHour.close_time,
      };
    });
    
    setHours(newHours);
    toast({
      title: "Horarios copiados",
      description: "Los horarios se copiaron a todos los días",
    });
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
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Horarios de Atención</h3>
      </div>

      <div className="space-y-4">
        {daysOfWeek.map(({ value, label }) => (
          <div key={value} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="w-24">
              <Label className="font-semibold">{label}</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={hours[value]?.is_active ?? true}
                onCheckedChange={(checked) => updateHour(value, "is_active", checked)}
              />
              <Label className="text-sm">Abierto</Label>
            </div>

            <div className="flex-1 flex items-center gap-2">
              <div>
                <Label htmlFor={`open-${value}`} className="text-xs">Apertura</Label>
                <Input
                  id={`open-${value}`}
                  type="time"
                  value={hours[value]?.open_time ?? "09:00"}
                  onChange={(e) => updateHour(value, "open_time", e.target.value)}
                  disabled={!hours[value]?.is_active}
                />
              </div>

              <div>
                <Label htmlFor={`close-${value}`} className="text-xs">Cierre</Label>
                <Input
                  id={`close-${value}`}
                  type="time"
                  value={hours[value]?.close_time ?? "18:00"}
                  onChange={(e) => updateHour(value, "close_time", e.target.value)}
                  disabled={!hours[value]?.is_active}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToAll(value)}
              >
                Copiar a todos
              </Button>
              <Button
                size="sm"
                onClick={() => saveHours(value)}
              >
                <Save className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BusinessHoursManager;