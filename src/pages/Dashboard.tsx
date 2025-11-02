import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, LayoutDashboard, Search, Settings, BarChart3, Users,
  MessageSquare, BookOpen, Webhook, GitBranch, TrendingUp, Zap, Database,
  MoreHorizontal, ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import AssistantSetup from "@/components/AssistantSetup";
import AssistantDashboard from "@/components/AssistantDashboard";
import AssistantConfigTab from "@/components/AssistantConfigTab";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import UsageLimits from "@/components/UsageLimits";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import GlobalSearch from "@/components/GlobalSearch";
import UserProfile from "@/components/UserProfile";
import ActivityLog from "@/components/ActivityLog";
import RolePermissions from "@/components/RolePermissions";
import DashboardKPIs from "@/components/DashboardKPIs";
import UserMenu from "@/components/UserMenu";
import ReportsTab from "@/components/ReportsTab";
import TeamManager from "@/components/TeamManager";
import CampaignsManager from "@/components/CampaignsManager";
import ConversationsHistory from "@/components/ConversationsHistory";
import KnowledgeBase from "@/components/KnowledgeBase";
import WebhooksManager from "@/components/WebhooksManager";
import WorkflowsManager from "@/components/WorkflowsManager";
import SatisfactionDashboard from "@/components/SatisfactionDashboard";
import ABTestingManager from "@/components/ABTestingManager";
import CustomerSegmentation from "@/components/CustomerSegmentation";
import APIManager from "@/components/APIManager";
import DataExportManager from "@/components/DataExportManager";
import CRMIntegrations from "@/components/CRMIntegrations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [hasAssistant, setHasAssistant] = useState(false);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(hasAssistant ? "overview" : "subscription");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if user has an assistant
      const { data: assistant } = await supabase
        .from("assistants")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setHasAssistant(!!assistant);
      if (assistant) {
        setAssistantId(assistant.id);
      }
      setLoading(false);
      
      // Check subscription status
      checkSubscription();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        checkSubscription();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkSubscription = async () => {
    try {
      setCheckingSubscription(true);
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;
      setSubscription(data);
    } catch (error: any) {
      console.error("Error checking subscription:", error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const updateAssistantState = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;
      const { data: assistant } = await supabase
        .from("assistants")
        .select("id")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .maybeSingle();
      if (assistant) {
        setHasAssistant(true);
        setAssistantId(assistant.id);
      }
    } catch (e) {
      console.error("updateAssistantState error", e);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error("Error opening customer portal:", error);
      toast({
        title: "Error",
        description: "No se pudo abrir el portal de suscripciones",
        variant: "destructive",
      });
    }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sesión cerrada",
      description: "Hasta pronto!",
    });
    navigate("/");
  };

  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">Panel de Control</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="w-5 h-5" />
            </Button>
            <NotificationsDropdown />
            {subscription?.subscribed && (
              <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                <CreditCard className="w-4 h-4 mr-2" />
                Gestionar Suscripción
              </Button>
            )}
            <UserMenu
              userEmail={user?.email || ""}
              onNavigate={(section) => setCurrentSection(section)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Dialogs for user sections */}
      <Dialog open={currentSection === "profile"} onOpenChange={(open) => !open && setCurrentSection(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <UserProfile />
        </DialogContent>
      </Dialog>

      <Dialog open={currentSection === "activity"} onOpenChange={(open) => !open && setCurrentSection(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ActivityLog />
        </DialogContent>
      </Dialog>

      <Dialog open={currentSection === "permissions"} onOpenChange={(open) => !open && setCurrentSection(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <RolePermissions />
        </DialogContent>
      </Dialog>

      <Dialog open={currentSection === "settings"} onOpenChange={(open) => !open && setCurrentSection(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configuración</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p className="text-muted-foreground">Las opciones de configuración están en la sección de Perfil.</p>
          </div>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-8">
        {subscription?.subscribed && subscription?.plan && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plan Actual</p>
                <p className="text-xl font-bold">{subscription.plan.name}</p>
              </div>
              {subscription.subscription_end && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Próxima renovación</p>
                  <p className="text-sm font-medium">
                    {new Date(subscription.subscription_end).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-6 w-full">
            <TabsList className="w-full sm:flex-1 grid grid-cols-1 sm:grid-cols-3 h-auto">
              <TabsTrigger value="overview" className="py-3 text-xs sm:text-sm">
                <LayoutDashboard className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Inicio</span>
                <span className="sm:hidden">Inicio</span>
              </TabsTrigger>
              <TabsTrigger value="assistant" className="py-3 text-xs sm:text-sm">
                <Settings className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Asistente</span>
                <span className="sm:hidden">Config</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="py-3 text-xs sm:text-sm">
                <CreditCard className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Suscripción</span>
                <span className="sm:hidden">Plan</span>
              </TabsTrigger>
            </TabsList>
            
            {hasAssistant && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="default" className="w-full sm:w-auto">
                    <MoreHorizontal className="w-4 h-4 mr-2" />
                    <span className="flex-1 sm:flex-none">Más opciones</span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-background z-50">
                  <DropdownMenuItem onClick={() => setActiveTab("conversations")} className="cursor-pointer">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Conversaciones
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("knowledge")} className="cursor-pointer">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Base de Conocimiento
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("workflows")} className="cursor-pointer">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Workflows
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("assistant")} className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab("reports")} className="cursor-pointer">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Reportes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("satisfaction")} className="cursor-pointer">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Satisfacción
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab("campaigns")} className="cursor-pointer">
                    <Zap className="w-4 h-4 mr-2" />
                    Campañas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("segments")} className="cursor-pointer">
                    <Users className="w-4 h-4 mr-2" />
                    Segmentos
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveTab("webhooks")} className="cursor-pointer">
                    <Webhook className="w-4 h-4 mr-2" />
                    Webhooks
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("integrations")} className="cursor-pointer">
                    <Database className="w-4 h-4 mr-2" />
                    Integraciones CRM
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("team")} className="cursor-pointer">
                    <Users className="w-4 h-4 mr-2" />
                    Equipo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <TabsContent value="overview">
            <div className="space-y-6">
              <DashboardKPIs />
              {hasAssistant && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Resumen Rápido</h3>
                  <p className="text-muted-foreground">
                    Bienvenido a tu panel de control. Aquí puedes ver las métricas principales de tus asistentes.
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assistant">
            {assistantId ? (
              <AssistantConfigTab 
                assistantId={assistantId} 
                onDeleted={async () => {
                  setAssistantId(null);
                  setHasAssistant(false);
                }} 
              />
            ) : (
              <AssistantSetup onComplete={async () => { await updateAssistantState(); setActiveTab("assistant"); }} />
            )}
          </TabsContent>

          <TabsContent value="conversations">
            {assistantId && <ConversationsHistory assistantId={assistantId} />}
          </TabsContent>

          <TabsContent value="knowledge">
            {assistantId && <KnowledgeBase assistantId={assistantId} />}
          </TabsContent>

          <TabsContent value="workflows">
            {assistantId && <WorkflowsManager assistantId={assistantId} />}
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="satisfaction">
            {assistantId && <SatisfactionDashboard assistantId={assistantId} />}
          </TabsContent>

          <TabsContent value="campaigns">
            {assistantId && <CampaignsManager assistantId={assistantId} />}
          </TabsContent>

          <TabsContent value="segments">
            <CustomerSegmentation />
          </TabsContent>

          <TabsContent value="webhooks">
            {assistantId && <WebhooksManager assistantId={assistantId} />}
          </TabsContent>

          <TabsContent value="integrations">
            <div className="space-y-6">
              <CRMIntegrations />
              {assistantId && <APIManager assistantId={assistantId} />}
              <DataExportManager />
            </div>
          </TabsContent>

          <TabsContent value="team">
            {assistantId && <TeamManager assistantId={assistantId} />}
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            {subscription?.plan && <UsageLimits plan={subscription.plan} />}
            
            <div>
              <h2 className="text-2xl font-bold mb-4">
                {subscription?.subscribed ? "Cambiar Plan" : "Selecciona tu Plan"}
              </h2>
              <SubscriptionPlans 
                currentPlan={subscription?.plan}
                onSubscribe={checkSubscription}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
