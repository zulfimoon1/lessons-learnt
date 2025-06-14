
-- Drop the problematic RPC function and policy
DROP POLICY IF EXISTS "Platform admin can manage discount codes" ON public.discount_codes;
DROP FUNCTION IF EXISTS public.check_platform_admin_for_discount_codes();

-- Create a much simpler policy that directly checks admin status
CREATE POLICY "Platform admin full access to discount codes"
  ON public.discount_codes
  FOR ALL
  TO anon, authenticated
  USING (
    -- Allow if admin context is set and user exists as admin
    current_setting('app.current_user_email', true) IS NOT NULL
    AND current_setting('app.current_user_email', true) != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    -- Same check for inserts/updates
    current_setting('app.current_user_email', true) IS NOT NULL
    AND current_setting('app.current_user_email', true) != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    )
  );
