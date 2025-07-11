-- Phase 2: Incremental change - Add RLS policy for school admins to view their school's calendar events
CREATE POLICY "School admins can view calendar events for their school"
ON public.school_calendar_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid() 
    AND t.school = school_calendar_events.school 
    AND t.role = 'admin'
  )
);