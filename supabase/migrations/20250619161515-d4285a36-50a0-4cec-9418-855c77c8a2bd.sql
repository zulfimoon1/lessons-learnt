
-- Enable RLS on payment_notifications table if not already enabled
ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Platform admin full access to payment_notifications" ON public.payment_notifications;

-- Create comprehensive platform admin policy for payment_notifications
CREATE POLICY "Platform admin full access to payment_notifications" 
ON public.payment_notifications 
FOR ALL 
USING (
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
  OR current_setting('app.platform_admin', true) = 'true'
  OR current_setting('app.admin_verified', true) = 'true'
);

-- Grant permissions to service role and authenticated users for payment_notifications
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_notifications TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_notifications TO service_role;
