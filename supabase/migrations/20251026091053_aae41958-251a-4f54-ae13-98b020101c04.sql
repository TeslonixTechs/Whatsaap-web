-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')),
  token TEXT NOT NULL UNIQUE,
  invited_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email, assistant_id)
);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_invitations
CREATE POLICY "Users can manage invitations for their assistants"
  ON public.team_invitations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.assistants
    WHERE assistants.id = team_invitations.assistant_id
    AND assistants.user_id = auth.uid()
  ));

-- Allow anyone to view their own invitations by token (for accepting)
CREATE POLICY "Users can view invitations by token"
  ON public.team_invitations FOR SELECT
  USING (token IS NOT NULL);

-- Create function to get user email safely
CREATE OR REPLACE FUNCTION public.get_team_member_email(member_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = member_user_id;
  
  RETURN user_email;
END;
$$;

-- Create index for performance
CREATE INDEX idx_team_invitations_assistant_id ON public.team_invitations(assistant_id);
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);