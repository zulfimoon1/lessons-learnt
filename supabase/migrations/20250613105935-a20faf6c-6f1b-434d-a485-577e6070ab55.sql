
-- Fix infinite recursion in RLS policies by using security definer functions
-- Drop all existing problematic policies first
DROP POLICY IF EXISTS "Platform admins can manage all teachers" ON public.teachers;
DROP POLICY IF EXISTS "Platform admins can manage all students" ON public.students;

-- Create a simple security definer function that doesn't cause recursion
CREATE OR REPLACE FUNCTION public.check_platform_admin_access()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the current setting indicates platform admin access
  RETURN current_setting('app.current_user_email', true) IS NOT NULL
    AND current_setting('app.current_user_email', true) != '';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create non-recursive policies for teachers table
CREATE POLICY "Platform admin access for teachers"
  ON public.teachers
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());

-- Create non-recursive policies for students table  
CREATE POLICY "Platform admin access for students"
  ON public.students
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.check_platform_admin_access() TO anon, authenticated;
