-- Fix the context function to use session-scoped settings like it was working before
CREATE OR REPLACE FUNCTION public.set_platform_admin_context(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set context variables for the session (false = session-wide) - THIS WORKS ACROSS SEPARATE DB CALLS
  PERFORM set_config('app.current_user_email', admin_email, false);
  PERFORM set_config('app.platform_admin', 'true', false);
  PERFORM set_config('app.admin_verified', 'true', false);
  PERFORM set_config('app.admin_context_set', 'true', false);
  
  -- Log successful context setting
  RAISE NOTICE 'Platform admin context set for: % with all flags', admin_email;
END;
$$;