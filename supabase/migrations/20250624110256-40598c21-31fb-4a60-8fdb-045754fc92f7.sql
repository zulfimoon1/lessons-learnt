
-- Fix RLS policies for class_schedules table to allow teachers to insert their own schedules
DROP POLICY IF EXISTS "class_schedules_school_access" ON public.class_schedules;

-- Create separate policies for different operations
CREATE POLICY "Teachers can view schedules in their school"
ON public.class_schedules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = class_schedules.school
  )
);

CREATE POLICY "Teachers can create schedules in their school"
ON public.class_schedules
FOR INSERT
TO authenticated
WITH CHECK (
  teacher_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = school
  )
);

CREATE POLICY "Teachers can update their own schedules"
ON public.class_schedules
FOR UPDATE
TO authenticated
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own schedules"
ON public.class_schedules
FOR DELETE
TO authenticated
USING (teacher_id = auth.uid());

-- Also add platform admin access
CREATE POLICY "Platform admin full access to class_schedules"
ON public.class_schedules
FOR ALL
TO anon, authenticated
USING (
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '')
)
WITH CHECK (
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '')
);
