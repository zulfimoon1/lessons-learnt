
-- Check and fix RLS policies for class_schedules table
-- Ensure teachers can create, read, update their own schedules

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Teachers can view their own schedules" ON public.class_schedules;
DROP POLICY IF EXISTS "Teachers can create their own schedules" ON public.class_schedules;
DROP POLICY IF EXISTS "Teachers can update their own schedules" ON public.class_schedules;
DROP POLICY IF EXISTS "Teachers can delete their own schedules" ON public.class_schedules;

-- Create comprehensive policies for class schedules
CREATE POLICY "Teachers can view their own schedules" 
  ON public.class_schedules 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE teachers.id = class_schedules.teacher_id 
      AND teachers.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Teachers can create their own schedules" 
  ON public.class_schedules 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE teachers.id = class_schedules.teacher_id 
      AND teachers.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Teachers can update their own schedules" 
  ON public.class_schedules 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE teachers.id = class_schedules.teacher_id 
      AND teachers.email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Teachers can delete their own schedules" 
  ON public.class_schedules 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE teachers.id = class_schedules.teacher_id 
      AND teachers.email = auth.jwt() ->> 'email'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
