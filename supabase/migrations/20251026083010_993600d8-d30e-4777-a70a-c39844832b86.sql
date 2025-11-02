-- Create campaigns table for broadcast messages
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  segment_id UUID REFERENCES public.customer_segments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'paused', 'cancelled')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflows table for automated flows
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('keyword', 'time', 'tag', 'event')),
  trigger_value JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table for operator management
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')),
  permissions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, assistant_id)
);

-- Create knowledge_base table for bot training
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('manual', 'url', 'document')),
  source_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled_responses table
CREATE TABLE public.scheduled_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  recipient_filter JSONB NOT NULL DEFAULT '{}',
  send_date TIMESTAMP WITH TIME ZONE NOT NULL,
  repeat_type TEXT CHECK (repeat_type IN ('once', 'daily', 'weekly', 'monthly')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create intents table for NLP configuration
CREATE TABLE public.intents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  examples TEXT[] NOT NULL DEFAULT '{}',
  response TEXT NOT NULL,
  entities JSONB DEFAULT '[]',
  confidence_threshold NUMERIC DEFAULT 0.7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation_templates table
CREATE TABLE public.conversation_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  flow JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create campaign_logs table for tracking
CREATE TABLE public.campaign_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'failed', 'delivered')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Users can manage campaigns for their assistants"
  ON public.campaigns FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = campaigns.assistant_id
    AND assistants.user_id = auth.uid()
  ));

-- RLS Policies for workflows
CREATE POLICY "Users can manage workflows for their assistants"
  ON public.workflows FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = workflows.assistant_id
    AND assistants.user_id = auth.uid()
  ));

-- RLS Policies for team_members
CREATE POLICY "Users can manage team members for their assistants"
  ON public.team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = team_members.assistant_id
    AND assistants.user_id = auth.uid()
  ));

-- RLS Policies for knowledge_base
CREATE POLICY "Users can manage knowledge base for their assistants"
  ON public.knowledge_base FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = knowledge_base.assistant_id
    AND assistants.user_id = auth.uid()
  ));

-- RLS Policies for scheduled_campaigns
CREATE POLICY "Users can manage scheduled campaigns for their assistants"
  ON public.scheduled_campaigns FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = scheduled_campaigns.assistant_id
    AND assistants.user_id = auth.uid()
  ));

-- RLS Policies for intents
CREATE POLICY "Users can manage intents for their assistants"
  ON public.intents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = intents.assistant_id
    AND assistants.user_id = auth.uid()
  ));

-- RLS Policies for conversation_templates
CREATE POLICY "Users can manage conversation templates for their assistants"
  ON public.conversation_templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = conversation_templates.assistant_id
    AND assistants.user_id = auth.uid()
  ));

-- RLS Policies for campaign_logs
CREATE POLICY "Users can view campaign logs for their campaigns"
  ON public.campaign_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.campaigns
    JOIN public.assistants ON assistants.id = campaigns.assistant_id
    WHERE campaigns.id = campaign_logs.campaign_id
    AND assistants.user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_campaigns_assistant_id ON public.campaigns(assistant_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_workflows_assistant_id ON public.workflows(assistant_id);
CREATE INDEX idx_team_members_assistant_id ON public.team_members(assistant_id);
CREATE INDEX idx_knowledge_base_assistant_id ON public.knowledge_base(assistant_id);
CREATE INDEX idx_scheduled_campaigns_assistant_id ON public.scheduled_campaigns(assistant_id);
CREATE INDEX idx_scheduled_campaigns_send_date ON public.scheduled_campaigns(send_date);
CREATE INDEX idx_intents_assistant_id ON public.intents(assistant_id);
CREATE INDEX idx_conversation_templates_assistant_id ON public.conversation_templates(assistant_id);
CREATE INDEX idx_campaign_logs_campaign_id ON public.campaign_logs(campaign_id);

-- Add update trigger for updated_at columns
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_intents_updated_at BEFORE UPDATE ON public.intents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_templates_updated_at BEFORE UPDATE ON public.conversation_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();