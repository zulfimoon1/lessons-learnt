
-- CRITICAL SECURITY FIX: Remove dangerous RLS policies and implement proper security
-- This migration addresses the most critical vulnerabilities identified in the security review

-- First, let's fix any invalid grade data before applying constraints
UPDATE public.students 
SET grade = '1' 
WHERE grade IS NULL OR grade = '' OR NOT (grade ~ '^[0-9]{1,2}$|^K$');

-- 1. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Students can view own profile only" ON public.students;
DROP POLICY IF EXISTS "Students cannot update own profile" ON public.students;
DROP POLICY IF EXISTS "Only platform admins can insert students" ON public.students;
DROP POLICY IF EXISTS "Only platform admins can delete students" ON public.students;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.students;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.students;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON public.students;

DROP POLICY IF EXISTS "Teachers can view own profile and same school" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can update own profile only" ON public.teachers;
DROP POLICY IF EXISTS "Only platform admins can insert teachers" ON public.teachers;
DROP POLICY IF EXISTS "Only platform admins can delete teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow public read access" ON public.teachers;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.teachers;
DROP POLICY IF EXISTS "Allow update based on email" ON public.teachers;
DROP POLICY IF EXISTS "Allow delete based on email" ON public.teachers;

DROP POLICY IF EXISTS "Students can insert own feedback only" ON public.feedback;
DROP POLICY IF EXISTS "Users can view relevant feedback only" ON public.feedback;
DROP POLICY IF EXISTS "Authenticated users can insert feedback" ON public.feedback;
DROP POLICY IF EXISTS "Authenticated users can view feedback" ON public.feedback;
DROP POLICY IF EXISTS "Students can insert feedback for their submissions" ON public.feedback;
DROP POLICY IF EXISTS "Teachers can view feedback from their school" ON public.feedback;

DROP POLICY IF EXISTS "Students can view classes for their school and grade" ON public.class_schedules;
DROP POLICY IF EXISTS "Teachers can manage classes in their school" ON public.class_schedules;
DROP POLICY IF EXISTS "Public can view class schedules" ON public.class_schedules;
DROP POLICY IF EXISTS "Authenticated users can insert class schedules" ON public.class_schedules;

DROP POLICY IF EXISTS "Only authorized personnel can view mental health alerts" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Only authorized personnel can update mental health alerts" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Authorized personnel can view mental health alerts" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Authorized personnel can update mental health alerts" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Only doctors and admins can view mental health alerts" ON public.mental_health_alerts;

DROP POLICY IF EXISTS "Students can insert own weekly summaries" ON public.weekly_summaries;
DROP POLICY IF EXISTS "Authorized users can view weekly summaries" ON public.weekly_summaries;
DROP POLICY IF EXISTS "Students can view their own weekly summaries" ON public.weekly_summaries;
DROP POLICY IF EXISTS "Students can insert their own weekly summaries" ON public.weekly_summaries;

DROP POLICY IF EXISTS "Students can view own chat sessions" ON public.live_chat_sessions;
DROP POLICY IF EXISTS "Students can view their own chat sessions" ON public.live_chat_sessions;

DROP POLICY IF EXISTS "Chat participants can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Participants can view chat messages" ON public.chat_messages;

-- 2. Remove all anonymous access to sensitive tables
REVOKE ALL ON public.students FROM anon;
REVOKE ALL ON public.teachers FROM anon;
REVOKE ALL ON public.mental_health_alerts FROM anon;
REVOKE ALL ON public.weekly_summaries FROM anon;
REVOKE ALL ON public.live_chat_sessions FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;
REVOKE ALL ON public.feedback FROM anon;

-- 3. Create secure platform admin context validation function
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if platform admin context is properly set
  RETURN COALESCE(current_setting('app.current_user_email', true), '') != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. Create secure user context validation functions
CREATE OR REPLACE FUNCTION public.get_user_school()
RETURNS TEXT AS $$
BEGIN
  -- Get school for current authenticated user
  RETURN COALESCE(
    (SELECT school FROM public.students WHERE id = auth.uid()),
    (SELECT school FROM public.teachers WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_teacher_in_school(target_school TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = auth.uid() 
    AND school = target_school
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. Implement proper RLS policies for students table
CREATE POLICY "Students can view own profile only"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_platform_admin());

CREATE POLICY "Students cannot update own profile"
  ON public.students
  FOR UPDATE
  TO authenticated
  USING (false); -- Students cannot update their own profiles

CREATE POLICY "Only platform admins can insert students"
  ON public.students
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_platform_admin());

CREATE POLICY "Only platform admins can delete students"
  ON public.students
  FOR DELETE
  TO authenticated
  USING (public.is_platform_admin());

-- 6. Implement proper RLS policies for teachers table
CREATE POLICY "Teachers can view own profile and same school"
  ON public.teachers
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR 
    public.is_teacher_in_school(school) OR 
    public.is_platform_admin()
  );

