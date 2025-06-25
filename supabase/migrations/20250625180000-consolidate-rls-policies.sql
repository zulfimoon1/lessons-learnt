
-- Phase 1: Emergency RLS Policy Consolidation
-- Remove all conflicting policies and implement clean, secure school-based access

-- 1. Mental Health Alerts - Remove all existing policies and create single secure policy
DROP POLICY IF EXISTS "Allow read access for mental health alerts" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Doctors and admins can view mental health alerts in same school" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Doctors and admins can insert mental health alerts" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "mental_health_alerts_doctors_only" ON public.mental_health_alerts;

CREATE POLICY "mental_health_alerts_secure_access"
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

-- 2. Chat Messages - Clean consolidation
DROP POLICY IF EXISTS "Enable read access for all users" ON public.chat_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages in their school sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "Authenticated users can send messages in their sessions" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages_session_participants" ON public.chat_messages;

CREATE POLICY "chat_messages_secure_access"
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

-- 3. Live Chat Sessions - Clean consolidation
DROP POLICY IF EXISTS "Enable read access for all users" ON public.live_chat_sessions;
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON public.live_chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_participants_and_admins" ON public.live_chat_sessions;

CREATE POLICY "chat_sessions_secure_access"
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

-- 4. Students - Clean school-based isolation
DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;
DROP POLICY IF EXISTS "Allow authenticated users to view students" ON public.students;
DROP POLICY IF EXISTS "Teachers can view students in same school" ON public.students;
DROP POLICY IF EXISTS "students_school_isolation" ON public.students;
DROP POLICY IF EXISTS "Allow student login verification" ON public.students;
DROP POLICY IF EXISTS "Allow student signup" ON public.students;
DROP POLICY IF EXISTS "Allow student updates" ON public.students;
DROP POLICY IF EXISTS "Students can view their own data" ON public.students;
DROP POLICY IF EXISTS "Students can update their own data" ON public.students;

CREATE POLICY "students_secure_access"
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

-- 5. Teachers - Clean school-based isolation
DROP POLICY IF EXISTS "Allow platform admin access" ON public.teachers;
DROP POLICY IF EXISTS "Allow admin authentication" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can view themselves and colleagues in same school" ON public.teachers;
DROP POLICY IF EXISTS "teachers_school_isolation" ON public.teachers;
DROP POLICY IF EXISTS "teachers_self_update" ON public.teachers;
DROP POLICY IF EXISTS "teachers_admin_insert" ON public.teachers;

CREATE POLICY "teachers_secure_select"
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

CREATE POLICY "teachers_secure_update"
ON public.teachers
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "teachers_secure_insert"
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

-- 6. Add security monitoring for policy violations
CREATE OR REPLACE FUNCTION public.log_policy_violation(
  table_name TEXT,
  operation TEXT,
  details TEXT DEFAULT ''
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    new_data
  ) VALUES (
    'policy_violations',
    operation,
    auth.uid(),
    jsonb_build_object(
      'table', table_name,
      'details', details,
      'severity', 'high',
      'timestamp', now()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
