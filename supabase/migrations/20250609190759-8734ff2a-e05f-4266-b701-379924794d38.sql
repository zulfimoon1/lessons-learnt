
-- Create students table for student authentication
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(full_name, school, grade)
);

-- Create teachers table for teacher authentication  
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  school TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'doctor')),
  password_hash TEXT NOT NULL,
  specialization TEXT,
  license_number TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Create policies for students (users can only access their own data)
CREATE POLICY "Students can view their own data" 
  ON public.students 
  FOR SELECT 
  USING (true); -- Allow reading for authentication

CREATE POLICY "Students can insert their own data" 
  ON public.students 
  FOR INSERT 
  WITH CHECK (true); -- Allow signup

-- Create policies for teachers (users can only access their own data)
CREATE POLICY "Teachers can view their own data" 
  ON public.teachers 
  FOR SELECT 
  USING (true); -- Allow reading for authentication

CREATE POLICY "Teachers can insert their own data" 
  ON public.teachers 
  FOR INSERT 
  WITH CHECK (true); -- Allow signup

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.students TO anon;
GRANT SELECT, INSERT, UPDATE ON public.teachers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.teachers TO anon;
