
-- Drop the current problematic policy
DROP POLICY IF EXISTS "Platform admin discount code access" ON public.discount_codes;

-- Create a new policy that works with the email-based admin context
CREATE POLICY "Platform admin discount code access"
  ON public.discount_codes
  FOR ALL
  TO anon, authenticated
  USING (
    -- Check if admin context is set and user is a valid platform admin
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
