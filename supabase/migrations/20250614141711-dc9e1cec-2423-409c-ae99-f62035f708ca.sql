
-- First, ensure RLS is enabled on the discount_codes table
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Platform admins can view all discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can create discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can update discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can delete discount codes" ON public.discount_codes;

-- Create a simplified security definer function that bypasses RLS
CREATE OR REPLACE FUNCTION public.check_platform_admin_for_discount_codes()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_email text;
  is_admin boolean := false;
BEGIN
  -- Get the current admin email from the context
  BEGIN
    admin_email := current_setting('app.current_user_email', true);
  EXCEPTION
    WHEN others THEN
      admin_email := '';
  END;
  
  -- Check if this email exists as an admin (bypass RLS with security definer)
  IF admin_email != '' AND admin_email IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = admin_email AND role = 'admin'
    ) INTO is_admin;
  END IF;
  
  RETURN is_admin;
END;
$$;

-- Create policies that allow access when admin context is properly set
CREATE POLICY "Allow platform admin access to discount codes"
  ON public.discount_codes
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_for_discount_codes())
  WITH CHECK (public.check_platform_admin_for_discount_codes());
