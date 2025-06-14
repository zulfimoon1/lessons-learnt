
-- Fix the search_path security issue for is_platform_admin_user function
CREATE OR REPLACE FUNCTION public.is_platform_admin_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
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
