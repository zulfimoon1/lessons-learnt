
-- Fix the teachers table RLS policies to work with platform admin context
DROP POLICY IF EXISTS "Allow all operations on teachers" ON public.teachers;
DROP POLICY IF EXISTS "Platform admin full access to teachers" ON public.teachers;

-- Create a comprehensive platform admin policy for teachers table
CREATE POLICY "Platform admin comprehensive access to teachers"
ON public.teachers
FOR ALL
TO anon, authenticated
USING (
  current_setting('app.current_user_email', true) IS NOT NULL AND 
  current_setting('app.current_user_email', true) != ''
)
WITH CHECK (
  current_setting('app.current_user_email', true) IS NOT NULL AND 
  current_setting('app.current_user_email', true) != ''
);

-- Create a policy for teachers to view themselves
CREATE POLICY "Teachers can view their own data"
ON public.teachers
FOR SELECT
TO authenticated, anon
USING (
  -- Allow if platform admin context is set
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Allow teachers to see their own record
  id = auth.uid()
);
