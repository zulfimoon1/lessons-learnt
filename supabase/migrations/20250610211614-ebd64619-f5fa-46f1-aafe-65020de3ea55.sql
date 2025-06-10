
-- Enable RLS on teachers table if not already enabled
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow platform admin authentication
-- This policy allows access to teacher records for authentication purposes
CREATE POLICY "Allow platform admin authentication" 
  ON public.teachers 
  FOR SELECT 
  USING (role = 'admin');

-- Create policy to allow teachers to view their own data
CREATE POLICY "Teachers can view their own data" 
  ON public.teachers 
  FOR SELECT 
  USING (auth.uid() = id);
