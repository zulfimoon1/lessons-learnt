
-- Fix teacher_profiles permissions for platform admin access
GRANT SELECT ON public.teacher_profiles TO anon;
GRANT SELECT ON public.teacher_profiles TO authenticated;

-- Create policy for teacher_profiles access
DROP POLICY IF EXISTS "Platform admin can access teacher profiles" ON public.teacher_profiles;
CREATE POLICY "Platform admin can access teacher profiles"
  ON public.teacher_profiles
  FOR SELECT
  TO anon, authenticated
  USING (public.check_platform_admin_access());

-- Also ensure the platform admin context function can access teachers table properly
DROP POLICY IF EXISTS "Allow platform admin authentication" ON public.teachers;
CREATE POLICY "Allow platform admin authentication" 
  ON public.teachers 
  FOR SELECT 
  TO anon, authenticated
  USING (
    -- Allow access when platform admin context is set OR for authentication purposes
    public.check_platform_admin_access() OR role = 'admin'
  );
