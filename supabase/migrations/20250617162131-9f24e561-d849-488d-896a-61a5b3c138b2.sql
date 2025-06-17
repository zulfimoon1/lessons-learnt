
-- Fix infinite recursion in RLS policies by using a simpler approach
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Allow zulfimoon admin full access to teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow zulfimoon admin full access to students" ON public.students;
DROP POLICY IF EXISTS "Platform admin access for teachers" ON public.teachers;
DROP POLICY IF EXISTS "Platform admin access for students" ON public.students;
DROP POLICY IF EXISTS "Allow admin authentication" ON public.teachers;

-- Create a security definer function that won't cause recursion
CREATE OR REPLACE FUNCTION public.is_zulfimoon_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct check for the specific admin email without table lookup
  RETURN current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create simple, non-recursive policies for teachers
CREATE POLICY "Allow zulfimoon admin access to teachers"
  ON public.teachers
  FOR ALL
  TO anon, authenticated
  USING (public.is_zulfimoon_admin())
  WITH CHECK (public.is_zulfimoon_admin());

-- Create simple, non-recursive policies for students
CREATE POLICY "Allow zulfimoon admin access to students"
  ON public.students
  FOR ALL
  TO anon, authenticated
  USING (public.is_zulfimoon_admin())
  WITH CHECK (public.is_zulfimoon_admin());

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_zulfimoon_admin() TO anon, authenticated;
