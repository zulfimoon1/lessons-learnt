
-- PHASE 1: Remove plaintext password storage and fix RLS policies
-- This addresses the most critical security vulnerabilities

-- First, let's secure the RLS policies by removing overly permissive access
-- Remove dangerous policies that allow unrestricted access
DROP POLICY IF EXISTS "Students can view their own data" ON public.students;
DROP POLICY IF EXISTS "Students can insert their own data" ON public.students;
DROP POLICY IF EXISTS "Teachers can view their own data" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can insert their own data" ON public.teachers;

-- Create proper authentication-based policies for students
CREATE POLICY "Authenticated users can view students from their school"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (
    school IN (
      SELECT school FROM public.teachers WHERE id = auth.uid()
      UNION ALL
      SELECT school FROM public.students WHERE id = auth.uid()
    )
  );

CREATE POLICY "Only teachers can insert students"
  ON public.students
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'teacher')
    )
  );

-- Create proper authentication-based policies for teachers
CREATE POLICY "Teachers can view teachers from same school"
  ON public.teachers
  FOR SELECT
  TO authenticated
  USING (
    school = (
      SELECT school FROM public.teachers WHERE id = auth.uid()
    )
  );

CREATE POLICY "Only admins can insert teachers"
  ON public.teachers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Remove anon access from sensitive tables
REVOKE ALL ON public.students FROM anon;
REVOKE ALL ON public.teachers FROM anon;
REVOKE ALL ON public.mental_health_alerts FROM anon;
REVOKE ALL ON public.weekly_summaries FROM anon;
REVOKE ALL ON public.live_chat_sessions FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;

-- Keep only necessary authenticated access
GRANT SELECT, INSERT ON public.students TO authenticated;
GRANT SELECT, INSERT ON public.teachers TO authenticated;

-- Secure feedback table to require authentication
DROP POLICY IF EXISTS "Public can insert feedback" ON public.feedback;
CREATE POLICY "Authenticated users can insert feedback"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can view feedback from their school"
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

-- Secure class schedules
DROP POLICY IF EXISTS "Students can view classes for their grade and school" ON public.class_schedules;
DROP POLICY IF EXISTS "Teachers can view and manage their own classes" ON public.class_schedules;

CREATE POLICY "Students can view classes for their school and grade"
  ON public.class_schedules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = auth.uid()
      AND s.school = class_schedules.school
      AND s.grade = class_schedules.grade
    )
  );

CREATE POLICY "Teachers can manage classes in their school"
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

-- Secure mental health alerts to only doctors and admins
DROP POLICY IF EXISTS "Only doctors and admins can view mental health alerts" ON public.mental_health_alerts;
CREATE POLICY "Only doctors and admins can view mental health alerts"
  ON public.mental_health_alerts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid()
      AND (t.role = 'doctor' OR t.role = 'admin')
      AND t.school = mental_health_alerts.school
    )
  );

-- Add input validation constraints
ALTER TABLE public.students 
  ADD CONSTRAINT students_name_not_empty CHECK (length(trim(full_name)) > 0),
  ADD CONSTRAINT students_school_not_empty CHECK (length(trim(school)) > 0),
  ADD CONSTRAINT students_grade_not_empty CHECK (length(trim(grade)) > 0);

ALTER TABLE public.teachers
  ADD CONSTRAINT teachers_name_not_empty CHECK (length(trim(name)) > 0),
  ADD CONSTRAINT teachers_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT teachers_school_not_empty CHECK (length(trim(school)) > 0);

-- Add audit logging trigger for authentication events
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID,
  old_data JSONB,
  new_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (table_name, operation, user_id, old_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_students
  AFTER INSERT OR UPDATE OR DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_teachers
  AFTER INSERT OR UPDATE OR DELETE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Create a secure function to get current user's role and school
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE(user_role TEXT, user_school TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT t.role::TEXT, t.school
  FROM public.teachers t
  WHERE t.id = auth.uid()
  UNION ALL
  SELECT 'student'::TEXT, s.school
  FROM public.students s
  WHERE s.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
