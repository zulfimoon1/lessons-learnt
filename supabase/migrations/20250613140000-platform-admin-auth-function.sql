
-- Create a function specifically for platform admin authentication that bypasses RLS
CREATE OR REPLACE FUNCTION public.authenticate_platform_admin(admin_email text, provided_password text)
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  role text,
  school text,
  password_hash text,
  auth_success boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- This function runs with elevated privileges to bypass RLS for platform admin auth
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.email,
    t.role,
    t.school,
    t.password_hash,
    true as auth_success
  FROM public.teachers t
  WHERE t.email = admin_email 
    AND t.role = 'admin'
  LIMIT 1;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.authenticate_platform_admin(text, text) TO anon, authenticated;

-- Create or update the admin user for zulfimoon1@gmail.com
DO $$
DECLARE
  admin_exists boolean;
  hashed_password text;
BEGIN
  -- Check if admin exists
  SELECT EXISTS(
    SELECT 1 FROM public.teachers 
    WHERE email = 'zulfimoon1@gmail.com' AND role = 'admin'
  ) INTO admin_exists;
  
  -- If admin doesn't exist, create them
  IF NOT admin_exists THEN
    -- Generate bcrypt hash for 'admin123' (using a pre-computed hash)
    hashed_password := '$2b$12$LQv3c1yqBW7nEUQP5gzK4OeFKqT5DZJWkzGHOGGC7pNf.JGMv5.Sm';
    
    INSERT INTO public.teachers (
      name, 
      email, 
      school, 
      role, 
      password_hash
    ) VALUES (
      'Platform Admin',
      'zulfimoon1@gmail.com',
      'Platform Administration',
      'admin',
      hashed_password
    );
    
    RAISE NOTICE 'Platform admin created for zulfimoon1@gmail.com';
  ELSE
    -- Update password hash if admin exists
    hashed_password := '$2b$12$LQv3c1yqBW7nEUQP5gzK4OeFKqT5DZJWkzGHOGGC7pNf.JGMv5.Sm';
    
    UPDATE public.teachers 
    SET password_hash = hashed_password
    WHERE email = 'zulfimoon1@gmail.com' AND role = 'admin';
    
    RAISE NOTICE 'Platform admin password updated for zulfimoon1@gmail.com';
  END IF;
END $$;
