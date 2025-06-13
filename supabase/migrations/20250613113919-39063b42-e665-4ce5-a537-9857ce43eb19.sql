
-- Fix all function search path security warnings by setting explicit search_path

-- Fix set_platform_admin_context function
CREATE OR REPLACE FUNCTION public.set_platform_admin_context(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.current_user_email', admin_email, true);
END;
$$;

-- Fix check_platform_admin_access function
CREATE OR REPLACE FUNCTION public.check_platform_admin_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current setting indicates platform admin access
  RETURN current_setting('app.current_user_email', true) IS NOT NULL
    AND current_setting('app.current_user_email', true) != '';
END;
$$;

-- Fix get_platform_stats function
CREATE OR REPLACE FUNCTION public.get_platform_stats(stat_type text)
RETURNS TABLE(count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs with elevated privileges to bypass RLS for platform admin
  CASE stat_type
    WHEN 'students' THEN
      RETURN QUERY SELECT COUNT(*)::bigint FROM public.students;
    WHEN 'teachers' THEN
      RETURN QUERY SELECT COUNT(*)::bigint FROM public.teachers;
    WHEN 'feedback' THEN
      RETURN QUERY SELECT COUNT(*)::bigint FROM public.feedback;
    ELSE
      RETURN QUERY SELECT 0::bigint;
  END CASE;
END;
$$;

-- Fix is_platform_admin function
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Fix get_user_school function
CREATE OR REPLACE FUNCTION public.get_user_school()
RETURNS TEXT AS $$
BEGIN
  -- Get school for current authenticated user
  RETURN COALESCE(
    (SELECT school FROM public.students WHERE id = auth.uid()),
    (SELECT school FROM public.teachers WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Fix is_teacher_in_school function
CREATE OR REPLACE FUNCTION public.is_teacher_in_school(target_school TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = auth.uid() 
    AND school = target_school
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Fix log_critical_security_event function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
