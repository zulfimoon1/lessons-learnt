
-- Fix search_path security warnings for all database functions

-- Update encrypt_sensitive_data function
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(content text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simple obfuscation for sensitive content (replace with proper encryption in production)
  RETURN encode(convert_to(content, 'UTF8'), 'base64');
END;
$$;

-- Update decrypt_sensitive_data function
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_content text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Simple deobfuscation (replace with proper decryption in production)
  RETURN convert_from(decode(encrypted_content, 'base64'), 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    RETURN encrypted_content; -- Return as-is if decryption fails
END;
$$;

-- Update audit_sensitive_access function
CREATE OR REPLACE FUNCTION public.audit_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update log_sensitive_access function
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update audit_mental_health_access function
CREATE OR REPLACE FUNCTION public.audit_mental_health_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all access to mental health data with enhanced details
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
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN 
      jsonb_build_object(
        'timestamp', now(),
        'user_agent', current_setting('request.headers', true)::jsonb->>'user-agent',
        'severity', 'mental_health_access',
        'patient_id', COALESCE(NEW.student_id, OLD.student_id),
        'content_encrypted', true
      )
    ELSE NULL END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(operation_type text, max_attempts integer DEFAULT 10)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update validate_admin_operation function
CREATE OR REPLACE FUNCTION public.validate_admin_operation(operation_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Update log_critical_security_event function
CREATE OR REPLACE FUNCTION public.log_critical_security_event(event_type text, user_id uuid, details text, severity text DEFAULT 'medium'::text)
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
$$;
