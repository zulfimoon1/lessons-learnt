
-- Create or update RLS policies for platform admin access
DROP POLICY IF EXISTS "Allow platform admin access" ON public.teachers;

-- Create a policy that allows admin authentication by bypassing RLS for specific cases
CREATE POLICY "Allow admin authentication" 
ON public.teachers 
FOR SELECT 
TO anon, authenticated
USING (
  -- Allow access for admin role during authentication
  role = 'admin' OR 
  -- Allow access when platform admin context is set
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '')
);

-- Ensure the admin account exists with correct data
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
  
  -- Pre-computed bcrypt hash for 'admin123'
  hashed_password := '$2b$12$LQv3c1ybd1/1NQhqvI/T4.6wvQA6LMBUZn/dOokQ8Z2K2UHEYzHpu';
  
  IF NOT admin_exists THEN
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
    
    RAISE NOTICE 'Platform admin created successfully';
  ELSE
    -- Update password hash to ensure it's correct
    UPDATE public.teachers 
    SET password_hash = hashed_password
    WHERE email = 'zulfimoon1@gmail.com' AND role = 'admin';
    
    RAISE NOTICE 'Platform admin password updated';
  END IF;
END $$;
