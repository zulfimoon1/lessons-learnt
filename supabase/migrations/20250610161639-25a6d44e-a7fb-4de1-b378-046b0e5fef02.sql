
-- Phase 1: Emergency Database Security Fixes (Fixed Version)
-- Remove dangerous "allow all" RLS policies and implement proper role-based access

-- Drop the dangerous overly permissive policies
DROP POLICY IF EXISTS "Enable simple auth for students" ON public.students;
DROP POLICY IF EXISTS "Enable simple auth for teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow all student operations for simple auth" ON public.students;
DROP POLICY IF EXISTS "Allow all teacher operations for simple auth" ON public.teachers;

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Students can view own profile" ON public.students;
DROP POLICY IF EXISTS "Students can update own profile" ON public.students;
DROP POLICY IF EXISTS "Allow student registration" ON public.students;
DROP POLICY IF EXISTS "Teachers can view own profile" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can update own profile" ON public.teachers;
DROP POLICY IF EXISTS "Allow teacher registration" ON public.teachers;
DROP POLICY IF EXISTS "Admins can view school teachers" ON public.teachers;
DROP POLICY IF EXISTS "Mental health professionals can view alerts" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Mental health professionals can update alerts" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Students can view own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Students can create feedback" ON public.feedback;
DROP POLICY IF EXISTS "Teachers can view school feedback" ON public.feedback;
DROP POLICY IF EXISTS "Teachers can view school schedules" ON public.class_schedules;
DROP POLICY IF EXISTS "Teachers can manage school schedules" ON public.class_schedules;
DROP POLICY IF EXISTS "Students can view own summaries" ON public.weekly_summaries;
DROP POLICY IF EXISTS "Students can create own summaries" ON public.weekly_summaries;
DROP POLICY IF EXISTS "Teachers can view school summaries" ON public.weekly_summaries;

-- Create secure, role-based RLS policies for students table
-- Students can only access their own data
CREATE POLICY "Students can view own profile" 
  ON public.students 
  FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Students can update own profile" 
  ON public.students 
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow authenticated users to insert new student records (for signup)
CREATE POLICY "Allow student registration" 
  ON public.students 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Create secure, role-based RLS policies for teachers table
-- Teachers can only access their own data
CREATE POLICY "Teachers can view own profile" 
  ON public.teachers 
  FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Teachers can update own profile" 
  ON public.teachers 
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow authenticated users to insert new teacher records (for signup)
CREATE POLICY "Allow teacher registration" 
  ON public.teachers 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Admins can view teachers in their school
CREATE POLICY "Admins can view school teachers" 
  ON public.teachers 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers admin_teacher 
      WHERE admin_teacher.id = auth.uid() 
      AND admin_teacher.role = 'admin' 
      AND admin_teacher.school = teachers.school
    )
  );

-- Secure mental health alerts - only mental health professionals and admins can access
CREATE POLICY "Mental health professionals can view alerts" 
  ON public.mental_health_alerts 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t 
      WHERE t.id = auth.uid() 
      AND t.role IN ('doctor', 'admin')
      AND t.school = mental_health_alerts.school
    )
  );

CREATE POLICY "Mental health professionals can update alerts" 
  ON public.mental_health_alerts 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t 
      WHERE t.id = auth.uid() 
      AND t.role IN ('doctor', 'admin')
      AND t.school = mental_health_alerts.school
    )
  );

-- Secure feedback table - students can only access their own feedback, teachers can access feedback from their school
CREATE POLICY "Students can view own feedback" 
  ON public.feedback 
  FOR SELECT 
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can create feedback" 
  ON public.feedback 
  FOR INSERT 
  TO authenticated
  WITH CHECK (student_id = auth.uid() OR student_id IS NULL);

CREATE POLICY "Teachers can view school feedback" 
  ON public.feedback 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.class_schedules cs
      JOIN public.teachers t ON t.id = auth.uid()
      WHERE cs.id = feedback.class_schedule_id
      AND cs.school = t.school
    )
  );

-- Secure class schedules - teachers can only access schedules from their school
CREATE POLICY "Teachers can view school schedules" 
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

CREATE POLICY "Teachers can manage school schedules" 
  ON public.class_schedules 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t 
      WHERE t.id = auth.uid() 
      AND t.school = class_schedules.school
    )
  );

-- Secure weekly summaries - students can only access their own, teachers can access from their school
CREATE POLICY "Students can view own summaries" 
  ON public.weekly_summaries 
  FOR SELECT 
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can create own summaries" 
  ON public.weekly_summaries 
  FOR INSERT 
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view school summaries" 
  ON public.weekly_summaries 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t 
      WHERE t.id = auth.uid() 
      AND t.school = weekly_summaries.school
    )
  );

-- Revoke all permissions from anon users (no anonymous access to sensitive data)
REVOKE ALL ON public.students FROM anon;
REVOKE ALL ON public.teachers FROM anon;
REVOKE ALL ON public.feedback FROM anon;
REVOKE ALL ON public.mental_health_alerts FROM anon;
REVOKE ALL ON public.weekly_summaries FROM anon;
REVOKE ALL ON public.class_schedules FROM anon;

-- Grant only necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.teachers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.feedback TO authenticated;
GRANT SELECT, UPDATE ON public.mental_health_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.weekly_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_schedules TO authenticated;
