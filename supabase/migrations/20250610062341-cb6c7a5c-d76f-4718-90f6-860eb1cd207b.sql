
-- Enable RLS on students table if not already enabled
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create policy to allow students to view their own data
CREATE POLICY "Students can view their own data" 
  ON public.students 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create policy to allow insertion of new students (for signup)
CREATE POLICY "Allow student signup" 
  ON public.students 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow students to update their own data
CREATE POLICY "Students can update their own data" 
  ON public.students 
  FOR UPDATE 
  USING (auth.uid() = id);
