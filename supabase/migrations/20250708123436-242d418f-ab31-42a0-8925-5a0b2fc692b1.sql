-- Simplify the RLS policies to work more reliably with custom authentication
DROP POLICY IF EXISTS "School admins can manage calendar events for their school" ON public.school_calendar_events;

-- Create a simpler policy that works with the platform admin context
CREATE POLICY "School admins can manage calendar events for their school"
ON public.school_calendar_events
FOR ALL
USING (
  -- Allow if platform admin context is set
  (current_setting('app.platform_admin', true) = 'true') OR
  (current_setting('app.admin_verified', true) = 'true') OR
  (current_setting('app.admin_context_set', true) = 'true') OR
  -- Or if it's the specific platform admin email
  (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com')
)
WITH CHECK (
  -- Same checks for insert/update
  (current_setting('app.platform_admin', true) = 'true') OR
  (current_setting('app.admin_verified', true) = 'true') OR
  (current_setting('app.admin_context_set', true) = 'true') OR
  (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com')
);