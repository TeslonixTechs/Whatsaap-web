import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, Lock, Bell, Palette } from "lucide-react";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    email: "",
    company_name: "",
  });

  const [preferences, setPreferences] = useState({
    timezone: "UTC",
    language: "es",
    notifications_enabled: true,
    email_notifications: true,
    theme: "system",
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile({
        email: user.email || "",
        company_name: data?.company_name || "",
      });
    } catch (error: any) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setPreferences(data);
      }
    } catch (error: any) {
      console.error("Error loading preferences:", error);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ company_name: profile.company_name })
        .eq("id", user.id);

      if (error) throw error;

      toast({ title: "Perfil actualizado" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
        });

      if (error) throw error;

      toast({ title: "Preferencias guardadas" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new,
      });

      if (error) throw error;

      toast({ title: "Contraseña actualizada" });
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mi Cuenta</h2>
        <p className="text-muted-foreground">Administra tu perfil y preferencias</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 mr-2" />
            Apariencia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={profile.email} disabled />
              </div>
              <div>
                <Label>Nombre de la Empresa</Label>
                <Input
                  value={profile.company_name}
                  onChange={(e) =>
                    setProfile({ ...profile, company_name: e.target.value })
                  }
                />
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label>Nueva Contraseña</Label>
                <Input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Confirmar Contraseña</Label>
                <Input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm: e.target.value })
                  }
                />
              </div>
              <Button onClick={changePassword} disabled={saving}>
                {saving ? "Cambiando..." : "Cambiar Contraseña"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Notificaciones</div>
                  <div className="text-sm text-muted-foreground">
                    Recibir notificaciones en la aplicación
                  </div>
                </div>
                <Switch
                  checked={preferences.notifications_enabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, notifications_enabled: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-sm text-muted-foreground">
                    Recibir notificaciones por email
                  </div>
                </div>
                <Switch
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, email_notifications: checked })
                  }
                />
              </div>
              <Button onClick={savePreferences} disabled={saving}>
                {saving ? "Guardando..." : "Guardar Preferencias"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label>Tema</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, theme: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Zona Horaria</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) =>
                    setPreferences({ ...preferences, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/Mexico_City">Ciudad de México</SelectItem>
                    <SelectItem value="America/Bogota">Bogotá</SelectItem>
                    <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires</SelectItem>
                    <SelectItem value="Europe/Madrid">Madrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={savePreferences} disabled={saving}>
                {saving ? "Guardando..." : "Guardar Preferencias"}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
