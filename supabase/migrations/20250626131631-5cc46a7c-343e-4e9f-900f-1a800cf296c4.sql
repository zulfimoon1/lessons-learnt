
-- Simplified fix for transactions table RLS policies
-- First enable RLS if not already enabled
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create a single comprehensive policy for platform admin access
CREATE POLICY "Enable platform admin access to transactions" 
  ON public.transactions 
  FOR ALL 
  USING (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    current_setting('app.platform_admin', true) = 'true'
  )
  WITH CHECK (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    current_setting('app.platform_admin', true) = 'true'
  );
