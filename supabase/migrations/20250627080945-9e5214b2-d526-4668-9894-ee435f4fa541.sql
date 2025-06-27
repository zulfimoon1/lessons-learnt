
-- Create the function to set platform admin context
CREATE OR REPLACE FUNCTION public.set_platform_admin_context(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Set multiple context variables for maximum reliability
  PERFORM set_config('app.current_user_email', admin_email, true);
  PERFORM set_config('app.platform_admin', 'true', true);
  PERFORM set_config('app.admin_verified', 'true', true);
  PERFORM set_config('app.admin_context_set', 'true', true);
  
  -- Log successful context setting
  RAISE NOTICE 'Platform admin context set for: % with all flags', admin_email;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.set_platform_admin_context(text) TO anon, authenticated;
