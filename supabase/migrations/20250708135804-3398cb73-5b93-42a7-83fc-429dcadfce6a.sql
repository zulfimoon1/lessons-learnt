-- Fix RLS policy to allow teachers to view school calendar events
DROP POLICY IF EXISTS "Teachers and doctors can view calendar events for their school" ON public.school_calendar_events;

-- Create new policy that works with both custom auth context and regular teacher authentication
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
   )) OR
  -- Regular teacher authentication (this was missing!)
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid() 
    AND t.school = school_calendar_events.school
  ) OR
  -- Student access
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = auth.uid() 
    AND s.school = school_calendar_events.school
  )
);