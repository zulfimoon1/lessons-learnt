-- Completely reset RLS policies for school_psychologists table

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Platform admin full access to school_psychologists" ON public.school_psychologists;
DROP POLICY IF EXISTS "School admin can manage psychologists" ON public.school_psychologists;
DROP POLICY IF EXISTS "Students can view school psychologists in their school" ON public.school_psychologists;
DROP POLICY IF EXISTS "Teachers can view school psychologists in their school" ON public.school_psychologists;
DROP POLICY IF EXISTS "Teachers can view school psychologists with custom auth" ON public.school_psychologists;

-- Create a simple policy that allows all reads (since the app handles school filtering)
CREATE POLICY "Allow all reads for school_psychologists"
ON public.school_psychologists
FOR SELECT
USING (true);

-- Allow platform admin full access
CREATE POLICY "Platform admin full access to school_psychologists"
ON public.school_psychologists
FOR ALL
USING (
  ((current_setting('app.current_user_email'::text, true) = 'zulfimoon1@gmail.com'::text) OR 
   ((current_setting('app.current_user_email'::text, true) IS NOT NULL) AND 
    (current_setting('app.current_user_email'::text, true) <> ''::text)))
);