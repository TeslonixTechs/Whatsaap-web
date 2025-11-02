-- Delete the free trial plan
DELETE FROM public.subscription_plans WHERE is_trial = true;

-- Delete non-trial plans
DELETE FROM public.subscription_plans WHERE is_trial = false OR is_trial IS NULL;

-- Insert Starter plan (19€/mes - comparable to Tidio/Manychat starter)
INSERT INTO public.subscription_plans (
  name,
  stripe_product_id,
  stripe_price_id,
  price_monthly,
  max_whatsapp_numbers,
  max_monthly_messages,
  is_active,
  is_trial
) VALUES (
  'Starter',
  NULL,
  NULL,
  1900,
  1,
  500,
  true,
  false
);

-- Insert Growth plan (49€/mes - comparable to mid-tier competitors)
INSERT INTO public.subscription_plans (
  name,
  stripe_product_id,
  stripe_price_id,
  price_monthly,
  max_whatsapp_numbers,
  max_monthly_messages,
  is_active,
  is_trial
) VALUES (
  'Growth',
  NULL,
  NULL,
  4900,
  3,
  2000,
  true,
  false
);

-- Insert Professional plan (99€/mes)
INSERT INTO public.subscription_plans (
  name,
  stripe_product_id,
  stripe_price_id,
  price_monthly,
  max_whatsapp_numbers,
  max_monthly_messages,
  is_active,
  is_trial
) VALUES (
  'Professional',
  NULL,
  NULL,
  9900,
  10,
  10000,
  true,
  false
);

-- Insert Enterprise plan (199€/mes)
INSERT INTO public.subscription_plans (
  name,
  stripe_product_id,
  stripe_price_id,
  price_monthly,
  max_whatsapp_numbers,
  max_monthly_messages,
  is_active,
  is_trial
) VALUES (
  'Enterprise',
  NULL,
  NULL,
  19900,
  999,
  999999,
  true,
  false
);