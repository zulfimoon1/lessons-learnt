
-- Drop the existing policy and recreate it with a simpler approach
DROP POLICY IF EXISTS "Allow platform admin access to discount codes" ON public.discount_codes;

-- Create a more straightforward policy that directly checks the admin context
CREATE POLICY "Platform admin can manage discount codes"
  ON public.discount_codes
  FOR ALL
  TO anon, authenticated
  USING (
    COALESCE(current_setting('app.current_user_email', true), '') != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    COALESCE(current_setting('app.current_user_email', true), '') != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    )
  );
