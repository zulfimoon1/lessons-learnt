
-- Drop the existing restrictive policies
DROP POLICY IF EXISTS "Students can view their own data" ON public.students;
DROP POLICY IF EXISTS "Allow student signup" ON public.students;
DROP POLICY IF EXISTS "Students can update their own data" ON public.students;

-- Create more permissive policies that work with the simple login system
-- Allow anonymous access for login verification (needed for the simple login system)
CREATE POLICY "Allow student login verification" 
  ON public.students 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Allow student signup (anonymous users need to insert)
CREATE POLICY "Allow student signup" 
  ON public.students 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Allow students to update their data (for future use)
CREATE POLICY "Allow student updates" 
  ON public.students 
  FOR UPDATE 
  TO anon, authenticated
  USING (true);
