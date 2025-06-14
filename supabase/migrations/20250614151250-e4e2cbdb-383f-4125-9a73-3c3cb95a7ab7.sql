
-- Re-create the platform admin function that may have been referenced elsewhere
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

-- Ensure the discount_codes table is properly configured
-- Add any missing constraints or indexes that may have been affected
ALTER TABLE public.discount_codes 
ADD CONSTRAINT discount_codes_code_unique UNIQUE (code);

-- Make sure current_uses defaults to 0
ALTER TABLE public.discount_codes 
ALTER COLUMN current_uses SET DEFAULT 0;

-- Ensure created_at and updated_at have proper defaults
ALTER TABLE public.discount_codes 
ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.discount_codes 
ALTER COLUMN updated_at SET DEFAULT now();
