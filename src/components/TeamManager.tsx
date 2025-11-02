import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { UserPlus, Users, Trash2, Shield, Clock, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeamManagerProps {
  assistantId: string;
}

const TeamManager = ({ assistantId }: TeamManagerProps) => {
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    role: "operator",
  });

  useEffect(() => {
    loadMembers();
    loadInvitations();
  }, [assistantId]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get emails for each member
      const membersWithEmails = await Promise.all(
        (data || []).map(async (member) => {
          const { data: emailData } = await supabase
            .rpc("get_team_member_email", { member_user_id: member.user_id });
          return { ...member, email: emailData };
        })
      );

      setMembers(membersWithEmails);
    } catch (error: any) {
      console.error("Error loading team members:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("assistant_id", assistantId)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error("Error loading invitations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const { error } = await supabase.functions.invoke("send-team-invitation", {
        body: {
          email: formData.email,
          role: formData.role,
          assistantId,
        },
      });

      if (error) throw error;

      toast({
        title: "Invitación enviada",
        description: `Se ha enviado una invitación a ${formData.email}`,
      });

      setFormData({ email: "", role: "operator" });
      setDialogOpen(false);
      loadInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Miembro activado" : "Miembro desactivado",
      });

      loadMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const { error } = await supabase.from("team_members").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Miembro eliminado",
      });

      loadMembers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const cancelInvitation = async (id: string) => {
    try {
      const { error } = await supabase.from("team_invitations").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Invitación cancelada",
      });

      loadInvitations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: any = {
      admin: "default",
      operator: "secondary",
      viewer: "outline",
    };

    return <Badge variant={variants[role] || "secondary"}>{role}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Equipo</h2>
          <p className="text-muted-foreground">Administra operadores y permisos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Invitar Miembro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar Miembro del Equipo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Rol</label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Acceso total</SelectItem>
                    <SelectItem value="operator">Operador - Gestionar chats</SelectItem>
                    <SelectItem value="viewer">Viewer - Solo lectura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Enviando..." : "Enviar Invitación"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Miembros ({members.length})</TabsTrigger>
          <TabsTrigger value="invitations">Invitaciones ({invitations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {members.map((member) => (
            <Card key={member.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{member.email || "Sin email"}</h3>
                      {getRoleBadge(member.role)}
                      {!member.is_active && <Badge variant="outline">Inactivo</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>Permisos: {Object.keys(member.permissions || {}).length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={member.is_active}
                    onCheckedChange={() => toggleActive(member.id, member.is_active)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMember(member.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {members.length === 0 && (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No hay miembros del equipo</h3>
              <p className="text-muted-foreground mb-4">Invita a operadores para gestionar los chats</p>
              <Button onClick={() => setDialogOpen(true)}>Invitar Miembro</Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          {invitations.map((invitation) => (
            <Card key={invitation.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{invitation.email}</h3>
                      {getRoleBadge(invitation.role)}
                      <Badge variant="outline" className="text-orange-600">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendiente
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expira: {new Date(invitation.expires_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => cancelInvitation(invitation.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}

          {invitations.length === 0 && (
            <Card className="p-12 text-center">
              <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No hay invitaciones pendientes</h3>
              <p className="text-muted-foreground">Las invitaciones aparecerán aquí cuando las envíes</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamManager;
