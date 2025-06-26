
-- Fix the remaining database functions with search_path security warnings

-- Update is_verified_platform_admin function
CREATE OR REPLACE FUNCTION public.is_verified_platform_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Multiple verification paths for reliability
  RETURN (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    current_setting('app.platform_admin', true) = 'true' OR
    current_setting('app.admin_verified', true) = 'true' OR
    current_setting('app.admin_context_set', true) = 'true'
  );
END;
$$;

-- Update log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(event_type text, user_id uuid DEFAULT NULL::uuid, details text DEFAULT ''::text, severity text DEFAULT 'medium'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update log_enhanced_security_event function
CREATE OR REPLACE FUNCTION public.log_enhanced_security_event(event_type text, user_id uuid DEFAULT NULL::uuid, details text DEFAULT ''::text, severity text DEFAULT 'medium'::text, ip_address text DEFAULT NULL::text, user_agent text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      'ip_address', ip_address,
      'user_agent', user_agent,
      'session_info', current_setting('request.headers', true)
    )
  );
END;
$$;

-- Update validate_mental_health_access function
CREATE OR REPLACE FUNCTION public.validate_mental_health_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only doctors and admins can access mental health data
  RETURN EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = auth.uid() 
    AND role IN ('doctor', 'admin')
  );
END;
$$;

-- Update log_security_event_safe function
CREATE OR REPLACE FUNCTION public.log_security_event_safe(event_type text, user_id uuid DEFAULT NULL::uuid, details text DEFAULT ''::text, severity text DEFAULT 'medium'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Safe insert that won't fail if audit_log has issues
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
        'user_agent', COALESCE(current_setting('request.headers', true)::jsonb->>'user-agent', 'unknown')
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log to PostgreSQL log if audit table fails
      RAISE NOTICE 'Security event logged: % - % - %', event_type, severity, details;
  END;
END;
$$;

-- Update enhanced_security_check function
CREATE OR REPLACE FUNCTION public.enhanced_security_check()
RETURNS TABLE(security_score integer, violations text[], recommendations text[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update get_security_dashboard_data function
CREATE OR REPLACE FUNCTION public.get_security_dashboard_data()
RETURNS TABLE(total_events bigint, high_severity_events bigint, medium_severity_events bigint, low_severity_events bigint, recent_violations bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.audit_log WHERE table_name = 'security_events'),
    (SELECT COUNT(*) FROM public.audit_log WHERE table_name = 'security_events' AND new_data->>'severity' = 'high'),
    (SELECT COUNT(*) FROM public.audit_log WHERE table_name = 'security_events' AND new_data->>'severity' = 'medium'),
    (SELECT COUNT(*) FROM public.audit_log WHERE table_name = 'security_events' AND new_data->>'severity' = 'low'),
    (SELECT COUNT(*) FROM public.audit_log WHERE table_name = 'security_events' AND timestamp > now() - interval '1 hour');
END;
$$;

-- Update is_zulfimoon_admin function
CREATE OR REPLACE FUNCTION public.is_zulfimoon_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Direct check for the specific admin email without table lookup
  RETURN current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com';
END;
$$;
