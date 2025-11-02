import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, BookOpen, Trash2, Link as LinkIcon, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface KnowledgeBaseProps {
  assistantId: string;
}

const KnowledgeBase = ({ assistantId }: KnowledgeBaseProps) => {
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    source_type: "manual",
    source_url: "",
    tags: "",
  });

  useEffect(() => {
    loadKnowledge();
  }, [assistantId]);

  const loadKnowledge = async () => {
    try {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setKnowledge(data || []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const tags = formData.tags.split(",").map(t => t.trim()).filter(t => t);
      
      const { error } = await supabase.from("knowledge_base").insert({
        assistant_id: assistantId,
        title: formData.title,
        content: formData.content,
        source_type: formData.source_type,
        source_url: formData.source_url || null,
        tags,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Conocimiento agregado",
        description: "La información ha sido añadida a la base de conocimiento",
      });

      setFormData({
        title: "",
        content: "",
        source_type: "manual",
        source_url: "",
        tags: "",
      });
      setDialogOpen(false);
      loadKnowledge();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("knowledge_base")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: !currentStatus ? "Conocimiento activado" : "Conocimiento desactivado",
      });

      loadKnowledge();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteKnowledge = async (id: string) => {
    try {
      const { error } = await supabase.from("knowledge_base").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Conocimiento eliminado",
      });

      loadKnowledge();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "url":
        return <LinkIcon className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Base de Conocimiento</h2>
          <p className="text-muted-foreground">Entrena al bot con información relevante</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Conocimiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Conocimiento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Horarios de atención"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tipo de fuente</label>
                <Select value={formData.source_type} onValueChange={(value) => setFormData({ ...formData, source_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="document">Documento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.source_type === "url" && (
                <div>
                  <label className="text-sm font-medium">URL</label>
                  <Input
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    placeholder="https://ejemplo.com/info"
                    type="url"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Contenido</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Escribe la información que el bot debe conocer..."
                  rows={6}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Etiquetas (separadas por comas)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="horarios, precios, servicios"
                />
              </div>

              <Button type="submit" className="w-full">Agregar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {knowledge.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getSourceIcon(item.source_type)}
                  <h3 className="font-semibold">{item.title}</h3>
                  {!item.is_active && <Badge variant="outline">Inactivo</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.content}</p>
                
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {item.source_url && (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    {item.source_url}
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={item.is_active}
                  onCheckedChange={() => toggleActive(item.id, item.is_active)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteKnowledge(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {knowledge.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No hay conocimiento agregado</h3>
            <p className="text-muted-foreground mb-4">Agrega información para entrenar al bot</p>
            <Button onClick={() => setDialogOpen(true)}>Agregar Conocimiento</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
