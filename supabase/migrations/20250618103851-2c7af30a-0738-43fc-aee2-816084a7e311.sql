
-- Fix critical security vulnerabilities in the database (Corrected)

-- 1. Add proper RLS policies for all tables that are missing them
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mental_health_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;

-- 2. Create secure policies for sensitive tables

-- Audit log - only platform admins can view
CREATE POLICY "Platform admin can view audit logs"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (public.is_zulfimoon_admin());

-- Mental health alerts - only doctors and admins
CREATE POLICY "Doctors and admins can manage mental health alerts"
  ON public.mental_health_alerts
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND role IN ('doctor', 'admin')
    )
  );

-- Class schedules - teachers can manage their own school's schedules
CREATE POLICY "Teachers can manage their school schedules"
  ON public.class_schedules
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND school = class_schedules.school
    )
  );

-- Feedback - students can create, teachers can view their school's feedback
CREATE POLICY "Students can create feedback"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view their school feedback"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.teachers t
      JOIN public.class_schedules cs ON t.school = cs.school
      WHERE t.id = auth.uid() AND cs.id = feedback.class_schedule_id
    )
  );

-- Students table - platform admin and teachers from same school
CREATE POLICY "Teachers can manage students from their school"
  ON public.students
  FOR SELECT
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND school = students.school
    )
  );

-- Weekly summaries - secure access
CREATE POLICY "Secure weekly summaries access"
  ON public.weekly_summaries
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND school = weekly_summaries.school AND role IN ('doctor', 'admin')
    )
  );

-- 3. Add security triggers for sensitive operations (CORRECTED - removed SELECT trigger)
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to sensitive data (only for INSERT, UPDATE, DELETE)
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    new_data
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    jsonb_build_object(
      'timestamp', now(),
      'ip_address', current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
      'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
      'security_event', 'sensitive_data_modification'
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply security triggers to sensitive tables (CORRECTED - removed SELECT)
CREATE TRIGGER log_mental_health_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.mental_health_alerts
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

CREATE TRIGGER log_student_data_modifications
  AFTER INSERT OR UPDATE OR DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_access();

-- 4. Add rate limiting for security functions
CREATE OR REPLACE FUNCTION public.check_rate_limit(operation_type text, max_attempts integer DEFAULT 10)
RETURNS BOOLEAN AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- Check recent attempts from this user
  SELECT COUNT(*) INTO attempt_count
  FROM public.audit_log
  WHERE user_id = auth.uid()
    AND new_data->>'security_event' = operation_type
    AND timestamp > now() - interval '1 hour';
  
  RETURN attempt_count < max_attempts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to validate admin operations
CREATE OR REPLACE FUNCTION public.validate_admin_operation(operation_name text)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is platform admin
  IF NOT public.is_zulfimoon_admin() THEN
    -- Log unauthorized attempt
    INSERT INTO public.audit_log (
      table_name,
      operation,
      user_id,
      new_data
    ) VALUES (
      'security_violations',
      'unauthorized_admin_attempt',
      auth.uid(),
      jsonb_build_object(
        'operation', operation_name,
        'timestamp', now(),
        'severity', 'high'
      )
    );
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
