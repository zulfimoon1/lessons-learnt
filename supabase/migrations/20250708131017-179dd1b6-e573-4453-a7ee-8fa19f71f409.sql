-- Update the set_platform_admin_context function to persist across transactions
CREATE OR REPLACE FUNCTION public.set_platform_admin_context(admin_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Set context variables for the entire session (false = session-wide)
  PERFORM set_config('app.current_user_email', admin_email, false);
  PERFORM set_config('app.platform_admin', 'true', false);
  PERFORM set_config('app.admin_verified', 'true', false);
  PERFORM set_config('app.admin_context_set', 'true', false);
  
  -- Log successful context setting
  RAISE NOTICE 'Platform admin context set for session: % with all flags', admin_email;
END;
$function$;