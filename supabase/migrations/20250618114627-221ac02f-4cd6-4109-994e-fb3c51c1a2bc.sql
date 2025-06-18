
-- Phase 1: Critical RLS Policy Implementation
-- Fix mental health alerts access - only doctors and admins can access
ALTER TABLE public.mental_health_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only doctors and admins can access mental health alerts"
  ON public.mental_health_alerts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() 
      AND role IN ('doctor', 'admin')
      AND school = mental_health_alerts.school
    ) OR
    public.is_zulfimoon_admin()
  );

-- Fix class schedules - school-based access only
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School-based access to class schedules"
  ON public.class_schedules
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND school = class_schedules.school
    ) OR
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = auth.uid() AND school = class_schedules.school
    )
  );

-- Fix feedback table - school-based access with enhanced security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School-based feedback access"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.class_schedules cs
      JOIN public.teachers t ON t.school = cs.school
      WHERE cs.id = feedback.class_schedule_id 
      AND t.id = auth.uid()
    ) OR
    (feedback.student_id = auth.uid())
  );

CREATE POLICY "Students can insert their own feedback"
  ON public.feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.class_schedules cs
      JOIN public.students s ON s.school = cs.school
      WHERE cs.id = feedback.class_schedule_id 
      AND s.id = auth.uid()
    )
  );

-- Fix weekly summaries - school-based access
ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School-based weekly summaries access"
  ON public.weekly_summaries
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND school = weekly_summaries.school
    )
  );

-- Secure audit log access - restrict to platform admins only
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admin audit log access"
  ON public.audit_log
  FOR ALL
  TO authenticated
  USING (public.is_zulfimoon_admin());

-- Enhanced security logging function with better error handling
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  event_type text,
  user_id uuid DEFAULT NULL,
  details text DEFAULT '',
  severity text DEFAULT 'medium',
  metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    INSERT INTO public.audit_log (
      table_name,
      operation,
      user_id,
      new_data
    ) VALUES (
      'security_events_enhanced',
      event_type,
      COALESCE(user_id, auth.uid()),
      jsonb_build_object(
        'details', details,
        'severity', severity,
        'timestamp', now(),
        'user_agent', COALESCE(current_setting('request.headers', true)::jsonb->>'user-agent', 'unknown'),
        'ip_address', COALESCE(current_setting('request.headers', true)::jsonb->>'x-forwarded-for', 'unknown'),
        'metadata', metadata
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Fallback logging that won't fail
      RAISE NOTICE 'Security event: % - % - % - %', event_type, severity, details, SQLSTATE;
  END;
END;
$$;

-- Add triggers for sensitive table access monitoring
CREATE OR REPLACE FUNCTION public.audit_sensitive_table_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log access to mental health data
  IF TG_TABLE_NAME = 'mental_health_alerts' THEN
    PERFORM public.log_security_event_enhanced(
      'mental_health_access',
      auth.uid(),
      format('Access to mental health alert ID: %s', COALESCE(NEW.id::text, OLD.id::text)),
      'medium',
      jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit trigger to mental health alerts
DROP TRIGGER IF EXISTS audit_mental_health_access ON public.mental_health_alerts;
CREATE TRIGGER audit_mental_health_access
  AFTER INSERT OR UPDATE OR DELETE ON public.mental_health_alerts
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_table_access();
