-- Drop the current policy and create a simple one that actually works
DROP POLICY IF EXISTS "School calendar events access" ON public.school_calendar_events;

-- Create a working policy
CREATE POLICY "Calendar events policy"
ON public.school_calendar_events
FOR ALL
USING (
  -- Allow if platform admin context is set
  (current_setting('app.current_user_email', true) = 'demoadmin@demo.com') OR
  (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com') OR
  -- Allow if admin context flags are set
  (current_setting('app.platform_admin', true) = 'true') OR
  (current_setting('app.admin_verified', true) = 'true')
)
WITH CHECK (
  -- Same conditions for inserts/updates
  (current_setting('app.current_user_email', true) = 'demoadmin@demo.com') OR
  (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com') OR
  (current_setting('app.platform_admin', true) = 'true') OR
  (current_setting('app.admin_verified', true) = 'true')
);