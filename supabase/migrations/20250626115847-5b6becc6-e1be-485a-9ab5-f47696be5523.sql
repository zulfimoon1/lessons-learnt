
-- Add Stripe subscription tracking fields to teachers table
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teachers_stripe_subscription_id ON public.teachers(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_teachers_stripe_customer_id ON public.teachers(stripe_customer_id);
