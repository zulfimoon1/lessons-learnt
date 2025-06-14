
-- Drop the current problematic policy
DROP POLICY IF EXISTS "admin_full_access_discount_codes" ON public.discount_codes;

-- Temporarily disable RLS completely to test
ALTER TABLE public.discount_codes DISABLE ROW LEVEL SECURITY;

-- Create a simple function to check if user is platform admin
CREATE OR REPLACE FUNCTION public.is_platform_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Direct check for your admin email
  IF current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' THEN
    RETURN true;
  END IF;
  
  -- Check if user exists in teachers table with admin role
  RETURN EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE email = current_setting('app.current_user_email', true) 
    AND role = 'admin'
  );
END;
$$;

-- Re-enable RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Create a very simple policy using the function
CREATE POLICY "platform_admin_discount_access"
  ON public.discount_codes
  FOR ALL
  TO anon, authenticated
  USING (public.is_platform_admin_user())
  WITH CHECK (public.is_platform_admin_user());
