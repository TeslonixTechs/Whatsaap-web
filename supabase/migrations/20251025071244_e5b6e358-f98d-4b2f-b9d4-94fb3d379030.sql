-- Add new columns to bot_settings table for consent and operator escalation
ALTER TABLE public.bot_settings
ADD COLUMN IF NOT EXISTS require_consent boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS operator_email text,
ADD COLUMN IF NOT EXISTS operator_whatsapp text,
ADD COLUMN IF NOT EXISTS frustration_threshold integer NOT NULL DEFAULT 3;

-- Add constraint to ensure frustration_threshold is between 1 and 5
ALTER TABLE public.bot_settings
ADD CONSTRAINT frustration_threshold_range CHECK (frustration_threshold >= 1 AND frustration_threshold <= 5);

-- Add index for conversations table to track frustration
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);