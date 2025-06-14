
-- Drop the current problematic policy completely
DROP POLICY IF EXISTS "Platform admin full access to discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admin discount code access" ON public.discount_codes;

-- Create a simpler policy that directly checks the admin email without relying on context settings
CREATE POLICY "Direct platform admin access to discount codes"
  ON public.discount_codes
  FOR ALL
  TO anon, authenticated
  USING (
    -- Direct check: if the current setting matches a valid platform admin
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = COALESCE(current_setting('app.current_user_email', true), '')
      AND role = 'admin'
      AND email != ''
    )
  )
  WITH CHECK (
    -- Same check for inserts/updates
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = COALESCE(current_setting('app.current_user_email', true), '')
      AND role = 'admin'
      AND email != ''
    )
  );

-- Ensure RLS is enabled
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
