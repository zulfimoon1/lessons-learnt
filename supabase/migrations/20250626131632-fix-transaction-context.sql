
-- Add a helper function for setting configuration values
CREATE OR REPLACE FUNCTION public.set_config(setting_name text, new_value text, is_local boolean DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config(setting_name, new_value, is_local);
END;
$$;

-- Ensure the platform admin context function exists and works properly
CREATE OR REPLACE FUNCTION public.set_platform_admin_context(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Update the transactions policy to be more permissive for the admin
DROP POLICY IF EXISTS "Enable platform admin access to transactions" ON public.transactions;

CREATE POLICY "Enable platform admin access to transactions" 
  ON public.transactions 
  FOR ALL 
  USING (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    current_setting('app.platform_admin', true) = 'true' OR
    current_setting('app.admin_verified', true) = 'true' OR
    current_setting('app.admin_context_set', true) = 'true'
  )
  WITH CHECK (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    current_setting('app.platform_admin', true) = 'true' OR
    current_setting('app.admin_verified', true) = 'true' OR
    current_setting('app.admin_context_set', true) = 'true'
  );
