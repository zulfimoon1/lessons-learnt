
-- First, let's drop the existing policy completely
DROP POLICY IF EXISTS "Platform admin discount code access" ON public.discount_codes;

-- Create a simpler, more direct policy that works with the platform admin context
CREATE POLICY "Platform admin full access to discount codes"
  ON public.discount_codes
  FOR ALL
  TO anon, authenticated
  USING (
    -- Allow access if platform admin context is properly set
    COALESCE(current_setting('app.current_user_email', true), '') != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = COALESCE(current_setting('app.current_user_email', true), '')
      AND role = 'admin'
    )
  )
  WITH CHECK (
    -- Same check for inserts/updates  
    COALESCE(current_setting('app.current_user_email', true), '') != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = COALESCE(current_setting('app.current_user_email', true), '')
      AND role = 'admin'
    )
  );

-- Also ensure RLS is enabled
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
