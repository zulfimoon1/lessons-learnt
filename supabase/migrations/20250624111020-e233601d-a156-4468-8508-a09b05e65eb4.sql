
-- Update the RLS policies to properly handle the platform admin context
DROP POLICY IF EXISTS "Teachers can create schedules in their school" ON public.class_schedules;
DROP POLICY IF EXISTS "Platform admin full access to class_schedules" ON public.class_schedules;

-- Create a more permissive policy for teachers to insert schedules
CREATE POLICY "Teachers can create schedules for their school"
ON public.class_schedules
FOR INSERT
TO authenticated, anon
WITH CHECK (
  -- Allow if platform admin context is set
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Allow if teacher exists and matches school
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = teacher_id
    AND t.school = school
  )
);

-- Create a comprehensive platform admin policy
CREATE POLICY "Platform admin comprehensive access to class_schedules"
ON public.class_schedules
FOR ALL
TO anon, authenticated
USING (
  current_setting('app.current_user_email', true) IS NOT NULL AND 
  current_setting('app.current_user_email', true) != ''
)
WITH CHECK (
  current_setting('app.current_user_email', true) IS NOT NULL AND 
  current_setting('app.current_user_email', true) != ''
);
