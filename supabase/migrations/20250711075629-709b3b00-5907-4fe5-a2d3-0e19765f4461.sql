-- Create a simple test to check admin context
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow admin access to calendar events" ON public.school_calendar_events;
DROP POLICY IF EXISTS "Teachers and doctors can view calendar events for their school" ON public.school_calendar_events;

-- Create a much simpler policy that just allows everything for now to test
CREATE POLICY "Simple admin calendar access"
ON public.school_calendar_events
FOR ALL
USING (
  -- Allow if any of these conditions are met
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Always allow for zulfimoon1@gmail.com regardless
  (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com') OR
  -- Allow if platform admin flag is set
  (current_setting('app.platform_admin', true) = 'true')
)
WITH CHECK (
  -- Same checks for insert/update
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com') OR
  (current_setting('app.platform_admin', true) = 'true')
);