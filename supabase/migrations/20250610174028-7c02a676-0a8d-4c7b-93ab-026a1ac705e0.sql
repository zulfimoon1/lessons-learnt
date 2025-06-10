
-- First, let's check if the students table exists and create it if needed
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their own data" ON public.students;
DROP POLICY IF EXISTS "Students can insert their own data" ON public.students;
DROP POLICY IF EXISTS "Students can update their own data" ON public.students;
DROP POLICY IF EXISTS "Allow anonymous student login" ON public.students;
DROP POLICY IF EXISTS "Allow anonymous student signup" ON public.students;

-- Create policies that allow anonymous access for login/signup
-- This is necessary because during login, the user is not yet authenticated
CREATE POLICY "Allow anonymous student login" ON public.students
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous student signup" ON public.students
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policies for authenticated students to manage their own data
CREATE POLICY "Students can view their own data" ON public.students
  FOR SELECT
  TO authenticated
  USING (full_name = current_setting('app.current_student_name', true) 
         AND school = current_setting('app.current_student_school', true)
         AND grade = current_setting('app.current_student_grade', true));

CREATE POLICY "Students can update their own data" ON public.students
  FOR UPDATE
  TO authenticated
  USING (full_name = current_setting('app.current_student_name', true) 
         AND school = current_setting('app.current_student_school', true)
         AND grade = current_setting('app.current_student_grade', true));
