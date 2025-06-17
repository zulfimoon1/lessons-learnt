
-- Fix the platform admin policies to allow proper access
-- First, drop any conflicting policies
DROP POLICY IF EXISTS "Allow platform admin operations on teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow platform admin operations on students" ON public.students;
DROP POLICY IF EXISTS "Allow admin authentication" ON public.teachers;

-- Create a more permissive policy for the known admin account
CREATE POLICY "Allow zulfimoon admin full access to teachers"
  ON public.teachers
  FOR ALL
  TO anon, authenticated
  USING (
    -- Allow if admin context is set OR if it's the known admin account
    (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com') OR
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '' AND
     EXISTS (
       SELECT 1 FROM public.teachers t
       WHERE t.email = current_setting('app.current_user_email', true) 
       AND t.role = 'admin'
     ))
  )
  WITH CHECK (
    -- Same conditions for insert/update
    (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com') OR
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '' AND
     EXISTS (
       SELECT 1 FROM public.teachers t
       WHERE t.email = current_setting('app.current_user_email', true) 
       AND t.role = 'admin'
     ))
  );

-- Create similar policy for students table
CREATE POLICY "Allow zulfimoon admin full access to students"
  ON public.students
  FOR ALL
  TO anon, authenticated
  USING (
    -- Allow if admin context is set or if it's the known admin
    (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com') OR
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '')
  )
  WITH CHECK (
    -- Same condition for insert/update
    (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com') OR
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '')
  );

-- Update the platform admin context function to be more reliable
CREATE OR REPLACE FUNCTION public.set_platform_admin_context(admin_email TEXT)
RETURNS VOID AS $$
BEGIN
  -- Always set the context, even if the admin doesn't exist yet
  PERFORM set_config('app.current_user_email', admin_email, true);
  
  -- Log the context setting for debugging
  RAISE NOTICE 'Platform admin context set for: %', admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions to ensure the policies work
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.teachers TO anon, authenticated;
GRANT ALL ON public.students TO anon, authenticated;
