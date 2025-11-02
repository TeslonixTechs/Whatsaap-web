import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  order_index: number;
}

interface FAQManagerProps {
  assistantId: string;
}

const FAQManager = ({ assistantId }: FAQManagerProps) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFaqs();
  }, [assistantId]);

  const loadFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .eq("assistant_id", assistantId)
        .order("order_index");

      if (error) throw error;
      setFaqs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las FAQs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newFaq.question || !newFaq.answer) {
      toast({
        title: "Error",
        description: "Completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("faqs")
        .insert({
          assistant_id: assistantId,
          question: newFaq.question,
          answer: newFaq.answer,
          order_index: faqs.length,
        });

      if (error) throw error;

      toast({ title: "FAQ agregada" });
      setNewFaq({ question: "", answer: "" });
      setShowAddForm(false);
      loadFaqs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, updates: Partial<FAQ>) => {
    try {
      const { error } = await supabase
        .from("faqs")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({ title: "FAQ actualizada" });
      setEditingId(null);
      loadFaqs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta FAQ?")) return;

    try {
      const { error } = await supabase
        .from("faqs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "FAQ eliminada" });
      loadFaqs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Preguntas Frecuentes</h3>
        <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline">
          <Plus className="w-4 h-4" />
          Agregar FAQ
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-4 space-y-4">
          <Input
            placeholder="Pregunta"
            value={newFaq.question}
            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
          />
          <Textarea
            placeholder="Respuesta"
            value={newFaq.answer}
            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={handleAdd}>
              <Save className="w-4 h-4" />
              Guardar
            </Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>
              <X className="w-4 h-4" />
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {faqs.map((faq) => (
          <Card key={faq.id} className="p-4">
            {editingId === faq.id ? (
              <div className="space-y-3">
                <Input
                  defaultValue={faq.question}
                  id={`question-${faq.id}`}
                />
                <Textarea
                  defaultValue={faq.answer}
                  id={`answer-${faq.id}`}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const question = (document.getElementById(`question-${faq.id}`) as HTMLInputElement).value;
                      const answer = (document.getElementById(`answer-${faq.id}`) as HTMLTextAreaElement).value;
                      handleUpdate(faq.id, { question, answer });
                    }}
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{faq.question}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingId(faq.id)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(faq.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Switch
                    checked={faq.is_active}
                    onCheckedChange={(checked) =>
                      handleUpdate(faq.id, { is_active: checked })
                    }
                  />
                  <Label className="text-sm">
                    {faq.is_active ? "Activa" : "Desactivada"}
                  </Label>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>

      {faqs.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          No hay FAQs configuradas. Agrega la primera!
        </Card>
      )}
    </div>
  );
};

export default FAQManager;
