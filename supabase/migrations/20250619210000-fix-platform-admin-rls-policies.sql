
-- Enable RLS on teachers table if not already enabled
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Platform admin full access to teachers" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can view their own data" ON public.teachers;
DROP POLICY IF EXISTS "Admins can manage school teachers" ON public.teachers;

-- Create comprehensive platform admin policy
CREATE POLICY "Platform admin full access to teachers" 
ON public.teachers 
FOR ALL 
USING (
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
  OR current_setting('app.platform_admin', true) = 'true'
);

-- Create policy for regular school admins to manage their school's teachers
CREATE POLICY "School admins can manage their teachers" 
ON public.teachers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t 
    WHERE t.id = auth.uid() 
    AND t.role = 'admin' 
    AND t.school = teachers.school
  )
);

-- Create policy for teachers to view their own data
CREATE POLICY "Teachers can view own data" 
ON public.teachers 
FOR SELECT 
USING (id = auth.uid());
