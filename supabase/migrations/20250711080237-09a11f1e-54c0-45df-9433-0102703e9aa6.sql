-- Restore proper RLS policies and fix the actual issue
-- Drop the broken "simple" policy
DROP POLICY IF EXISTS "Simple admin calendar access" ON public.school_calendar_events;

-- Restore the working policy that was in place before
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

-- Fix the set_platform_admin_context function to ensure it works properly
CREATE OR REPLACE FUNCTION public.set_platform_admin_context(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set context variables for the transaction (true = transaction-scoped)
  PERFORM set_config('app.current_user_email', admin_email, true);
  PERFORM set_config('app.platform_admin', 'true', true);
  PERFORM set_config('app.admin_verified', 'true', true);
  PERFORM set_config('app.admin_context_set', 'true', true);
  
  -- Log successful context setting
  RAISE NOTICE 'Platform admin context set for: % with all flags', admin_email;
END;
$$;