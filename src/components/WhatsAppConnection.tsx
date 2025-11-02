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

const WhatsAppConnection = ({ assistantId }: WhatsAppConnectionProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'number' | 'qr' | 'connected'>('number');
  const [lastStatus, setLastStatus] = useState<any>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const { toast } = useToast();
  const functionsBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

  useEffect(() => {
    loadConnection();
  }, [assistantId]);

  useEffect(() => {
    if (step === 'qr' && !isConnected) {
      const id = setInterval(() => setRefreshTick((t) => t + 1), 3000);
      return () => clearInterval(id);
    }
  }, [step, isConnected]);

  const loadConnection = async () => {
    try {
      const { data } = await supabase
        .from("assistants")
        .select("phone_number, whatsapp_session_data")
        .eq("id", assistantId)
        .single();

      if (data?.phone_number) {
        setPhoneNumber(data.phone_number);
        const connected = !!data.whatsapp_session_data;
        setIsConnected(connected);
        setStep(connected ? 'connected' : 'number');
      }
    } catch (error) {
      console.error("Error loading connection:", error);
    }
  };

  const handleContinue = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Ingresa un número de WhatsApp",
        variant: "destructive",
      });
      return;
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      toast({
        title: "Formato inválido",
        description: "Usa el formato internacional: +34612345678",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Guardar número en DB
      const { error } = await supabase
        .from("assistants")
        .update({ phone_number: phoneNumber.replace(/\s/g, '') })
        .eq("id", assistantId);

      if (error) throw error;

      // Iniciar sesión WhatsApp en servidor (invoke) con fallback directo
      const { data: initData, error: initError } = await supabase.functions.invoke(
        'whatsapp-connect',
        { 
          body: { assistantId, action: 'init' }
        }
      );

      let initOk = !initError;
      let initPayload: any = initData;

      if (initError) {
        console.warn('invoke init error, trying direct init:', initError);
        try {
          const bases = ['https://tamariki.es', 'https://www.tamariki.es'];
          let directResp: Response | null = null;
          for (const base of bases) {
            try {
              const r = await fetch(`${base}/api/whatsapp/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assistantId })
              });
              if (r.ok) { directResp = r; break; }
            } catch {}
          }
          if (!directResp) throw new Error('Init directo falló en todas las URLs');
          initOk = true;
          initPayload = await directResp.json().catch(() => ({}));
        } catch (e) {
          console.error('direct init error:', e);
        }
      }

      if (!initOk) {
        throw initError || new Error('No se pudo iniciar la sesión de WhatsApp');
      }

      console.log('WhatsApp init response:', initPayload);
      
      // Si la respuesta inicial ya trae el QR, mostrarlo
      if (initPayload?.qr || initPayload?.qrCode) {
        const rawQr = initPayload.qr || initPayload.qrCode;
        const normalized = typeof rawQr === 'string' && rawQr.startsWith('data:')
          ? rawQr
          : `data:image/png;base64,${rawQr}`;
        setQrCode(normalized);
        setStep('qr');
        toast({
          title: 'QR Generado',
          description: 'Escanea el código con WhatsApp',
        });
      } else {
        setStep('qr');
        toast({
          title: 'Generando QR',
          description: 'Espera mientras se genera el código QR...',
        });
      }

      // Consulta inmediata de estado para acelerar la aparición del QR
      try {
        const { data: firstStatus } = await supabase.functions.invoke(
          'whatsapp-connect',
          { body: { assistantId, action: 'status' } }
        );
        if (firstStatus) {
          setLastStatus(firstStatus);
          const rawQr = firstStatus.qr || firstStatus.qrCode;
          if (rawQr) {
            const normalized = typeof rawQr === 'string' && rawQr.startsWith('data:')
              ? rawQr
              : `data:image/png;base64,${rawQr}`;
            setQrCode(normalized);
          }
        }
      } catch (e) {
        console.error('Estado inmediato error:', e);
      }

      // Fallback directo tras 5s (evita estados obsoletos de React)
      setTimeout(() => {
        fetchDirectStatus();
      }, 5000);

      // Polling para obtener QR y verificar conexión
      const pollInterval = setInterval(async () => {
        try {
          const { data: statusData, error: statusError } = await supabase.functions.invoke(
            'whatsapp-connect',
            { 
              body: { assistantId, action: 'status' }
            }
          );

          if (statusError) {
            console.error('Error obteniendo estado:', statusError);
            return;
          }

          console.log('Estado WhatsApp:', statusData);
          setLastStatus(statusData);

          // Si hay QR, mostrarlo (puede venir como qr o qrCode)
          const rawQr = statusData.qr || statusData.qrCode;
          if (rawQr) {
            const normalized = typeof rawQr === 'string' && rawQr.startsWith('data:')
              ? rawQr
              : `data:image/png;base64,${rawQr}`;
            const wasEmpty = !qrCode;
            setQrCode(normalized);
            if (wasEmpty) {
              toast({
                title: 'QR Generado',
                description: 'Escanea el código con WhatsApp',
              });
            }
          } else if (statusData?.debug?.qrExists || statusData?.qrCode || statusData?.qr) {
            // Si el edge indica que existe, pero no lo entrega, forzamos estado directo
            await fetchDirectStatus();
          }

          // Si está conectado (ready), actualizar UI
          if (statusData.status === 'ready') {
            clearInterval(pollInterval);
            setIsConnected(true);
            setStep('connected');
            setQrCode(''); // Limpiar QR
            toast({
              title: "¡Conectado!",
              description: "WhatsApp Business Web está activo",
            });
          }

          // Si se desconectó, reintentar
          if (statusData.status === 'disconnected' && qrCode) {
            clearInterval(pollInterval);
            setQrCode('');
            setStep('number');
            toast({
              title: "Desconectado",
              description: "La sesión expiró. Intenta de nuevo.",
              variant: "destructive",
            });
          }
        } catch (e) {
          console.error('Error en polling:', e);
        }
      }, 2000);

      // Limpiar polling después de 5 minutos
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 300000);
      
    } catch (error: any) {
      console.error('Error en handleContinue:', error);
      toast({
        title: "Error",
        description: error.message || 'Error conectando WhatsApp',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      // Llamar al edge function para desconectar del servidor Node
      const { error } = await supabase.functions.invoke(
        'whatsapp-connect',
        { 
          body: { assistantId, action: 'disconnect' }
        }
      );

      if (error) throw error;

      setIsConnected(false);
      setQrCode("");
      setStep('number');
      toast({
        title: "Desconectado",
        description: "WhatsApp ha sido desvinculado",
      });
    } catch (error: any) {
      console.error('Error desconectando:', error);
      toast({
        title: "Error",
        description: error.message || 'Error desconectando WhatsApp',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDirectStatus = async () => {
    try {
      const bases = ['https://tamariki.es', 'https://www.tamariki.es'];
      let resp: Response | null = null;
      for (const base of bases) {
        try {
          const r = await fetch(`${base}/api/whatsapp/status/${assistantId}`);
          if (r.ok) { resp = r; break; }
        } catch {}
      }
      if (!resp) throw new Error('Status directo falló en todas las URLs');
      const json = await resp.json();
      setLastStatus(json);
      const rawQr = json.qr || json.qrCode;
      if (rawQr) {
        const normalized = typeof rawQr === 'string' && rawQr.startsWith('data:')
          ? rawQr
          : `data:image/png;base64,${rawQr}`;
        setQrCode(normalized);
        setStep('qr');
      }
      if (json.status === 'ready') {
        setIsConnected(true);
        setStep('connected');
        setQrCode('');
      }
    } catch (e) {
      console.error('Fallback status error:', e);
      toast({
        title: 'Error fallback',
        description: 'No se pudo consultar el estado directo',
        variant: 'destructive'
      });
    }
  };

  const handleRefreshStatus = async () => {
    try {
      const { data: statusData, error: statusError } = await supabase.functions.invoke(
        'whatsapp-connect',
        { body: { assistantId, action: 'status' } }
      );
      if (statusError) throw statusError;
      setLastStatus(statusData);
      const rawQr = statusData.qr || statusData.qrCode;
      if (rawQr) {
        const normalized = typeof rawQr === 'string' && rawQr.startsWith('data:')
          ? rawQr
          : `data:image/png;base64,${rawQr}`;
        setQrCode(normalized);
      }
      if (statusData.status === 'ready') {
        setIsConnected(true);
        setStep('connected');
        setQrCode('');
      }

      // Fallback directo si seguimos sin QR
      if (!rawQr && statusData?.debug?.qrExists) {
        await fetchDirectStatus();
      }
    } catch (e: any) {
      console.error('Error refrescando estado:', e);
      toast({
        title: 'Error',
        description: e.message || 'No se pudo refrescar el estado',
        variant: 'destructive'
      });
    }
  };

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
              Conexión en 2 pasos
            </p>
          </div>
        </div>
        {isConnected ? (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        ) : (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Sin conectar
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {/* Paso 1: Número */}
        {step === 'number' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="whatsapp-number" className="text-base font-semibold">
                Paso 1: Número de WhatsApp
              </Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Ingresa el número con formato internacional
              </p>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="whatsapp-number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+34 612 345 678"
                  className="pl-10 text-base"
                  disabled={loading}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleContinue} 
              disabled={loading || !phoneNumber}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando QR...
                </>
              ) : (
                "Continuar →"
              )}
            </Button>

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                disabled={loading || !assistantId}
                onClick={async () => {
                  try {
                    setStep('qr');
                    const bases = ['https://tamariki.es', 'https://www.tamariki.es'];
                    let ok = false;
                    for (const base of bases) {
                      try {
                        const r = await fetch(`${base}/api/whatsapp/init`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ assistantId })
                        });
                        if (r.ok) { ok = true; break; }
                      } catch {}
                    }
                    if (!ok) throw new Error('No se pudo iniciar sesión en ninguna URL');
                    setTimeout(() => { handleRefreshStatus(); }, 1500);
                  } catch (e: any) {
                    console.error('direct init (number step) error:', e);
                    toast({ title: 'Error', description: e.message || 'Fallo iniciando directo', variant: 'destructive' });
                  }
                }}
              >
                Forzar estado directo
              </Button>
            </div>
          </div>
        )}

        {/* Paso 2: QR Code */}
        {step === 'qr' && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">
                Paso 2: Escanea el código QR
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Abre WhatsApp en tu móvil y escanea este código
              </p>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                <ol className="space-y-1 list-decimal list-inside">
                  <li>Abre WhatsApp en tu móvil</li>
                  <li>Ve a Ajustes → Dispositivos vinculados</li>
                  <li>Toca "Vincular un dispositivo"</li>
                  <li>Escanea este código QR</li>
                </ol>
              </AlertDescription>
            </Alert>
            
            <div className="bg-white dark:bg-muted p-6 rounded-lg border-2 border-dashed flex flex-col items-center justify-center min-h-[320px]">
              {qrCode ? (
                <>
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="w-64 h-64 rounded-lg"
                  />
                  <div className="mt-3">
                    <a
                      href={qrCode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline text-muted-foreground"
                    >
                      Abrir imagen QR en nueva pestaña
                    </a>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Esperando escaneo...
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Generando código QR...</p>
                </div>
              )}
            </div>

            <div className="bg-muted/40 rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Visor alternativo embebido (si no ves el QR arriba, se mostrará aquí):
              </p>
              <iframe
                src={`https://tamariki.es/api/whatsapp/debug-qr/${assistantId}`}
                title="QR Debug"
                className="w-full rounded-md border"
                style={{ height: '360px' }}
              />
            </div>

            <div className="bg-muted/40 rounded-lg border p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Visor proxy fiable (sirve la imagen directamente desde nuestro backend):
              </p>
              <div className="flex items-center justify-center">
                <img
                  src={`${functionsBase}/whatsapp-qr?assistantId=${assistantId}&_=${refreshTick}`}
                  alt="QR (proxy)"
                  className="w-64 h-64 rounded-md border"
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Se actualiza automáticamente cada 3s. Si no aparece, pulsa "Refrescar ahora".
              </p>
            </div>

            {lastStatus?.status && (
              <p className="text-xs text-muted-foreground">
                Estado actual: {lastStatus.status}
                {lastStatus?.debug?.qrLength ? ` · QR bytes: ${lastStatus.debug.qrLength}` : ''}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary"
                  onClick={handleRefreshStatus}
                  disabled={loading}
                >
                  Refrescar ahora
                </Button>
                <Button 
                  variant="outline"
                  onClick={fetchDirectStatus}
                  disabled={loading}
                >
                  Forzar estado directo
                </Button>
              </div>
              <a
                href={`https://tamariki.es/api/whatsapp/debug-qr/${assistantId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline text-muted-foreground"
              >
                Abrir visor QR (debug)
              </a>
            </div>

            <Button 
              variant="outline" 
              onClick={() => { setStep('number'); setQrCode(""); }}
              disabled={loading}
              className="w-full"
            >
              Volver
            </Button>
          </div>
        )}

        {/* Estado conectado */}
        {step === 'connected' && isConnected && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h4 className="font-semibold text-lg text-green-900 dark:text-green-100 mb-2">
                ¡WhatsApp conectado!
              </h4>
              <p className="text-green-700 dark:text-green-300 mb-1">
                {phoneNumber}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Tu asistente ya puede recibir y enviar mensajes
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
                  Desconectando...
                </>
              ) : (
                "Desvincular WhatsApp"
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WhatsAppConnection;
