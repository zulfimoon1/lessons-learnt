
-- Fix the final 9 database functions with search_path security warnings

-- Update log_security_event_enhanced function
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(event_type text, user_id uuid DEFAULT NULL::uuid, details text DEFAULT ''::text, severity text DEFAULT 'medium'::text, metadata jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update audit_sensitive_table_access function
CREATE OR REPLACE FUNCTION public.audit_sensitive_table_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Update teacher_reset_student_password function
CREATE OR REPLACE FUNCTION public.teacher_reset_student_password(student_name_param text, student_school_param text, student_grade_param text, teacher_id_param uuid)
RETURNS TABLE(success boolean, temporary_password text, message text, student_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_student RECORD;
  temp_password TEXT;
  password_hash TEXT;
BEGIN
  -- Verify teacher exists and get their school
  IF NOT EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = teacher_id_param 
    AND school = student_school_param
  ) THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'Unauthorized: Teacher not found in this school'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Find the student
  SELECT s.id, s.full_name, s.school, s.grade, s.password_hash
  INTO found_student
  FROM public.students s
  WHERE s.full_name = student_name_param 
    AND s.school = student_school_param 
    AND s.grade = student_grade_param
  LIMIT 1;

  IF found_student.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'Student not found'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Generate temporary password
  temp_password := generate_temporary_password();
  
  -- Hash the temporary password (simple hash for demo)
  password_hash := encode(digest(temp_password || 'simple_salt_2024', 'sha256'), 'hex');

  -- Update student password and set flag
  UPDATE public.students 
  SET password_hash = password_hash,
      needs_password_change = true
  WHERE id = found_student.id;

  -- Create password reset token record
  INSERT INTO public.password_reset_tokens (
    student_id, teacher_id, temporary_password, expires_at
  ) VALUES (
    found_student.id, teacher_id_param, temp_password, now() + interval '48 hours'
  );

  -- Log the activity
  INSERT INTO public.audit_log (
    table_name, operation, user_id, new_data
  ) VALUES (
    'password_reset', 'teacher_reset', teacher_id_param,
    jsonb_build_object(
      'student_id', found_student.id,
      'student_name', student_name_param,
      'reset_by_teacher', teacher_id_param,
      'timestamp', now()
    )
  );

  RETURN QUERY SELECT true, temp_password, 'Password reset successfully'::TEXT, found_student.id;
END;
$$;

-- Update student_change_password_after_reset function
CREATE OR REPLACE FUNCTION public.student_change_password_after_reset(student_id_param uuid, new_password text)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  password_hash TEXT;
BEGIN
  -- Verify student needs password change
  IF NOT EXISTS (
    SELECT 1 FROM public.students 
    WHERE id = student_id_param 
    AND needs_password_change = true
  ) THEN
    RETURN QUERY SELECT false, 'No password change required'::TEXT;
    RETURN;
  END IF;

  -- Hash the new password
  password_hash := encode(digest(new_password || 'simple_salt_2024', 'sha256'), 'hex');

  -- Update student password and clear flag
  UPDATE public.students 
  SET password_hash = password_hash,
      needs_password_change = false
  WHERE id = student_id_param;

  -- Mark all password reset tokens as used
  UPDATE public.password_reset_tokens 
  SET is_used = true, used_at = now()
  WHERE student_id = student_id_param 
  AND is_used = false;

  RETURN QUERY SELECT true, 'Password changed successfully'::TEXT;
END;
$$;

-- Update validate_student_password function
CREATE OR REPLACE FUNCTION public.validate_student_password(password_text text, student_grade_level integer DEFAULT 6)
RETURNS json
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  result JSON;
  score INTEGER := 0;
  feedback TEXT[] := ARRAY[]::TEXT[];
  min_length INTEGER;
  is_valid BOOLEAN := false;
BEGIN
  -- Set minimum length based on grade level
  min_length := CASE 
    WHEN student_grade_level <= 3 THEN 4   -- K-3: 4 characters
    WHEN student_grade_level <= 6 THEN 6   -- 4-6: 6 characters
    WHEN student_grade_level <= 9 THEN 7   -- 7-9: 7 characters
    ELSE 8                                 -- 10-12: 8 characters
  END;

  -- Check length
  IF length(password_text) >= min_length THEN
    score := score + 2;
  ELSE
    feedback := array_append(feedback, format('Password should be at least %s characters long', min_length));
  END IF;

  -- Encourage (don't require) variety for older students
  IF student_grade_level >= 7 THEN
    IF password_text ~ '[A-Z]' THEN score := score + 1; END IF;
    IF password_text ~ '[a-z]' THEN score := score + 1; END IF;
    IF password_text ~ '[0-9]' THEN score := score + 1; END IF;
    
    -- Gentle suggestions for improvement
    IF NOT (password_text ~ '[A-Z]') AND NOT (password_text ~ '[a-z]') THEN
      feedback := array_append(feedback, 'Try adding some letters');
    END IF;
    IF NOT (password_text ~ '[0-9]') THEN
      feedback := array_append(feedback, 'Numbers can make your password stronger');
    END IF;
  ELSE
    -- For younger students, just check basic requirements
    IF password_text ~ '[a-zA-Z]' THEN score := score + 1; END IF;
  END IF;

  -- Check for common weak patterns (but be gentle)
  IF password_text IN ('password', '123456', 'qwerty', 'abc123') THEN
    feedback := array_append(feedback, 'Try to avoid very common passwords');
    score := score - 1;
  END IF;

  -- Determine if valid (lower threshold for younger students)
  is_valid := CASE 
    WHEN student_grade_level <= 6 AND score >= 2 THEN true
    WHEN student_grade_level <= 9 AND score >= 3 THEN true
    WHEN score >= 4 THEN true
    ELSE false
  END;

  result := json_build_object(
    'is_valid', is_valid,
    'score', score,
    'feedback', feedback,
    'grade_level', student_grade_level,
    'min_length', min_length
  );

  RETURN result;
END;
$$;

-- Update teacher_reset_student_password_enhanced function
CREATE OR REPLACE FUNCTION public.teacher_reset_student_password_enhanced(student_name_param text, student_school_param text, student_grade_param text, teacher_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_record RECORD;
  temp_password TEXT;
  result JSON;
  password_hash TEXT;
BEGIN
  -- Verify teacher permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = teacher_id_param 
    AND school = student_school_param
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Teacher not authorized for this school'
    );
  END IF;

  -- Find the student
  SELECT * INTO student_record
  FROM public.students
  WHERE TRIM(LOWER(full_name)) = TRIM(LOWER(student_name_param))
    AND TRIM(LOWER(school)) = TRIM(LOWER(student_school_param))
    AND TRIM(LOWER(grade)) = TRIM(LOWER(student_grade_param));

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Student not found with the provided details'
    );
  END IF;

  -- Generate age-appropriate temporary password
  temp_password := CASE 
    WHEN student_record.grade_level <= 3 THEN 
      'temp' || floor(random() * 100)::TEXT
    WHEN student_record.grade_level <= 6 THEN 
      'student' || floor(random() * 1000)::TEXT
    ELSE 
      'reset' || floor(random() * 10000)::TEXT
  END;

  -- Hash the temporary password
  password_hash := encode(digest(temp_password || 'simple_salt_2024', 'sha256'), 'hex');

  -- Update student record
  UPDATE public.students 
  SET 
    password_hash = password_hash,
    needs_password_change = true,
    last_password_change = now()
  WHERE id = student_record.id;

  -- Log the password reset
  INSERT INTO public.student_login_activity (
    student_id, 
    school, 
    grade, 
    success, 
    user_agent
  ) VALUES (
    student_record.id,
    student_record.school,
    student_record.grade,
    true,
    'Teacher Password Reset'
  );

  RETURN json_build_object(
    'success', true,
    'temporary_password', temp_password,
    'student_id', student_record.id,
    'message', 'Password reset successfully. Student must change password on next login.',
    'expires_in_hours', 48
  );
END;
$$;

-- Update is_platform_admin_context function
CREATE OR REPLACE FUNCTION public.is_platform_admin_context()
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

-- Update is_platform_admin_access function
CREATE OR REPLACE FUNCTION public.is_platform_admin_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Always allow access if the admin email is set in context
  RETURN current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
    OR current_setting('app.platform_admin', true) = 'true';
END;
$$;
