
-- Grant SELECT permissions to anon and authenticated roles for platform admin queries
-- This is needed for the platform admin dashboard to read database statistics

-- Grant permissions on all tables that the platform admin needs to access
GRANT SELECT ON public.students TO anon, authenticated;
GRANT SELECT ON public.teachers TO anon, authenticated;
GRANT SELECT ON public.feedback TO anon, authenticated;
GRANT SELECT ON public.subscriptions TO anon, authenticated;
GRANT SELECT ON public.class_schedules TO anon, authenticated;
GRANT SELECT ON public.weekly_summaries TO anon, authenticated;
GRANT SELECT ON public.mental_health_alerts TO anon, authenticated;

-- Create a specific policy for platform admin access
-- Allow platform admins (teachers with role 'admin') to read all data for dashboard analytics
CREATE POLICY "Platform admins can read all data for analytics" 
  ON public.students 
  FOR SELECT 
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE role = 'admin' 
      AND email = current_setting('request.jwt.claims', true)::json->>'email'
    ) OR
    current_setting('app.platform_admin', true) = 'true'
  );

CREATE POLICY "Platform admins can read teacher data for analytics" 
  ON public.teachers 
  FOR SELECT 
  TO anon, authenticated
  USING (
    role = 'admin' OR
    current_setting('app.platform_admin', true) = 'true'
  );

CREATE POLICY "Platform admins can read feedback data for analytics" 
  ON public.feedback 
  FOR SELECT 
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE role = 'admin'
    ) OR
    current_setting('app.platform_admin', true) = 'true'
  );

CREATE POLICY "Platform admins can read subscription data for analytics" 
  ON public.subscriptions 
  FOR SELECT 
  TO anon, authenticated
  USING (
    current_setting('app.platform_admin', true) = 'true'
  );
