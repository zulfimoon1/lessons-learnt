-- Drop the problematic policy that relies on auth.uid()
DROP POLICY IF EXISTS "Teachers and doctors can view calendar events for their school" ON public.school_calendar_events;

-- Create a new policy that only uses context-based authentication
CREATE POLICY "Teachers and doctors can view calendar events for their school"
ON public.school_calendar_events
FOR SELECT
USING (
  -- Platform admin access
  is_verified_platform_admin() OR
  -- Custom auth context (for platform admin operations)  
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '' AND
   EXISTS (
     SELECT 1 FROM public.teachers t
     WHERE t.email = current_setting('app.current_user_email', true)
     AND t.school = school_calendar_events.school
   ))
);