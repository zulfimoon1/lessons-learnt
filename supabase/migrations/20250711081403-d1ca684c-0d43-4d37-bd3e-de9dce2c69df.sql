-- Revert to the working transaction-scoped context that was working yesterday
CREATE OR REPLACE FUNCTION public.set_platform_admin_context(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set context variables for the transaction (true = transaction-scoped) - THIS IS HOW IT WORKED YESTERDAY
  PERFORM set_config('app.current_user_email', admin_email, true);
  PERFORM set_config('app.platform_admin', 'true', true);
  PERFORM set_config('app.admin_verified', 'true', true);
  PERFORM set_config('app.admin_context_set', 'true', true);
  
  -- Log successful context setting
  RAISE NOTICE 'Platform admin context set for: % with all flags', admin_email;
END;
$$;