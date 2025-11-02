import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  usage_count: number;
}

const MessageTemplatesManager = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    content: "",
    category: "",
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("usage_count", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error loading templates:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingTemplate) {
        const { error } = await supabase
          .from("message_templates")
          .update(formData)
          .eq("id", editingTemplate.id);

        if (error) throw error;
        toast({ title: "Plantilla actualizada" });
      } else {
        const { error } = await supabase
          .from("message_templates")
          .insert([{ ...formData, user_id: user.id }]);

        if (error) throw error;
        toast({ title: "Plantilla creada" });
      }

      setDialogOpen(false);
      setEditingTemplate(null);
      setFormData({ name: "", content: "", category: "" });
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("message_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Plantilla eliminada" });
      loadTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category || "",
    });
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Plantillas de Mensajes</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTemplate(null);
              setFormData({ name: "", content: "", category: "" });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar" : "Nueva"} Plantilla
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Categoría</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ej: Bienvenida, Seguimiento"
                />
              </div>
              <div>
                <Label>Contenido</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingTemplate ? "Actualizar" : "Crear"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold">{template.name}</h4>
                {template.category && (
                  <span className="text-xs text-muted-foreground">{template.category}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(template)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(template.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{template.content}</p>
            <p className="text-xs text-muted-foreground">Usado {template.usage_count} veces</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MessageTemplatesManager;
