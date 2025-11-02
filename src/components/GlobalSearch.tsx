import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Search in multiple tables
      const [conversations, campaigns, assistants, faqs] = await Promise.all([
        supabase
          .from("conversations")
          .select("*, assistants(name)")
          .textSearch("phone_number", searchQuery)
          .limit(5),
        supabase
          .from("campaigns")
          .select("*")
          .textSearch("name", searchQuery)
          .limit(5),
        supabase
          .from("assistants")
          .select("*")
          .eq("user_id", user.id)
          .textSearch("name", searchQuery)
          .limit(5),
        supabase
          .from("faqs")
          .select("*, assistants(name)")
          .textSearch("question", searchQuery)
          .limit(5),
      ]);

      const allResults = [
        ...(conversations.data?.map((item) => ({ ...item, type: "conversation" })) || []),
        ...(campaigns.data?.map((item) => ({ ...item, type: "campaign" })) || []),
        ...(assistants.data?.map((item) => ({ ...item, type: "assistant" })) || []),
        ...(faqs.data?.map((item) => ({ ...item, type: "faq" })) || []),
      ];

      setResults(allResults);
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Error en búsqueda",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const getResultBadge = (type: string) => {
    const variants: any = {
      conversation: "default",
      campaign: "secondary",
      assistant: "outline",
      faq: "default",
    };
    return <Badge variant={variants[type]}>{type}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Búsqueda Global</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversaciones, campañas, asistentes..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8"
              onClick={() => {
                setQuery("");
                setResults([]);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px] mt-4">
          {searching && (
            <div className="text-center py-8 text-muted-foreground">
              Buscando...
            </div>
          )}
          
          {!searching && query && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron resultados
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-semibold">
                        {result.name || result.phone_number || result.question}
                      </div>
                      {result.assistants?.name && (
                        <div className="text-sm text-muted-foreground">
                          {result.assistants.name}
                        </div>
                      )}
                    </div>
                    {getResultBadge(result.type)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;
