
-- Fix the platform admin policies to properly allow all operations
-- Drop the existing problematic policies
DROP POLICY IF EXISTS "Platform admin access for teachers" ON public.teachers;
DROP POLICY IF EXISTS "Platform admin access for students" ON public.students;
DROP POLICY IF EXISTS "Allow admin authentication" ON public.teachers;

-- Create a more permissive policy for platform admins that handles all scenarios
CREATE POLICY "Allow platform admin operations on teachers"
  ON public.teachers
  FOR ALL
  TO anon, authenticated
  USING (
    -- Allow if admin context is set OR if it's the known admin account
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '') OR
    (email = 'zulfimoon1@gmail.com' AND role = 'admin')
  )
  WITH CHECK (
    -- Same conditions for insert/update
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '') OR
    (email = 'zulfimoon1@gmail.com' AND role = 'admin')
  );

-- Create similar policy for students table
CREATE POLICY "Allow platform admin operations on students"
  ON public.students
  FOR ALL
  TO anon, authenticated
  USING (
    -- Allow if admin context is set
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '')
  )
  WITH CHECK (
    -- Same condition for insert/update
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '')
  );
