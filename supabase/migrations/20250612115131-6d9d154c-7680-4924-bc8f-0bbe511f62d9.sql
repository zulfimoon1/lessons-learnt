
-- Drop existing problematic policies that might cause infinite recursion
DROP POLICY IF EXISTS "Teachers can view own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Allow teacher registration" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Admins can view school teachers" ON public.teacher_profiles;

-- Create a security definer function to get current user info without causing recursion
CREATE OR REPLACE FUNCTION public.get_current_teacher_info()
RETURNS TABLE(teacher_role text, teacher_school text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
    RETURN QUERY
    SELECT t.role::TEXT, t.school
    FROM public.teachers t
    WHERE t.id = auth.uid();
END;
$$;

-- Create new secure RLS policies for teacher_profiles using the security definer function
CREATE POLICY "Teachers can view own profile" 
  ON public.teacher_profiles 
  FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Teachers can update own profile" 
  ON public.teacher_profiles 
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow authenticated users to insert new teacher profiles (for signup)
CREATE POLICY "Allow teacher registration" 
  ON public.teacher_profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Admins can view teachers in their school using the security definer function
CREATE POLICY "Admins can view school teacher profiles" 
  ON public.teacher_profiles 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.get_current_teacher_info() AS info
      WHERE info.teacher_role = 'admin' 
      AND info.teacher_school = teacher_profiles.school
    )
  );

-- Grant necessary permissions to the security definer function
GRANT EXECUTE ON FUNCTION public.get_current_teacher_info() TO authenticated;