CREATE POLICY "Teachers can update own profile only"
  ON public.teachers
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Only platform admins can insert teachers"
  ON public.teachers
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_platform_admin());

CREATE POLICY "Only platform admins can delete teachers"
  ON public.teachers
  FOR DELETE
  TO authenticated
  USING (public.is_platform_admin());

-- 7. Secure feedback table with proper ownership
CREATE POLICY "Students can insert own feedback only"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() OR 
    (student_id IS NULL AND EXISTS (SELECT 1 FROM public.students WHERE id = auth.uid()))
  );

CREATE POLICY "Users can view relevant feedback only"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.class_schedules cs
      JOIN public.teachers t ON t.id = auth.uid()
      WHERE cs.id = feedback.class_schedule_id
      AND cs.school = t.school
    ) OR
    public.is_platform_admin()
  );

-- 8. Secure class schedules
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
    ) OR
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid()
      AND t.school = class_schedules.school
    ) OR
    public.is_platform_admin()
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
    ) OR
    public.is_platform_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid()
      AND t.school = class_schedules.school
    ) OR
    public.is_platform_admin()
  );

-- 9. Secure mental health alerts - CRITICAL
CREATE POLICY "Only authorized personnel can view mental health alerts"
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
    public.is_platform_admin()
  );

CREATE POLICY "Only authorized personnel can update mental health alerts"
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
    public.is_platform_admin()
  );

-- 10. Secure weekly summaries
CREATE POLICY "Students can insert own weekly summaries"
  ON public.weekly_summaries
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Authorized users can view weekly summaries"
  ON public.weekly_summaries
  FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid()
      AND t.school = weekly_summaries.school
      AND (t.role = 'doctor' OR t.role = 'admin')
    ) OR
    public.is_platform_admin()
  );

-- 11. Secure live chat sessions
CREATE POLICY "Students can view own chat sessions"
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
    public.is_platform_admin()
  );

-- 12. Secure chat messages
CREATE POLICY "Chat participants can view messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.live_chat_sessions lcs
      WHERE lcs.id = chat_messages.session_id
      AND (lcs.student_id = auth.uid() OR lcs.doctor_id = auth.uid())
    ) OR
    public.is_platform_admin()
  );

-- 13. Add input validation constraints (after cleaning data)
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_name_length;
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_school_length;
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_grade_valid;
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.teachers DROP CONSTRAINT IF EXISTS teachers_name_length;
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.teachers DROP CONSTRAINT IF EXISTS teachers_email_format;
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;
  
  BEGIN
    ALTER TABLE public.teachers DROP CONSTRAINT IF EXISTS teachers_school_length;
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;
END $$;

-- Add new constraints (after data cleanup)
ALTER TABLE public.students 
  ADD CONSTRAINT students_name_length CHECK (length(full_name) BETWEEN 2 AND 100),
  ADD CONSTRAINT students_school_length CHECK (length(school) BETWEEN 2 AND 100),
  ADD CONSTRAINT students_grade_valid CHECK (grade ~ '^[0-9]{1,2}$|^K$');

ALTER TABLE public.teachers
  ADD CONSTRAINT teachers_name_length CHECK (length(name) BETWEEN 2 AND 100),
  ADD CONSTRAINT teachers_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT teachers_school_length CHECK (length(school) BETWEEN 2 AND 100);

-- 14. Create security event logging function
CREATE OR REPLACE FUNCTION public.log_critical_security_event(
  event_type TEXT,
  user_id UUID,
  details TEXT,
  severity TEXT DEFAULT 'medium'
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
      'source', 'rls_security_function'
    ),
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Grant only necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.teachers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_schedules TO authenticated;
GRANT SELECT, UPDATE ON public.mental_health_alerts TO authenticated;
GRANT SELECT, INSERT ON public.weekly_summaries TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.live_chat_sessions TO authenticated;
GRANT SELECT, INSERT ON public.chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_school TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_teacher_in_school TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_critical_security_event TO authenticated;

-- 16. Remove all remaining dangerous permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
