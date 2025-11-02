-- Make stripe fields nullable for trial/free plans
ALTER TABLE public.subscription_plans 
ALTER COLUMN stripe_price_id DROP NOT NULL,
ALTER COLUMN stripe_product_id DROP NOT NULL;

-- Add trial fields
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_days INTEGER;

-- Insert trial plan with low limits
INSERT INTO public.subscription_plans (
  name,
  stripe_product_id,
  stripe_price_id,
  price_monthly,
  max_whatsapp_numbers,
  max_monthly_messages,
  is_active,
  is_trial,
  trial_days
) VALUES (
  'Plan de Prueba Gratis',
  NULL,
  NULL,
  0,
  1,
  50,
  true,
  true,
  14
) ON CONFLICT DO NOTHING;