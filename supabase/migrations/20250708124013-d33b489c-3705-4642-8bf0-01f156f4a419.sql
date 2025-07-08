-- Remove dummy data
DELETE FROM public.school_calendar_events WHERE school = 'demo school';

-- Fix the security warning by updating the function with proper search_path and security
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Re-enable RLS with a working policy
ALTER TABLE public.school_calendar_events ENABLE ROW LEVEL SECURITY;

-- Create a simplified policy that allows all operations for authenticated users via context
CREATE POLICY "Allow calendar management with admin context"
ON public.school_calendar_events
FOR ALL
USING (
  -- Allow if any admin context is set (from set_platform_admin_context function)
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '')
)
WITH CHECK (
  -- Same check for inserts/updates
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '')
);