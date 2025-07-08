-- Remove dummy data
DELETE FROM public.school_calendar_events WHERE school = 'demo school';

-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS update_school_calendar_events_updated_at ON public.school_calendar_events;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the function with proper security settings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Recreate the trigger
CREATE TRIGGER update_school_calendar_events_updated_at
BEFORE UPDATE ON public.school_calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

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