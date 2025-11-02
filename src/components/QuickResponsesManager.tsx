import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Zap, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface QuickResponsesManagerProps {
  assistantId: string;
}

interface QuickResponse {
  id: string;
  title: string;
  content: string;
  shortcut: string | null;
  category: string | null;
  is_active: boolean;
}

const QuickResponsesManager = ({ assistantId }: QuickResponsesManagerProps) => {
  const [responses, setResponses] = useState<QuickResponse[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    shortcut: "",
    category: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadResponses();
  }, [assistantId]);

  const loadResponses = async () => {
    try {
      const { data, error } = await supabase
        .from("quick_responses")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("title");

      if (error) throw error;
      setResponses(data || []);
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

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      shortcut: "",
      category: "",
      is_active: true,
    });
    setEditingId(null);
  };

  const handleEdit = (response: QuickResponse) => {
    setFormData({
      title: response.title,
      content: response.content,
      shortcut: response.shortcut || "",
      category: response.category || "",
      is_active: response.is_active,
    });
    setEditingId(response.id);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "El título y contenido son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = {
        assistant_id: assistantId,
        title: formData.title.trim(),
        content: formData.content.trim(),
        shortcut: formData.shortcut.trim() || null,
        category: formData.category.trim() || null,
        is_active: formData.is_active,
      };

      if (editingId) {
        const { error } = await supabase
          .from("quick_responses")
          .update(data)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Respuesta actualizada",
          description: "La respuesta rápida se actualizó correctamente",
        });
      } else {
        const { error } = await supabase
          .from("quick_responses")
          .insert(data);

        if (error) throw error;

        toast({
          title: "Respuesta creada",
          description: "La respuesta rápida se creó correctamente",
        });
      }

      resetForm();
      loadResponses();
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
        .from("quick_responses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Respuesta eliminada",
        description: "La respuesta rápida se eliminó correctamente",
      });

      loadResponses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Respuestas Rápidas</h3>
      </div>

      <div className="space-y-6">
        <Card className="p-4 bg-muted/50">
          <h4 className="text-sm font-semibold mb-4">
            {editingId ? "Editar Respuesta" : "Nueva Respuesta"}
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Saludo inicial"
                />
              </div>
              <div>
                <Label htmlFor="shortcut">Atajo (opcional)</Label>
                <Input
                  id="shortcut"
                  value={formData.shortcut}
                  onChange={(e) => setFormData({ ...formData, shortcut: e.target.value })}
                  placeholder="Ej: /saludo"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Categoría (opcional)</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ej: Atención al cliente"
              />
            </div>

            <div>
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Escribe el mensaje..."
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Activa</Label>
              </div>

              <div className="flex gap-2">
                {editingId && (
                  <Button variant="outline" onClick={resetForm}>
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                )}
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  {editingId ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div>
          <h4 className="text-sm font-medium mb-3">Respuestas Guardadas</h4>
          {responses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay respuestas rápidas creadas aún
            </p>
          ) : (
            <div className="space-y-2">
              {responses.map((response) => (
                <Card key={response.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium">{response.title}</h5>
                        {response.shortcut && (
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {response.shortcut}
                          </code>
                        )}
                        {!response.is_active && (
                          <span className="text-xs text-muted-foreground">(Inactiva)</span>
                        )}
                      </div>
                      {response.category && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {response.category}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {response.content}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(response)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(response.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default QuickResponsesManager;