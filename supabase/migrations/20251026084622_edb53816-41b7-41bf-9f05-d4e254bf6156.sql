-- Tabla para integraciones de calendario
CREATE TABLE public.calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'google', 'outlook', 'caldav', 'ical', 'custom'
  credentials JSONB NOT NULL DEFAULT '{}', -- API keys, tokens, etc. (encrypted in production)
  config JSONB NOT NULL DEFAULT '{}', -- URL, settings, etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_calendar_integrations_assistant ON public.calendar_integrations(assistant_id);

-- RLS
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage calendar integrations for their assistants"
ON public.calendar_integrations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = calendar_integrations.assistant_id
    AND assistants.user_id = auth.uid()
  )
);

-- Tabla para eventos/reservas
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  calendar_integration_id UUID REFERENCES public.calendar_integrations(id) ON DELETE SET NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  service_type TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  price NUMERIC,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  external_id TEXT, -- ID en el calendario externo
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_bookings_assistant ON public.bookings(assistant_id);
CREATE INDEX idx_bookings_times ON public.bookings(start_time, end_time);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage bookings for their assistants"
ON public.bookings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = bookings.assistant_id
    AND assistants.user_id = auth.uid()
  )
);

-- Tabla para triggers de notificación automática
CREATE TABLE public.notification_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'booking_confirmed', 'booking_reminder', 'status_change', 'custom_event'
  trigger_config JSONB NOT NULL DEFAULT '{}', -- Configuración del trigger (ej: "24 hours before")
  message_template TEXT NOT NULL, -- Template del mensaje con variables {{customer_name}}, etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_notification_triggers_assistant ON public.notification_triggers(assistant_id);

-- RLS
ALTER TABLE public.notification_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage notification triggers for their assistants"
ON public.notification_triggers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = notification_triggers.assistant_id
    AND assistants.user_id = auth.uid()
  )
);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_calendar_integrations_updated_at
BEFORE UPDATE ON public.calendar_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_triggers_updated_at
BEFORE UPDATE ON public.notification_triggers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();