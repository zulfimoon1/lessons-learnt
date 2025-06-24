
-- Restore working authentication by using the original working RLS policies
-- Drop the problematic restrictive policies I just created
DROP POLICY IF EXISTS "Enable read access for authentication" ON public.teachers;
DROP POLICY IF EXISTS "Enable insert for teacher registration" ON public.teachers;
DROP POLICY IF EXISTS "Enable read access for student authentication" ON public.students;
DROP POLICY IF EXISTS "Enable insert for student registration" ON public.students;
DROP POLICY IF EXISTS "Platform admin can update teachers" ON public.teachers;
DROP POLICY IF EXISTS "Platform admin can delete teachers" ON public.teachers;
DROP POLICY IF EXISTS "Platform admin can update students" ON public.students;
DROP POLICY IF EXISTS "Platform admin can delete students" ON public.students;

-- Restore the original working policies that were there before
CREATE POLICY "Allow all operations for simple auth" 
  ON public.teachers 
  FOR ALL 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for simple auth" 
  ON public.students 
  FOR ALL 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
