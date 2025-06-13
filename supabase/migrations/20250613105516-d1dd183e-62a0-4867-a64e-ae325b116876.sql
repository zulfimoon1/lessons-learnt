
-- Grant proper permissions for platform admin operations
-- Remove overly restrictive policies and create admin-friendly ones

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Only admins can insert teachers" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can view teachers from same school" ON public.teachers;
DROP POLICY IF EXISTS "Only teachers can insert students" ON public.students;
DROP POLICY IF EXISTS "Authenticated users can view students from their school" ON public.students;

-- Create policies that allow platform admins (with role 'admin') to manage all data
CREATE POLICY "Platform admins can manage all teachers"
  ON public.teachers
  FOR ALL
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers admin_check
      WHERE admin_check.role = 'admin'
      AND admin_check.email = current_setting('app.current_user_email', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers admin_check
      WHERE admin_check.role = 'admin'
      AND admin_check.email = current_setting('app.current_user_email', true)
    )
  );

CREATE POLICY "Platform admins can manage all students"
  ON public.students
  FOR ALL
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers admin_check
      WHERE admin_check.role = 'admin'
      AND admin_check.email = current_setting('app.current_user_email', true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers admin_check
      WHERE admin_check.role = 'admin'
      AND admin_check.email = current_setting('app.current_user_email', true)
    )
  );

-- Grant necessary permissions to anon role for platform admin operations
GRANT ALL ON public.teachers TO anon;
GRANT ALL ON public.students TO anon;

-- Create a function to set the current user context for platform admin
CREATE OR REPLACE FUNCTION public.set_platform_admin_context(admin_email TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_email', admin_email, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
