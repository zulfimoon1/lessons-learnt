
-- Phase 1: Critical RLS Policy Consolidation and Security Hardening
-- This migration removes conflicting policies and implements secure, school-based data isolation

-- 1. Drop all existing conflicting RLS policies to start fresh
DROP POLICY IF EXISTS "Allow read access for mental health alerts" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Doctors and admins can view mental health alerts in same school" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Doctors and admins can insert mental health alerts" ON public.mental_health_alerts;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.chat_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages in their school sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages in their sessions" ON public.chat_messages;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.live_chat_sessions;
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.live_chat_sessions;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;
DROP POLICY IF EXISTS "Allow authenticated users to view students" ON public.students;
DROP POLICY IF EXISTS "Teachers can view students in same school" ON public.students;

DROP POLICY IF EXISTS "Allow platform admin access" ON public.teachers;
DROP POLICY IF EXISTS "Allow admin authentication" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can view themselves and colleagues in same school" ON public.teachers;

-- 2. Create consolidated, secure RLS policies

-- Mental Health Alerts - HIPAA-level protection
CREATE POLICY "mental_health_alerts_doctors_only"
ON public.mental_health_alerts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = mental_health_alerts.school
    AND t.role IN ('doctor', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = school
    AND t.role IN ('doctor', 'admin')
  )
);

-- Chat Messages - Session-based access only
CREATE POLICY "chat_messages_session_participants"
ON public.chat_messages
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.live_chat_sessions lcs
    WHERE lcs.id = chat_messages.session_id
    AND (
      lcs.student_id = auth.uid() OR
      lcs.doctor_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.teachers t
        WHERE t.id = auth.uid()
        AND t.school = lcs.school
        AND t.role IN ('admin', 'doctor')
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.live_chat_sessions lcs
    WHERE lcs.id = session_id
    AND (
      lcs.student_id = auth.uid() OR
      lcs.doctor_id = auth.uid()
    )
  )
);

-- Live Chat Sessions - Participants and school admins only
CREATE POLICY "chat_sessions_participants_and_admins"
ON public.live_chat_sessions
FOR ALL
TO authenticated
USING (
  student_id = auth.uid() OR
  doctor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = live_chat_sessions.school
    AND t.role IN ('admin', 'doctor')
  )
)
WITH CHECK (
  student_id = auth.uid() OR
  doctor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = school
    AND t.role IN ('admin', 'doctor')
  )
);

-- Students - School-based isolation with self-access
CREATE POLICY "students_school_isolation"
ON public.students
FOR ALL
TO authenticated
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = students.school
  )
)
WITH CHECK (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = school
  )
);

-- Teachers - School-based isolation with self-access
CREATE POLICY "teachers_school_isolation"
ON public.teachers
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = teachers.school
  )
);

-- Teachers can only update themselves
CREATE POLICY "teachers_self_update"
ON public.teachers
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Only admins can insert new teachers
CREATE POLICY "teachers_admin_insert"
ON public.teachers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.role = 'admin'
    AND t.school = school
  )
);

-- Class Schedules - School-based access
CREATE POLICY "class_schedules_school_access"
ON public.class_schedules
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = class_schedules.school
  )
)
WITH CHECK (
  teacher_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = school
  )
);

-- Feedback - Students can view/create their own, teachers can view for their school
CREATE POLICY "feedback_school_access"
ON public.feedback
FOR ALL
TO authenticated
USING (
  student_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.class_schedules cs
    JOIN public.teachers t ON t.id = auth.uid()
    WHERE cs.id = feedback.class_schedule_id
    AND t.school = cs.school
  )
)
WITH CHECK (
  student_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.class_schedules cs
    JOIN public.teachers t ON t.id = auth.uid()
    WHERE cs.id = class_schedule_id
    AND t.school = cs.school
  )
);

-- Weekly Summaries - School-based access
CREATE POLICY "weekly_summaries_school_access"
ON public.weekly_summaries
FOR ALL
TO authenticated
USING (
  student_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = weekly_summaries.school
  )
)
WITH CHECK (
  student_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = school
  )
);

-- Mental Health Articles - School-based access
CREATE POLICY "mental_health_articles_school_access"
ON public.mental_health_articles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = mental_health_articles.school
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = school
    AND t.role IN ('doctor', 'admin')
  )
);

-- School Psychologists - School-based access
CREATE POLICY "school_psychologists_school_access"
ON public.school_psychologists
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = school_psychologists.school
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = school
    AND t.role IN ('admin')
  )
);

-- 3. Create enhanced security monitoring function
CREATE OR REPLACE FUNCTION public.enhanced_security_check()
RETURNS TABLE(
  security_score integer,
  violations text[],
  recommendations text[]
) AS $$
DECLARE
  score integer := 100;
  violations text[] := ARRAY[]::text[];
  recommendations text[] := ARRAY[]::text[];
  recent_violations integer;
BEGIN
  -- Check for recent security violations
  SELECT COUNT(*) INTO recent_violations
  FROM public.audit_log
  WHERE table_name = 'security_events'
    AND new_data->>'severity' IN ('high', 'medium')
    AND timestamp > now() - interval '1 hour';
  
  IF recent_violations > 10 THEN
    score := score - 30;
    violations := violations || 'High frequency of security violations detected';
    recommendations := recommendations || 'Review recent security events and implement additional monitoring';
  END IF;
  
  -- Check for weak password patterns (if any users exist without proper hashing)
  IF EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE length(password_hash) < 50
  ) THEN
    score := score - 20;
    violations := violations || 'Weak password hashing detected';
    recommendations := recommendations || 'Ensure all passwords use bcrypt with proper salt rounds';
  END IF;
  
  RETURN QUERY SELECT score, violations, recommendations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create security event aggregation function
CREATE OR REPLACE FUNCTION public.get_security_dashboard_data()
RETURNS TABLE(
  total_events bigint,
  high_severity_events bigint,
  medium_severity_events bigint,
  low_severity_events bigint,
  recent_violations bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.audit_log WHERE table_name = 'security_events'),
    (SELECT COUNT(*) FROM public.audit_log WHERE table_name = 'security_events' AND new_data->>'severity' = 'high'),
    (SELECT COUNT(*) FROM public.audit_log WHERE table_name = 'security_events' AND new_data->>'severity' = 'medium'),
    (SELECT COUNT(*) FROM public.audit_log WHERE table_name = 'security_events' AND new_data->>'severity' = 'low'),
    (SELECT COUNT(*) FROM public.audit_log WHERE table_name = 'security_events' AND timestamp > now() - interval '1 hour');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
