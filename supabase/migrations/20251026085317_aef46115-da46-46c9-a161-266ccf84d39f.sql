-- Tabla para webhooks entrantes (de CRMs externos)
CREATE TABLE public.incoming_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  webhook_url TEXT NOT NULL UNIQUE,
  secret_key TEXT NOT NULL,
  allowed_ips JSONB DEFAULT '[]',
  event_types JSONB NOT NULL DEFAULT '["booking_created", "booking_updated", "status_changed"]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_trigger TIMESTAMP WITH TIME ZONE,
  total_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_incoming_webhooks_assistant ON public.incoming_webhooks(assistant_id);
CREATE INDEX idx_incoming_webhooks_url ON public.incoming_webhooks(webhook_url);

-- RLS
ALTER TABLE public.incoming_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage incoming webhooks for their assistants"
ON public.incoming_webhooks
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = incoming_webhooks.assistant_id
    AND assistants.user_id = auth.uid()
  )
);

-- Tabla para logs de webhooks entrantes
CREATE TABLE public.incoming_webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES public.incoming_webhooks(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  headers JSONB,
  ip_address TEXT,
  status TEXT NOT NULL, -- 'success', 'failed', 'invalid_signature'
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_webhook_logs_webhook ON public.incoming_webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_created ON public.incoming_webhook_logs(created_at);

-- RLS
ALTER TABLE public.incoming_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs of their webhooks"
ON public.incoming_webhook_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.incoming_webhooks
    JOIN public.assistants ON assistants.id = incoming_webhooks.assistant_id
    WHERE incoming_webhooks.id = incoming_webhook_logs.webhook_id
    AND assistants.user_id = auth.uid()
  )
);

-- Triggers
CREATE TRIGGER update_incoming_webhooks_updated_at
BEFORE UPDATE ON public.incoming_webhooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();