import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Phone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WhatsAppConnectionProps {
  assistantId: string;
}

// Define the base URL for your local WhatsApp server
const WHATSAPP_API_BASE = "https://whatsaap-web.onrender.com";

const WhatsAppConnection = ({ assistantId }: WhatsAppConnectionProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'number' | 'qr' | 'connected'>('number');
  const [lastStatus, setLastStatus] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check initial status when the component mounts
    handleRefreshStatus();
  }, [assistantId]);

  const handleContinue = async () => {
    setLoading(true);
    setQrCode("");
    setStep('qr');
    
    try {
      // 1. Initialize the connection on the local server
      const initResponse = await fetch(`${WHATSAPP_API_BASE}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId }),
      });

      if (!initResponse.ok) {
        let errorMessage = "Failed to initialize WhatsApp connection.";
        try {
          const errorData = await initResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, get it as plain text
          errorMessage = await initResponse.text();
        }
        throw new Error(errorMessage);
      }

      toast({
        title: "Generating QR Code",
        description: "Please wait a moment...",
      });

      // 2. Start polling for the QR code and connection status
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`${WHATSAPP_API_BASE}/status/${assistantId}`);
          if (!statusResponse.ok) return; // Silently fail and retry

          const statusData = await statusResponse.json();
          setLastStatus(statusData);
          console.log('WhatsApp Status:', statusData);

          // If QR code is available, display it
          if (statusData.qrCode) {
            setQrCode(statusData.qrCode);
            if (step !== 'qr') setStep('qr');
          }

          // If connected, update UI and stop polling
          if (statusData.status === 'ready' || statusData.status === 'authenticated') {
            clearInterval(pollInterval);
            setIsConnected(true);
            setStep('connected');
            setQrCode(""); // Clear QR
            toast({
              title: "Success!",
              description: "WhatsApp Business is now connected.",
            });
          }
          
          // Handle other statuses if necessary (e.g., timeout, error)
          if (statusData.status === 'disconnected' || statusData.status === 'auth_failure') {
             clearInterval(pollInterval);
             setStep('number');
             toast({
                title: "Disconnected",
                description: "The session has ended. Please try again.",
                variant: "destructive",
             });
          }

        } catch (pollError) {
          console.error("Polling error:", pollError);
        }
      }, 3000); // Poll every 3 seconds

      // Clear polling after 2 minutes to prevent infinite loops
      setTimeout(() => {
        clearInterval(pollInterval);
        if (!isConnected) {
            console.log("Polling timed out.");
        }
      }, 120000);

    } catch (error: any) {
      console.error('Error in handleContinue:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect WhatsApp.",
        variant: "destructive",
      });
      setStep('number');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${WHATSAPP_API_BASE}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assistantId }),
      });
      
      if (!response.ok) {
        let errorMessage = "Failed to disconnect.";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      setIsConnected(false);
      setQrCode("");
      setStep('number');
      toast({
        title: "Disconnected",
        description: "WhatsApp has been successfully unlinked.",
      });
    } catch (error: any) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Error",
        description: error.message || "Could not disconnect WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefreshStatus = async () => {
     try {
      const statusResponse = await fetch(`${WHATSAPP_API_BASE}/status/${assistantId}`);
      if (!statusResponse.ok) return;

      const statusData = await statusResponse.json();
      setLastStatus(statusData);

      const connected = statusData.status === 'ready' || statusData.status === 'authenticated';
      setIsConnected(connected);
      setStep(connected ? 'connected' : step === 'qr' ? 'qr' : 'number');
      
      if (statusData.qrCode) {
        setQrCode(statusData.qrCode);
        setStep('qr');
      }

     } catch (e) {
        console.error("Error refreshing status:", e);
     }
  }

  return (
    <Card className="p-6 max-w-xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">WhatsApp Business</h3>
            <p className="text-sm text-muted-foreground">
              Connect your local WhatsApp server
            </p>
          </div>
        </div>
        {isConnected ? (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        ) : (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Not Connected
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {step === 'number' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="whatsapp-number" className="text-base font-semibold">
                Step 1: Start Connection
              </Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Click the button to generate a QR code from your local server.
              </p>
            </div>
            <Button 
              onClick={handleContinue} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                "Connect to WhatsApp →"
              )}
            </Button>
          </div>
        )}

        {step === 'qr' && (
          <div className="space-y-4">
             <div>
              <Label className="text-base font-semibold">
                Step 2: Scan the QR Code
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Open WhatsApp on your phone and scan the code below.
              </p>
            </div>
            
            <div className="bg-white dark:bg-muted p-6 rounded-lg border-2 border-dashed flex flex-col items-center justify-center min-h-[320px]">
              {qrCode ? (
                <>
                  <img 
                    src={qrCode} 
                    alt="WhatsApp QR Code" 
                    className="w-64 h-64 rounded-lg"
                  />
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Waiting for scan...
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Generating QR code...</p>
                </div>
              )}
            </div>
            
             <div className="flex items-center justify-between gap-3">
                <Button 
                  variant="secondary"
                  onClick={handleRefreshStatus}
                  disabled={loading}
                >
                  Refresh Status
                </Button>
                 <Button
                  variant="outline" 
                  onClick={() => { setStep('number'); setQrCode(""); }}
                  disabled={loading}
                >
                  Cancel
                </Button>
             </div>
          </div>
        )}

        {step === 'connected' && isConnected && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h4 className="font-semibold text-lg text-green-900 dark:text-green-100 mb-2">
                WhatsApp Connected!
              </h4>
               <p className="text-sm text-green-600 dark:text-green-400">
                Your assistant is now ready to send and receive messages.
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleDisconnect} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Unlink WhatsApp"
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WhatsAppConnection;