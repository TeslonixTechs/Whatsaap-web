-- Add phone number filtering configuration to bot_settings
ALTER TABLE public.bot_settings
ADD COLUMN IF NOT EXISTS response_mode TEXT DEFAULT 'all' CHECK (response_mode IN ('all', 'whitelist', 'blacklist')),
ADD COLUMN IF NOT EXISTS allowed_numbers TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS blocked_numbers TEXT[] DEFAULT '{}';