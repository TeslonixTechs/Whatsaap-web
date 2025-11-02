-- Insert trial plan with limited messages for testing
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
  'Prueba Gratis',
  NULL,
  NULL,
  0,
  1,
  100,
  true,
  true,
  14
);