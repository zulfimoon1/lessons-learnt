
-- First, let's check what policies exist and drop ALL of them
DROP POLICY IF EXISTS "Platform admin full access to discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admin can manage discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Allow platform admin access to discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can view all discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can create discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can update discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can delete discount codes" ON public.discount_codes;

-- Drop any remaining functions
DROP FUNCTION IF EXISTS public.check_platform_admin_for_discount_codes();
DROP FUNCTION IF EXISTS public.is_platform_admin_for_discount_codes();

-- Create a single, comprehensive policy that works
CREATE POLICY "Platform admin access to discount codes"
  ON public.discount_codes
  FOR ALL
  TO anon, authenticated
  USING (
    -- Check if admin email is set in context and user is admin
    COALESCE(current_setting('app.current_user_email', true), '') != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    -- Same check for inserts/updates
    COALESCE(current_setting('app.current_user_email', true), '') != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    )
  );
