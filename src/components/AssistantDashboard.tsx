import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Settings, MessageSquare, Power, Tag, Zap, TrendingUp, Webhook, BarChart3, Clock, Menu, FileText, Download, Bell, Users, TestTube, PhoneCall, Plug, Filter, Send, Workflow, UserPlus, BookOpen, Brain, Smile, Calendar, LayoutTemplate, Sparkles, CalendarClock, CalendarCheck, Code } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FAQManager from "./FAQManager";
import WhatsAppConnection from "./WhatsAppConnection";
import ConversationsHistory from "./ConversationsHistory";
import AutoResponsesManager from "./AutoResponsesManager";
import BusinessHoursManager from "./BusinessHoursManager";
import BotSettingsManager from "./BotSettingsManager";
import AnalyticsDashboard from "./AnalyticsDashboard";
import TagsManager from "./TagsManager";
import QuickResponsesManager from "./QuickResponsesManager";
import WebhooksManager from "./WebhooksManager";
import AdvancedReports from "./AdvancedReports";
import MessageTemplatesManager from "./MessageTemplatesManager";
import DataExportManager from "./DataExportManager";
import LiveChatManager from "./LiveChatManager";
import CustomerSegmentation from "./CustomerSegmentation";
import ABTestingManager from "./ABTestingManager";
import CRMIntegrations from "./CRMIntegrations";
import CampaignsManager from "./CampaignsManager";
import WorkflowsManager from "./WorkflowsManager";
import TeamManager from "./TeamManager";
import KnowledgeBase from "./KnowledgeBase";
import IntentsManager from "./IntentsManager";
import SatisfactionDashboard from "./SatisfactionDashboard";
import CampaignsCalendar from "./CampaignsCalendar";
import ConversationTemplates from "./ConversationTemplates";
import AIAssistant from "./AIAssistant";
import CalendarIntegrationsManager from "./CalendarIntegrationsManager";
import BookingsManager from "./BookingsManager";
import NotificationTriggersManager from "./NotificationTriggersManager";
import IncomingWebhooksManager from "./IncomingWebhooksManager";
import APIManager from "./APIManager";

