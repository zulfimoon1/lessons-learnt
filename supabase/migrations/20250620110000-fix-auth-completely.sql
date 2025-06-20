
-- Drop existing problematic functions
DROP FUNCTION IF EXISTS public.authenticate_teacher(text, text);
DROP FUNCTION IF EXISTS public.authenticate_student(text, text, text, text);

-- Create a comprehensive teacher authentication function that does everything server-side
CREATE OR REPLACE FUNCTION public.authenticate_teacher_complete(
  email_param text, 
  password_param text
)
RETURNS TABLE(
  success boolean,
  teacher_id uuid,
  teacher_name text,
  teacher_email text,
  teacher_school text,
  teacher_role text,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  teacher_record RECORD;
  password_valid boolean := false;
BEGIN
  -- Direct query without RLS interference
  SELECT t.id, t.name, t.email, t.school, t.role, t.password_hash
  INTO teacher_record
  FROM public.teachers t
  WHERE t.email = email_param
  LIMIT 1;
  
  -- Check if teacher exists
  IF teacher_record.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, NULL::text, NULL::text, NULL::text, 'Invalid email or password'::text;
    RETURN;
  END IF;
  
  -- Verify password (this function runs with elevated privileges)
  SELECT (teacher_record.password_hash IS NOT NULL AND 
          crypt(password_param, teacher_record.password_hash) = teacher_record.password_hash) 
  INTO password_valid;
  
  -- Return results
  IF password_valid THEN
    RETURN QUERY SELECT 
      true,
      teacher_record.id,
      teacher_record.name,
      teacher_record.email,
      teacher_record.school,
      teacher_record.role,
      NULL::text;
  ELSE
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, NULL::text, NULL::text, NULL::text, 'Invalid email or password'::text;
  END IF;
END;
$$;

-- Create a comprehensive student authentication function
CREATE OR REPLACE FUNCTION public.authenticate_student_complete(
  name_param text,
  school_param text, 
  grade_param text,
  password_param text
)
RETURNS TABLE(
  success boolean,
  student_id uuid,
  student_name text,
  student_school text,
  student_grade text,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_record RECORD;
  password_valid boolean := false;
BEGIN
  -- Direct query without RLS interference
  SELECT s.id, s.full_name, s.school, s.grade, s.password_hash
  INTO student_record
  FROM public.students s
  WHERE s.full_name = name_param 
    AND s.school = school_param 
    AND s.grade = grade_param
  LIMIT 1;
  
  -- Check if student exists
  IF student_record.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, NULL::text, NULL::text, 'Invalid credentials'::text;
    RETURN;
  END IF;
  
  -- Verify password
  SELECT (student_record.password_hash IS NOT NULL AND 
          crypt(password_param, student_record.password_hash) = student_record.password_hash) 
  INTO password_valid;
  
  -- Return results
  IF password_valid THEN
    RETURN QUERY SELECT 
      true,
      student_record.id,
      student_record.full_name,
      student_record.school,
      student_record.grade,
      NULL::text;
  ELSE
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, NULL::text, NULL::text, 'Invalid credentials'::text;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.authenticate_teacher_complete(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_student_complete(text, text, text, text) TO anon, authenticated;
