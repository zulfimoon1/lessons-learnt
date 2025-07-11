-- Restore the original working RLS policy for school_calendar_events
DROP POLICY IF EXISTS "Allow calendar management with admin context" ON public.school_calendar_events;

-- Recreate the original policy that was working
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