const AssistantDashboard = () => {
  const [assistant, setAssistant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics");
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadAssistant();
  }, []);

  const loadAssistant = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("assistants")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setAssistant(data);
    } catch (error: any) {
      console.error('Error loading assistant:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el asistente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async () => {
    try {
      const { error } = await supabase
        .from("assistants")
        .update({ is_active: !assistant.is_active })
        .eq("id", assistant.id);

      if (error) throw error;

      setAssistant({ ...assistant, is_active: !assistant.is_active });
      toast({
        title: assistant.is_active ? "Asistente desactivado" : "Asistente activado",
        description: assistant.is_active 
          ? "El asistente ya no responderá mensajes" 
          : "El asistente comenzará a responder mensajes",
      });
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
    <div className="space-y-6">
      <Card className="p-6 gradient-card shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{assistant?.name}</h2>
            <p className="text-muted-foreground mb-2">{assistant?.business_description}</p>
            {assistant?.phone_number && (
              <p className="text-sm text-primary font-medium">
                📱 {assistant.phone_number}
              </p>
            )}
          </div>
          <Button
            variant={assistant?.is_active ? "destructive" : "default"}
            onClick={toggleActive}
          >
            <Power className="w-4 h-4" />
            {assistant?.is_active ? "Desactivar" : "Activar"}
          </Button>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {isMobile ? (
          <div className="flex items-center gap-2 mb-4">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="w-4 h-4 mr-2" />
                  Menú
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-2 mt-6">
                  {[
                    { value: "analytics", icon: BarChart3, label: "Analytics" },
                    { value: "conversations", icon: MessageSquare, label: "Chats" },
                    { value: "live-chat", icon: PhoneCall, label: "Chat Vivo" },
                    { value: "campaigns", icon: Send, label: "Campañas" },
                    { value: "calendar", icon: Calendar, label: "Calendario" },
                    { value: "integrations-cal", icon: CalendarClock, label: "Integ. Calendarios" },
                    { value: "bookings", icon: CalendarCheck, label: "Reservas" },
                    { value: "notifications-auto", icon: Bell, label: "Notif. Auto" },
                    { value: "incoming-webhooks", icon: Webhook, label: "Webhooks CRM" },
                    { value: "api-rest", icon: Code, label: "API REST" },
                    { value: "workflows", icon: Workflow, label: "Flujos" },
                    { value: "team", icon: UserPlus, label: "Equipo" },
                    { value: "knowledge", icon: BookOpen, label: "Conocimiento" },
                    { value: "intents", icon: Brain, label: "Intents" },
                    { value: "templates-conv", icon: LayoutTemplate, label: "Plant. Conv" },
                    { value: "satisfaction", icon: Smile, label: "Satisfacción" },
                    { value: "ai-assistant", icon: Sparkles, label: "IA Asistente" },
                    { value: "whatsapp", icon: QrCode, label: "WhatsApp" },
                    { value: "faqs", icon: MessageSquare, label: "FAQs" },
                    { value: "responses", icon: MessageSquare, label: "Auto-Resp" },
                    { value: "templates", icon: FileText, label: "Plantillas" },
                    { value: "segments", icon: Filter, label: "Segmentos" },
                    { value: "ab-testing", icon: TestTube, label: "A/B Testing" },
                    { value: "crm", icon: Plug, label: "CRM" },
                    { value: "hours", icon: Clock, label: "Horarios" },
                    { value: "bot", icon: Settings, label: "Bot" },
                    { value: "tags", icon: Tag, label: "Etiquetas" },
                    { value: "quick", icon: Zap, label: "Rápidas" },
                    { value: "reports", icon: TrendingUp, label: "Reportes" },
                    { value: "export", icon: Download, label: "Exportar" },
                    { value: "webhooks", icon: Webhook, label: "Webhooks" },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Button
                        key={tab.value}
                        variant={activeTab === tab.value ? "default" : "ghost"}
                        className="justify-start"
                        onClick={() => {
                          setActiveTab(tab.value);
                          setSheetOpen(false);
                        }}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </Button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-sm font-medium">
              {activeTab === "analytics" && "Analytics"}
              {activeTab === "conversations" && "Chats"}
              {activeTab === "live-chat" && "Chat Vivo"}
              {activeTab === "campaigns" && "Campañas"}
              {activeTab === "workflows" && "Flujos"}
              {activeTab === "team" && "Equipo"}
              {activeTab === "knowledge" && "Conocimiento"}
              {activeTab === "intents" && "Intents"}
              {activeTab === "whatsapp" && "WhatsApp"}
              {activeTab === "faqs" && "FAQs"}
              {activeTab === "responses" && "Auto-Resp"}
              {activeTab === "templates" && "Plantillas"}
              {activeTab === "segments" && "Segmentos"}
              {activeTab === "ab-testing" && "A/B Testing"}
              {activeTab === "crm" && "CRM"}
              {activeTab === "hours" && "Horarios"}
              {activeTab === "bot" && "Bot"}
              {activeTab === "tags" && "Etiquetas"}
              {activeTab === "quick" && "Rápidas"}
              {activeTab === "reports" && "Reportes"}
              {activeTab === "export" && "Exportar"}
              {activeTab === "webhooks" && "Webhooks"}
            </span>
          </div>
        ) : (
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 gap-1">
            <TabsTrigger value="analytics" className="text-xs">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="conversations" className="text-xs">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Chats</span>
            </TabsTrigger>
            <TabsTrigger value="live-chat" className="text-xs">
              <PhoneCall className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Vivo</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">
              <FileText className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Reportes</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs">
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Exportar</span>
            </TabsTrigger>
            <TabsTrigger value="bot" className="text-xs">
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline ml-1">Config</span>
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="analytics">
          <AnalyticsDashboard assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="conversations">
          <ConversationsHistory assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="live-chat">
          <LiveChatManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="templates">
          <MessageTemplatesManager />
        </TabsContent>

        <TabsContent value="segments">
          <CustomerSegmentation />
        </TabsContent>

        <TabsContent value="ab-testing">
          <ABTestingManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="crm">
          <CRMIntegrations />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignsManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="calendar">
          <CampaignsCalendar assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="integrations-cal">
          <CalendarIntegrationsManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="notifications-auto">
          <NotificationTriggersManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="incoming-webhooks">
          <IncomingWebhooksManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="api-rest">
          <APIManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="workflows">
          <WorkflowsManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="team">
          <TeamManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="knowledge">
          <KnowledgeBase assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="intents">
          <IntentsManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="templates-conv">
          <ConversationTemplates assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="satisfaction">
          <SatisfactionDashboard assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="ai-assistant">
          <AIAssistant assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="export">
          <DataExportManager />
        </TabsContent>

        <TabsContent value="whatsapp">
          <WhatsAppConnection assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="faqs">
          <FAQManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="responses">
          <AutoResponsesManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="hours">
          <BusinessHoursManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="bot">
          <BotSettingsManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="tags">
          <TagsManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="quick">
          <QuickResponsesManager assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="reports">
          <AdvancedReports assistantId={assistant?.id} />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhooksManager assistantId={assistant?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssistantDashboard;
