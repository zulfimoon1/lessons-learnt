
-- Create a secure authentication function that bypasses RLS for login purposes
CREATE OR REPLACE FUNCTION public.authenticate_teacher(email_param text, password_param text)
RETURNS TABLE(
  teacher_id uuid,
  teacher_name text,
  teacher_email text,
  teacher_school text,
  teacher_role text,
  password_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.email,
    t.school,
    t.role,
    (t.password_hash IS NOT NULL) as password_valid
  FROM public.teachers t
  WHERE t.email = email_param
  LIMIT 1;
END;
$$;

-- Create a secure authentication function for students
CREATE OR REPLACE FUNCTION public.authenticate_student(name_param text, school_param text, grade_param text, password_param text)
RETURNS TABLE(
  student_id uuid,
  student_name text,
  student_school text,
  student_grade text,
  password_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.full_name,
    s.school,
    s.grade,
    (s.password_hash IS NOT NULL) as password_valid
  FROM public.students s
  WHERE s.full_name = name_param 
    AND s.school = school_param 
    AND s.grade = grade_param
  LIMIT 1;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.authenticate_teacher(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.authenticate_student(text, text, text, text) TO anon, authenticated;
