
-- Phase 1: Emergency Database Security Fixes (Corrected)
-- Remove dangerous anonymous access and secure sensitive data

-- 1. Secure Mental Health Data - Restrict to doctors/admins only
DROP POLICY IF EXISTS "Allow read access for mental health alerts" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.mental_health_alerts;

CREATE POLICY "Doctors and admins can view mental health alerts in same school"
ON public.mental_health_alerts
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = mental_health_alerts.school
    AND t.role IN ('doctor', 'admin')
  )
);

CREATE POLICY "Doctors and admins can insert mental health alerts"
ON public.mental_health_alerts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = school
    AND t.role IN ('doctor', 'admin')
  )
);

-- 2. Secure Chat System - Remove public access (CORRECTED)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.chat_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.chat_messages;

CREATE POLICY "Users can view messages in their school sessions"
ON public.chat_messages
FOR SELECT
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
);

CREATE POLICY "Authenticated users can send messages in their sessions"
ON public.chat_messages
FOR INSERT
TO authenticated
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

-- 3. Secure Live Chat Sessions (CORRECTED)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.live_chat_sessions;

CREATE POLICY "Users can view their own chat sessions"
ON public.live_chat_sessions
FOR SELECT
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
);

-- 4. Secure Students Table - School-based isolation
DROP POLICY IF EXISTS "Enable read access for all users" ON public.students;
DROP POLICY IF EXISTS "Allow authenticated users to view students" ON public.students;

CREATE POLICY "Teachers can view students in same school"
ON public.students
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = students.school
  )
);

-- 5. Secure Teachers Table - Remove anonymous access
DROP POLICY IF EXISTS "Allow platform admin access" ON public.teachers;
DROP POLICY IF EXISTS "Allow admin authentication" ON public.teachers;

CREATE POLICY "Teachers can view themselves and colleagues in same school"
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

-- 6. Add comprehensive audit logging for sensitive data access
CREATE OR REPLACE FUNCTION public.audit_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    new_data,
    old_data
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_mental_health_alerts ON public.mental_health_alerts;
CREATE TRIGGER audit_mental_health_alerts
  AFTER INSERT OR UPDATE OR DELETE ON public.mental_health_alerts
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

DROP TRIGGER IF EXISTS audit_chat_messages ON public.chat_messages;
CREATE TRIGGER audit_chat_messages
  AFTER INSERT OR UPDATE OR DELETE ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_access();

-- 7. Create security monitoring function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  user_id UUID DEFAULT NULL,
  details TEXT DEFAULT '',
  severity TEXT DEFAULT 'medium'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    new_data
  ) VALUES (
    'security_events',
    event_type,
    COALESCE(user_id, auth.uid()),
    jsonb_build_object(
      'details', details,
      'severity', severity,
      'timestamp', now(),
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
