-- Create tags table for conversation classification
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id uuid NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(assistant_id, name)
);

-- Create conversation_tags junction table
CREATE TABLE public.conversation_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, tag_id)
);

-- Create conversation_notes table for internal notes
CREATE TABLE public.conversation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  operator_id uuid NOT NULL REFERENCES auth.users(id),
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create conversation_ratings table for customer satisfaction
CREATE TABLE public.conversation_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id)
);

-- Create quick_responses table for operator templates
CREATE TABLE public.quick_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id uuid NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  shortcut text,
  category text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create scheduled_messages table
CREATE TABLE public.scheduled_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

-- Create webhooks table
CREATE TABLE public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assistant_id uuid NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  events text[] NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  secret text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add sentiment and operator fields to conversations
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS sentiment_score numeric(3,2),
ADD COLUMN IF NOT EXISTS assigned_operator uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS avg_response_time interval,
ADD COLUMN IF NOT EXISTS total_messages integer DEFAULT 0;

-- Add suggestion flag to messages
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_suggested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_from_operator boolean DEFAULT false;

-- Enable RLS on new tables
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- RLS policies for tags
CREATE POLICY "Users can view tags of their assistants"
ON public.tags FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.assistants
  WHERE assistants.id = tags.assistant_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can create tags for their assistants"
ON public.tags FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.assistants
  WHERE assistants.id = tags.assistant_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can update tags of their assistants"
ON public.tags FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.assistants
  WHERE assistants.id = tags.assistant_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can delete tags of their assistants"
ON public.tags FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.assistants
  WHERE assistants.id = tags.assistant_id
  AND assistants.user_id = auth.uid()
));

-- RLS policies for conversation_tags
CREATE POLICY "Users can view conversation tags of their assistants"
ON public.conversation_tags FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversations
  JOIN public.assistants ON assistants.id = conversations.assistant_id
  WHERE conversations.id = conversation_tags.conversation_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can create conversation tags for their assistants"
ON public.conversation_tags FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.conversations
  JOIN public.assistants ON assistants.id = conversations.assistant_id
  WHERE conversations.id = conversation_tags.conversation_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can delete conversation tags of their assistants"
ON public.conversation_tags FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.conversations
  JOIN public.assistants ON assistants.id = conversations.assistant_id
  WHERE conversations.id = conversation_tags.conversation_id
  AND assistants.user_id = auth.uid()
));

-- RLS policies for conversation_notes
CREATE POLICY "Users can view notes of their assistants"
ON public.conversation_notes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversations
  JOIN public.assistants ON assistants.id = conversations.assistant_id
  WHERE conversations.id = conversation_notes.conversation_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can create notes for their assistants"
ON public.conversation_notes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.conversations
  JOIN public.assistants ON assistants.id = conversations.assistant_id
  WHERE conversations.id = conversation_notes.conversation_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can update their own notes"
ON public.conversation_notes FOR UPDATE
USING (operator_id = auth.uid());

CREATE POLICY "Users can delete their own notes"
ON public.conversation_notes FOR DELETE
USING (operator_id = auth.uid());

-- RLS policies for conversation_ratings
CREATE POLICY "Users can view ratings of their assistants"
ON public.conversation_ratings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversations
  JOIN public.assistants ON assistants.id = conversations.assistant_id
  WHERE conversations.id = conversation_ratings.conversation_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can create ratings for their assistants"
ON public.conversation_ratings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.conversations
  JOIN public.assistants ON assistants.id = conversations.assistant_id
  WHERE conversations.id = conversation_ratings.conversation_id
  AND assistants.user_id = auth.uid()
));

-- RLS policies for quick_responses
CREATE POLICY "Users can view quick responses of their assistants"
ON public.quick_responses FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.assistants
  WHERE assistants.id = quick_responses.assistant_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can create quick responses for their assistants"
ON public.quick_responses FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.assistants
  WHERE assistants.id = quick_responses.assistant_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can update quick responses of their assistants"
ON public.quick_responses FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.assistants
  WHERE assistants.id = quick_responses.assistant_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can delete quick responses of their assistants"
ON public.quick_responses FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.assistants
  WHERE assistants.id = quick_responses.assistant_id
  AND assistants.user_id = auth.uid()
));

-- RLS policies for scheduled_messages
CREATE POLICY "Users can view scheduled messages of their assistants"
ON public.scheduled_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.conversations
  JOIN public.assistants ON assistants.id = conversations.assistant_id
  WHERE conversations.id = scheduled_messages.conversation_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can create scheduled messages for their assistants"
ON public.scheduled_messages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.conversations
  JOIN public.assistants ON assistants.id = conversations.assistant_id
  WHERE conversations.id = scheduled_messages.conversation_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can update scheduled messages of their assistants"
ON public.scheduled_messages FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.conversations
  JOIN public.assistants ON assistants.id = conversations.assistant_id
  WHERE conversations.id = scheduled_messages.conversation_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can delete scheduled messages of their assistants"
ON public.scheduled_messages FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.conversations
  JOIN public.assistants ON assistants.id = conversations.assistant_id
  WHERE conversations.id = scheduled_messages.conversation_id
  AND assistants.user_id = auth.uid()
));

-- RLS policies for webhooks
CREATE POLICY "Users can view webhooks of their assistants"
ON public.webhooks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.assistants
  WHERE assistants.id = webhooks.assistant_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can create webhooks for their assistants"
ON public.webhooks FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.assistants
  WHERE assistants.id = webhooks.assistant_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can update webhooks of their assistants"
ON public.webhooks FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.assistants
  WHERE assistants.id = webhooks.assistant_id
  AND assistants.user_id = auth.uid()
));

CREATE POLICY "Users can delete webhooks of their assistants"
ON public.webhooks FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.assistants
  WHERE assistants.id = webhooks.assistant_id
  AND assistants.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_conversation_tags_conversation ON public.conversation_tags(conversation_id);
CREATE INDEX idx_conversation_tags_tag ON public.conversation_tags(tag_id);
CREATE INDEX idx_conversation_notes_conversation ON public.conversation_notes(conversation_id);
CREATE INDEX idx_conversation_ratings_conversation ON public.conversation_ratings(conversation_id);
CREATE INDEX idx_scheduled_messages_status ON public.scheduled_messages(status);
CREATE INDEX idx_scheduled_messages_scheduled_for ON public.scheduled_messages(scheduled_for);
CREATE INDEX idx_conversations_sentiment ON public.conversations(sentiment_score);
CREATE INDEX idx_conversations_operator ON public.conversations(assigned_operator);

-- Create trigger for updating updated_at
CREATE TRIGGER update_conversation_notes_updated_at
BEFORE UPDATE ON public.conversation_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quick_responses_updated_at
BEFORE UPDATE ON public.quick_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON public.webhooks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();