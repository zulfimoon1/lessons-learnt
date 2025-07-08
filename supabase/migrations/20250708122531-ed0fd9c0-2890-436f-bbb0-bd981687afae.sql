-- Fix the security warning by updating the function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Update RLS policies to work with custom authentication system
DROP POLICY IF EXISTS "School admins can manage calendar events for their school" ON public.school_calendar_events;
DROP POLICY IF EXISTS "Teachers and doctors can view calendar events for their school" ON public.school_calendar_events;

-- Create new policies that work with custom auth context
CREATE POLICY "School admins can manage calendar events for their school"
ON public.school_calendar_events
FOR ALL
USING (
  is_verified_platform_admin() OR
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '' AND
   EXISTS (
     SELECT 1 FROM public.teachers t
     WHERE t.email = current_setting('app.current_user_email', true)
     AND t.school = school_calendar_events.school 
     AND t.role = 'admin'
   ))
)
WITH CHECK (
  is_verified_platform_admin() OR
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '' AND
   EXISTS (
     SELECT 1 FROM public.teachers t
     WHERE t.email = current_setting('app.current_user_email', true)
     AND t.school = school_calendar_events.school 
     AND t.role = 'admin'
   ))
);

CREATE POLICY "Teachers and doctors can view calendar events for their school"
ON public.school_calendar_events
FOR SELECT
USING (
  is_verified_platform_admin() OR
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '' AND
   EXISTS (
     SELECT 1 FROM public.teachers t
     WHERE t.email = current_setting('app.current_user_email', true)
     AND t.school = school_calendar_events.school
   )) OR
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = auth.uid() 
    AND s.school = school_calendar_events.school
  )
);