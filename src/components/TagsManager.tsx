import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TagsManagerProps {
  assistantId: string;
}

interface TagType {
  id: string;
  name: string;
  color: string;
}

const TagsManager = ({ assistantId }: TagsManagerProps) => {
  const [tags, setTags] = useState<TagType[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTags();
  }, [assistantId]);

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("name");

      if (error) throw error;
      setTags(data || []);
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

  const createTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la etiqueta no puede estar vacío",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("tags")
        .insert({
          assistant_id: assistantId,
          name: newTagName.trim(),
          color: newTagColor,
        });

      if (error) throw error;

      toast({
        title: "Etiqueta creada",
        description: `La etiqueta "${newTagName}" se creó correctamente`,
      });

      setNewTagName("");
      setNewTagColor("#3B82F6");
      loadTags();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteTag = async (tagId: string, tagName: string) => {
    try {
      const { error } = await supabase
        .from("tags")
        .delete()
        .eq("id", tagId);

      if (error) throw error;

      toast({
        title: "Etiqueta eliminada",
        description: `La etiqueta "${tagName}" se eliminó correctamente`,
      });

      loadTags();
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
        <Tag className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Etiquetas</h3>
      </div>

      <div className="space-y-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="tag-name">Nueva Etiqueta</Label>
            <Input
              id="tag-name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Ej: Ventas, Soporte, Reclamos"
              onKeyPress={(e) => e.key === "Enter" && createTag()}
            />
          </div>
          <div className="w-24">
            <Label htmlFor="tag-color">Color</Label>
            <Input
              id="tag-color"
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="h-10 cursor-pointer"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={createTag}>
              <Plus className="w-4 h-4" />
              Crear
            </Button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Etiquetas Existentes</h4>
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay etiquetas creadas aún
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color }}
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {tag.name}
                  <button
                    onClick={() => deleteTag(tag.id, tag.name)}
                    className="hover:opacity-70"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TagsManager;