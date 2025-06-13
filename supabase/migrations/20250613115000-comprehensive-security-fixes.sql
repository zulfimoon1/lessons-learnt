
-- COMPREHENSIVE SECURITY FIXES
-- This migration addresses critical RLS policy vulnerabilities and strengthens authentication

-- First, drop all existing overly permissive policies
DROP POLICY IF EXISTS "Allow student signup" ON public.students;
DROP POLICY IF EXISTS "Students can view their own data" ON public.students;
DROP POLICY IF EXISTS "Students can update their own data" ON public.students;

-- Create proper RLS policies for students table
CREATE POLICY "Students can view own profile only"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Students can update own profile only"
  ON public.students
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Secure feedback table - remove anonymous access
DROP POLICY IF EXISTS "Authenticated users can insert feedback" ON public.feedback;
CREATE POLICY "Students can insert feedback for their submissions"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() OR
    (student_id IS NULL AND EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = auth.uid()
    ))
  );

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
    ) OR
    student_id = auth.uid() OR
    public.check_platform_admin_access()
  );

-- Secure class schedules
CREATE POLICY "Students can view classes for their school and grade only"
  ON public.class_schedules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = auth.uid()
      AND s.school = class_schedules.school
      AND s.grade = class_schedules.grade
    ) OR
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid()
      AND t.school = class_schedules.school
    ) OR
    public.check_platform_admin_access()
  );

-- Secure mental health alerts - restrict to authorized personnel only
DROP POLICY IF EXISTS "Only doctors and admins can view mental health alerts" ON public.mental_health_alerts;
CREATE POLICY "Authorized personnel can view mental health alerts"
  ON public.mental_health_alerts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid()
      AND (t.role = 'doctor' OR t.role = 'admin')
      AND t.school = mental_health_alerts.school
    ) OR
    public.check_platform_admin_access()
  );

CREATE POLICY "Authorized personnel can update mental health alerts"
  ON public.mental_health_alerts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid()
      AND (t.role = 'doctor' OR t.role = 'admin')
      AND t.school = mental_health_alerts.school
    ) OR
    public.check_platform_admin_access()
  );

-- Secure weekly summaries
CREATE POLICY "Students can insert their own weekly summaries"
  ON public.weekly_summaries
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can view their own weekly summaries"
  ON public.weekly_summaries
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid()
      AND t.school = weekly_summaries.school
    ) OR
    public.check_platform_admin_access()
  );

-- Secure live chat sessions
CREATE POLICY "Students can view their own chat sessions"
  ON public.live_chat_sessions
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid()
      AND (t.role = 'doctor' OR t.role = 'admin')
      AND t.school = live_chat_sessions.school
    ) OR
    public.check_platform_admin_access()
  );

-- Secure chat messages
CREATE POLICY "Participants can view chat messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.live_chat_sessions lcs
      WHERE lcs.id = chat_messages.session_id
      AND (lcs.student_id = auth.uid() OR lcs.doctor_id = auth.uid())
    )
  );

-- Create enhanced security logging function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id UUID,
  details TEXT,
  severity TEXT DEFAULT 'info'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    new_data,
    timestamp
  ) VALUES (
    'security_events',
    event_type,
    user_id,
    jsonb_build_object(
      'details', details,
      'severity', severity,
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::json->>'user-agent'
    ),
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate session context
CREATE OR REPLACE FUNCTION public.validate_session_context()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has valid authenticated session
  IF auth.uid() IS NULL THEN
    PERFORM public.log_security_event(
      'unauthorized_access',
      NULL,
      'Attempted access without authentication',
      'warning'
    );
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add constraints to prevent data injection
ALTER TABLE public.students 
  ADD CONSTRAINT students_name_length CHECK (length(full_name) BETWEEN 2 AND 100),
  ADD CONSTRAINT students_school_length CHECK (length(school) BETWEEN 2 AND 100),
  ADD CONSTRAINT students_grade_format CHECK (grade ~ '^[0-9]{1,2}$|^K$');

ALTER TABLE public.teachers
  ADD CONSTRAINT teachers_name_length CHECK (length(name) BETWEEN 2 AND 100),
  ADD CONSTRAINT teachers_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT teachers_school_length CHECK (length(school) BETWEEN 2 AND 100);

-- Grant necessary permissions while maintaining security
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_session_context TO authenticated;

-- Revoke dangerous permissions from anon role
REVOKE ALL ON public.students FROM anon;
REVOKE ALL ON public.teachers FROM anon;
REVOKE ALL ON public.mental_health_alerts FROM anon;
REVOKE ALL ON public.weekly_summaries FROM anon;
REVOKE ALL ON public.live_chat_sessions FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;

-- Only allow specific operations for authenticated users
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.teachers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.class_schedules TO authenticated;
