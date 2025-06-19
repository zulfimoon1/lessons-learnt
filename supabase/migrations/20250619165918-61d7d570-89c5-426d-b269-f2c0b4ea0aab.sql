
-- Enable RLS on mental_health_alerts table if not already enabled
ALTER TABLE public.mental_health_alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Platform admin full access to mental_health_alerts" ON public.mental_health_alerts;

-- Create comprehensive platform admin policy for mental_health_alerts
CREATE POLICY "Platform admin full access to mental_health_alerts" 
ON public.mental_health_alerts 
FOR ALL 
USING (
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
  OR current_setting('app.platform_admin', true) = 'true'
  OR current_setting('app.admin_verified', true) = 'true'
);

-- Grant permissions to service role and authenticated users for mental_health_alerts
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mental_health_alerts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mental_health_alerts TO service_role;

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
