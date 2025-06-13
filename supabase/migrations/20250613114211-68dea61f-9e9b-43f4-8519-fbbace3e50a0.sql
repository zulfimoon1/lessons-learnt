
-- Fix platform admin authentication by updating existing policies

-- Drop existing policy and recreate it
DROP POLICY IF EXISTS "Allow platform admin authentication" ON public.teachers;

-- Create a policy that allows platform admin context checking without recursion
CREATE POLICY "Allow platform admin authentication" 
  ON public.teachers 
  FOR SELECT 
  TO anon, authenticated
  USING (
    -- Allow access when platform admin context is set OR for authentication purposes
    public.check_platform_admin_access() OR role = 'admin'
  );

-- Drop and recreate student policy if it exists
DROP POLICY IF EXISTS "Platform admin can access students" ON public.students;

-- Create a policy for platform admin operations on students
CREATE POLICY "Platform admin can access students"
  ON public.students
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());

-- Grant necessary permissions for platform admin operations
GRANT SELECT ON public.teachers TO anon;
GRANT SELECT ON public.students TO anon;
GRANT SELECT ON public.feedback TO anon;
GRANT SELECT ON public.class_schedules TO anon;

-- Ensure the platform admin context function can be called
GRANT EXECUTE ON FUNCTION public.set_platform_admin_context(text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_platform_admin_access() TO anon;
GRANT EXECUTE ON FUNCTION public.get_platform_stats(text) TO anon;
