-- Fix RLS policies for school_psychologists table to allow teachers to view psychologists in their school

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "school_psychologists_secure" ON public.school_psychologists;

-- Create a new policy that allows teachers to view psychologists in their school
CREATE POLICY "Teachers can view school psychologists in their school"
ON public.school_psychologists
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid() 
    AND t.school = school_psychologists.school
  )
  OR is_zulfimoon_admin()
);

-- Also allow students to view psychologists (for potential future student access)
CREATE POLICY "Students can view school psychologists in their school" 
ON public.school_psychologists
FOR SELECT
TO authenticated  
USING (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = auth.uid()
    AND s.school = school_psychologists.school
  )
);