
-- Fix RLS policies for discount_codes table to work with platform admin authentication
DROP POLICY IF EXISTS "Platform admins can view all discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can create discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can update discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can delete discount codes" ON public.discount_codes;

-- Create new policies that work with the platform admin context
CREATE POLICY "Platform admins can view all discount codes" 
  ON public.discount_codes 
  FOR SELECT 
  TO anon, authenticated
  USING (
    -- Allow access when platform admin context is set
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '' AND
     EXISTS (
       SELECT 1 FROM public.teachers 
       WHERE email = current_setting('app.current_user_email', true) 
       AND role = 'admin'
     ))
  );

CREATE POLICY "Platform admins can create discount codes" 
  ON public.discount_codes 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (
    -- Allow creation when platform admin context is set
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '' AND
     EXISTS (
       SELECT 1 FROM public.teachers 
       WHERE email = current_setting('app.current_user_email', true) 
       AND role = 'admin'
     ))
  );

CREATE POLICY "Platform admins can update discount codes" 
  ON public.discount_codes 
  FOR UPDATE 
  TO anon, authenticated
  USING (
    -- Allow updates when platform admin context is set
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '' AND
     EXISTS (
       SELECT 1 FROM public.teachers 
       WHERE email = current_setting('app.current_user_email', true) 
       AND role = 'admin'
     ))
  );

CREATE POLICY "Platform admins can delete discount codes" 
  ON public.discount_codes 
  FOR DELETE 
  TO anon, authenticated
  USING (
    -- Allow deletion when platform admin context is set
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '' AND
     EXISTS (
       SELECT 1 FROM public.teachers 
       WHERE email = current_setting('app.current_user_email', true) 
       AND role = 'admin'
     ))
  );
