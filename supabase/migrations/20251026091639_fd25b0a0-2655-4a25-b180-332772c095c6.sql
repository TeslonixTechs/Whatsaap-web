-- Create activity_logs table for audit trail
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'es',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create role_permissions table
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  actions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, resource)
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their own activity"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage their own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for role_permissions
CREATE POLICY "Anyone can view role permissions"
  ON public.role_permissions FOR SELECT
  USING (true);

-- Create function to log activity
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_details);
END;
$$;

-- Insert default role permissions
INSERT INTO public.role_permissions (role, resource, actions) VALUES
  ('admin', 'assistants', '["create", "read", "update", "delete"]'),
  ('admin', 'conversations', '["create", "read", "update", "delete"]'),
  ('admin', 'campaigns', '["create", "read", "update", "delete"]'),
  ('admin', 'team', '["create", "read", "update", "delete"]'),
  ('admin', 'settings', '["create", "read", "update", "delete"]'),
  
  ('operator', 'assistants', '["read"]'),
  ('operator', 'conversations', '["read", "update"]'),
  ('operator', 'campaigns', '["read"]'),
  ('operator', 'team', '["read"]'),
  ('operator', 'settings', '["read"]'),
  
  ('viewer', 'assistants', '["read"]'),
  ('viewer', 'conversations', '["read"]'),
  ('viewer', 'campaigns', '["read"]'),
  ('viewer', 'team', '["read"]'),
  ('viewer', 'settings', '["read"]');

-- Create indexes
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- Add update trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();