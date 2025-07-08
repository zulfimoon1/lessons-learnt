-- Drop the current policy and create one that matches what set_platform_admin_context actually sets
DROP POLICY IF EXISTS "Allow calendar management with admin context" ON public.school_calendar_events;

CREATE POLICY "Allow calendar management with admin context"
ON public.school_calendar_events
FOR ALL
USING (
  -- Check for the settings that set_platform_admin_context actually sets
  (current_setting('app.platform_admin', true) = 'true') OR
  (current_setting('app.admin_verified', true) = 'true') OR
  (current_setting('app.admin_context_set', true) = 'true') OR
  (current_setting('app.current_user_email', true) = 'demoadmin@demo.com')
)
WITH CHECK (
  -- Same check for inserts/updates
  (current_setting('app.platform_admin', true) = 'true') OR
  (current_setting('app.admin_verified', true) = 'true') OR
  (current_setting('app.admin_context_set', true) = 'true') OR
  (current_setting('app.current_user_email', true) = 'demoadmin@demo.com')
);