
-- Drop existing policies and create simpler, more reliable ones
DROP POLICY IF EXISTS "Platform admins can view all discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can create discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can update discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can delete discount codes" ON public.discount_codes;

-- Create a security definer function to check platform admin access
CREATE OR REPLACE FUNCTION public.is_platform_admin_for_discount_codes()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if platform admin context is properly set
  RETURN COALESCE(current_setting('app.current_user_email', true), '') != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    );
END;
$$;

-- Create new policies using the security definer function
CREATE POLICY "Platform admins can view all discount codes" 
  ON public.discount_codes 
  FOR SELECT 
  TO anon, authenticated
  USING (public.is_platform_admin_for_discount_codes());

CREATE POLICY "Platform admins can create discount codes" 
  ON public.discount_codes 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (public.is_platform_admin_for_discount_codes());

CREATE POLICY "Platform admins can update discount codes" 
  ON public.discount_codes 
  FOR UPDATE 
  TO anon, authenticated
  USING (public.is_platform_admin_for_discount_codes());

CREATE POLICY "Platform admins can delete discount codes" 
  ON public.discount_codes 
  FOR DELETE 
  TO anon, authenticated
  USING (public.is_platform_admin_for_discount_codes());
