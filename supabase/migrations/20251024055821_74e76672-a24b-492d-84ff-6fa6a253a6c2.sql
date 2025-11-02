-- Create messages table (if not exists)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_hours table
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assistant_id, day_of_week)
);

-- Create auto_responses table
CREATE TABLE IF NOT EXISTS public.auto_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('welcome', 'after_hours', 'inactive')),
  message TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assistant_id, type)
);

-- Create bot_settings table
CREATE TABLE IF NOT EXISTS public.bot_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  tone TEXT NOT NULL DEFAULT 'professional' CHECK (tone IN ('professional', 'casual', 'friendly')),
  language TEXT NOT NULL DEFAULT 'es',
  custom_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assistant_id)
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
DO $$ BEGIN
  CREATE POLICY "Users can view messages of their assistants"
    ON public.messages FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM public.conversations
      JOIN public.assistants ON assistants.id = conversations.assistant_id
      WHERE conversations.id = messages.conversation_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create messages for their assistants"
    ON public.messages FOR INSERT
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.conversations
      JOIN public.assistants ON assistants.id = conversations.assistant_id
      WHERE conversations.id = messages.conversation_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- RLS Policies for business_hours
DO $$ BEGIN
  CREATE POLICY "Users can view business hours of their assistants"
    ON public.business_hours FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = business_hours.assistant_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create business hours for their assistants"
    ON public.business_hours FOR INSERT
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = business_hours.assistant_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update business hours of their assistants"
    ON public.business_hours FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = business_hours.assistant_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete business hours of their assistants"
    ON public.business_hours FOR DELETE
    USING (EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = business_hours.assistant_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- RLS Policies for auto_responses
DO $$ BEGIN
  CREATE POLICY "Users can view auto responses of their assistants"
    ON public.auto_responses FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = auto_responses.assistant_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create auto responses for their assistants"
    ON public.auto_responses FOR INSERT
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = auto_responses.assistant_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update auto responses of their assistants"
    ON public.auto_responses FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = auto_responses.assistant_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete auto responses of their assistants"
    ON public.auto_responses FOR DELETE
    USING (EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = auto_responses.assistant_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- RLS Policies for bot_settings
DO $$ BEGIN
  CREATE POLICY "Users can view bot settings of their assistants"
    ON public.bot_settings FOR SELECT
    USING (EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = bot_settings.assistant_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can create bot settings for their assistants"
    ON public.bot_settings FOR INSERT
    WITH CHECK (EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = bot_settings.assistant_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update bot settings of their assistants"
    ON public.bot_settings FOR UPDATE
    USING (EXISTS (
      SELECT 1 FROM public.assistants
      WHERE assistants.id = bot_settings.assistant_id
      AND assistants.user_id = auth.uid()
    ));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_business_hours_assistant_id ON public.business_hours(assistant_id);
CREATE INDEX IF NOT EXISTS idx_auto_responses_assistant_id ON public.auto_responses(assistant_id);
CREATE INDEX IF NOT EXISTS idx_bot_settings_assistant_id ON public.bot_settings(assistant_id);

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_business_hours_updated_at ON public.business_hours;
CREATE TRIGGER update_business_hours_updated_at
  BEFORE UPDATE ON public.business_hours
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_auto_responses_updated_at ON public.auto_responses;
CREATE TRIGGER update_auto_responses_updated_at
  BEFORE UPDATE ON public.auto_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_bot_settings_updated_at ON public.bot_settings;
CREATE TRIGGER update_bot_settings_updated_at
  BEFORE UPDATE ON public.bot_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();