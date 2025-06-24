
-- First, let's see what policies currently exist on the feedback table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'feedback';

-- Drop all existing policies on feedback table to start fresh
DROP POLICY IF EXISTS "Students can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view relevant feedback" ON public.feedback;
DROP POLICY IF EXISTS "Allow anonymous feedback submission" ON public.feedback;
DROP POLICY IF EXISTS "Allow feedback reading for authenticated users" ON public.feedback;

-- Create a simple INSERT policy that allows all students to submit feedback
CREATE POLICY "Enable feedback insertion for all users"
  ON public.feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create a simple SELECT policy that allows reading feedback
CREATE POLICY "Enable feedback reading for all users"
  ON public.feedback
  FOR SELECT
  TO anon, authenticated
  USING (true);
