-- Message templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Customer segments table
CREATE TABLE IF NOT EXISTS public.customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL,
  customer_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- A/B tests table
CREATE TABLE IF NOT EXISTS public.ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  variant_a TEXT NOT NULL,
  variant_b TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  winner TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- A/B test results table
CREATE TABLE IF NOT EXISTS public.ab_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  converted BOOLEAN NOT NULL DEFAULT false,
  response_time INTERVAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Live chat sessions table
CREATE TABLE IF NOT EXISTS public.live_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- CRM integrations table
CREATE TABLE IF NOT EXISTS public.crm_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crm_type TEXT NOT NULL,
  api_key_encrypted TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Export jobs table
CREATE TABLE IF NOT EXISTS public.export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL,
  format TEXT NOT NULL,
  filters JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  file_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_templates
CREATE POLICY "Users can manage their own templates"
  ON public.message_templates FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for customer_segments
CREATE POLICY "Users can manage their own segments"
  ON public.customer_segments FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for ab_tests
CREATE POLICY "Users can manage AB tests for their assistants"
  ON public.ab_tests FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = ab_tests.assistant_id
    AND assistants.user_id = auth.uid()
  ));

-- RLS Policies for ab_test_results
CREATE POLICY "Users can view AB test results for their tests"
  ON public.ab_test_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ab_tests
    JOIN public.assistants ON assistants.id = ab_tests.assistant_id
    WHERE ab_tests.id = ab_test_results.test_id
    AND assistants.user_id = auth.uid()
  ));

-- RLS Policies for live_chat_sessions
CREATE POLICY "Operators can manage their chat sessions"
  ON public.live_chat_sessions FOR ALL
  USING (auth.uid() = operator_id);

-- RLS Policies for crm_integrations
CREATE POLICY "Users can manage their own CRM integrations"
  ON public.crm_integrations FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for export_jobs
CREATE POLICY "Users can manage their own export jobs"
  ON public.export_jobs FOR ALL
  USING (auth.uid() = user_id);

-- Create triggers
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customer_segments_updated_at
  BEFORE UPDATE ON public.customer_segments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_integrations_updated_at
  BEFORE UPDATE ON public.crm_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();