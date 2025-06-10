
-- Drop the existing policy that might still be causing issues
DROP POLICY IF EXISTS "Enable simple auth for students" ON public.students;

-- Create a completely open policy for the simple auth system
CREATE POLICY "Allow all student operations for simple auth" 
  ON public.students 
  FOR ALL 
  TO public, anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Also ensure the same for teachers table
DROP POLICY IF EXISTS "Enable simple auth for teachers" ON public.teachers;

CREATE POLICY "Allow all teacher operations for simple auth" 
  ON public.teachers 
  FOR ALL 
  TO public, anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Grant explicit permissions to ensure access
GRANT ALL ON public.students TO anon;
GRANT ALL ON public.students TO authenticated;
GRANT ALL ON public.teachers TO anon;
GRANT ALL ON public.teachers TO authenticated;
