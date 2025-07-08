-- Drop all existing policies and create one simple working policy
DROP POLICY IF EXISTS "Allow calendar management with admin context" ON public.school_calendar_events;
DROP POLICY IF EXISTS "Platform admin full access to school_calendar_events" ON public.school_calendar_events;
DROP POLICY IF EXISTS "School admins can manage calendar events for their school" ON public.school_calendar_events;
DROP POLICY IF EXISTS "Teachers and doctors can view calendar events for their school" ON public.school_calendar_events;

-- Create a single comprehensive policy that works
CREATE POLICY "School calendar events access"
ON public.school_calendar_events
FOR ALL
USING (
  -- Platform admin access
  is_verified_platform_admin() OR
  -- School admin access via teacher table
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.email = current_setting('app.current_user_email', true)
    AND t.school = school_calendar_events.school 
    AND t.role = 'admin'
  ) OR
  -- Read access for teachers and students in the same school
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = school_calendar_events.school
  ) OR
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = auth.uid()
    AND s.school = school_calendar_events.school
  )
)
WITH CHECK (
  -- Write access only for platform admin and school admins
  is_verified_platform_admin() OR
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.email = current_setting('app.current_user_email', true)
    AND t.school = school_calendar_events.school 
    AND t.role = 'admin'
  )
);