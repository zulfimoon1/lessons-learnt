
-- Add duration field to discount codes table
ALTER TABLE public.discount_codes 
ADD COLUMN duration_months integer DEFAULT NULL;

-- Add discount tracking to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN discount_code_id uuid REFERENCES public.discount_codes(id),
ADD COLUMN discount_expires_at timestamp with time zone,
ADD COLUMN original_amount integer;

-- Create notifications table for payment due alerts
CREATE TABLE public.payment_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  school_name text NOT NULL,
  admin_email text NOT NULL,
  notification_type text NOT NULL, -- 'discount_ending', 'payment_due'
  scheduled_for timestamp with time zone NOT NULL,
  sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on payment_notifications
ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for payment notifications
CREATE POLICY "payment_notifications_policy" ON public.payment_notifications
FOR ALL USING (true);

-- Create function to check and update expired discounts
CREATE OR REPLACE FUNCTION public.process_expired_discounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_subscription RECORD;
BEGIN
  -- Find subscriptions with expired discounts
  FOR expired_subscription IN 
    SELECT s.id, s.school_name, s.stripe_subscription_id, s.original_amount,
           t.email as admin_email, s.discount_code_id
    FROM public.subscriptions s
    JOIN public.teachers t ON t.school = s.school_name AND t.role = 'admin'
    WHERE s.discount_expires_at IS NOT NULL 
      AND s.discount_expires_at <= now()
      AND s.amount < s.original_amount
  LOOP
    -- Update subscription to original amount
    UPDATE public.subscriptions 
    SET amount = expired_subscription.original_amount,
        discount_code_id = NULL,
        discount_expires_at = NULL
    WHERE id = expired_subscription.id;
    
    -- Schedule payment due notification
    INSERT INTO public.payment_notifications (
      subscription_id, school_name, admin_email, 
      notification_type, scheduled_for
    ) VALUES (
      expired_subscription.id, 
      expired_subscription.school_name,
      expired_subscription.admin_email,
      'payment_due',
      now() + interval '1 day'
    );
  END LOOP;
END;
$$;

-- Create function to schedule discount ending notifications
CREATE OR REPLACE FUNCTION public.schedule_discount_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  -- Find subscriptions with discounts ending in 7 days
  FOR subscription_record IN 
    SELECT s.id, s.school_name, s.discount_expires_at,
           t.email as admin_email
    FROM public.subscriptions s
    JOIN public.teachers t ON t.school = s.school_name AND t.role = 'admin'
    WHERE s.discount_expires_at IS NOT NULL 
      AND s.discount_expires_at BETWEEN now() + interval '6 days' AND now() + interval '8 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.payment_notifications pn 
        WHERE pn.subscription_id = s.id 
          AND pn.notification_type = 'discount_ending'
          AND pn.sent_at IS NULL
      )
  LOOP
    -- Schedule discount ending notification
    INSERT INTO public.payment_notifications (
      subscription_id, school_name, admin_email, 
      notification_type, scheduled_for
    ) VALUES (
      subscription_record.id, 
      subscription_record.school_name,
      subscription_record.admin_email,
      'discount_ending',
      subscription_record.discount_expires_at - interval '7 days'
    );
  END LOOP;
END;
$$;
