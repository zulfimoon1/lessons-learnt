
-- Drop existing policies on transactions table
DROP POLICY IF EXISTS "Enable platform admin access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Direct admin email access to transactions" ON public.transactions;

-- Create a more comprehensive policy that checks multiple context variables
CREATE POLICY "Platform admin full access to transactions" 
  ON public.transactions 
  FOR ALL 
  USING (
    -- Check if any of the admin context variables are set
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    current_setting('app.platform_admin', true) = 'true' OR
    current_setting('app.admin_verified', true) = 'true' OR
    current_setting('app.admin_context_set', true) = 'true' OR
    -- Also check the function-based approach
    public.is_verified_platform_admin() = true
  )
  WITH CHECK (
    -- Same checks for INSERT/UPDATE operations
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    current_setting('app.platform_admin', true) = 'true' OR
    current_setting('app.admin_verified', true) = 'true' OR
    current_setting('app.admin_context_set', true) = 'true' OR
    public.is_verified_platform_admin() = true
  );
