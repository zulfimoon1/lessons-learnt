
-- Create password reset tokens table
CREATE TABLE public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  temporary_password TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64url'),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '48 hours'),
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for password reset tokens
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Teachers can only see tokens they created for students in their school
CREATE POLICY "Teachers can view their own password reset tokens"
  ON public.password_reset_tokens
  FOR SELECT
  USING (
    teacher_id IN (
      SELECT id FROM public.teachers 
      WHERE id = auth.uid()
    )
  );

-- Teachers can create tokens for students in their school
CREATE POLICY "Teachers can create password reset tokens"
  ON public.password_reset_tokens
  FOR INSERT
  WITH CHECK (
    teacher_id IN (
      SELECT id FROM public.teachers 
      WHERE id = auth.uid()
    )
    AND student_id IN (
      SELECT s.id FROM public.students s
      JOIN public.teachers t ON s.school = t.school
      WHERE t.id = auth.uid()
    )
  );

-- Teachers can update tokens they created
CREATE POLICY "Teachers can update their password reset tokens"
  ON public.password_reset_tokens
  FOR UPDATE
  USING (
    teacher_id IN (
      SELECT id FROM public.teachers 
      WHERE id = auth.uid()
    )
  );

-- Add a flag to students table to track if they need to change password
ALTER TABLE public.students 
ADD COLUMN needs_password_change BOOLEAN DEFAULT false;

-- Create function to generate temporary password
CREATE OR REPLACE FUNCTION generate_temporary_password()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  temp_password TEXT;
  adjectives TEXT[] := ARRAY['quick', 'brave', 'smart', 'kind', 'bright', 'calm', 'bold', 'wise', 'neat', 'cool'];
  nouns TEXT[] := ARRAY['lion', 'eagle', 'tiger', 'bear', 'wolf', 'fox', 'owl', 'hawk', 'star', 'moon'];
  numbers TEXT[] := ARRAY['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
BEGIN
  -- Generate a readable temporary password like "brave-lion-05"
  temp_password := adjectives[floor(random() * array_length(adjectives, 1) + 1)] || 
                   '-' || 
                   nouns[floor(random() * array_length(nouns, 1) + 1)] || 
                   '-' || 
                   numbers[floor(random() * array_length(numbers, 1) + 1)];
  
  RETURN temp_password;
END;
$$;

-- Create function for teachers to reset student passwords
CREATE OR REPLACE FUNCTION teacher_reset_student_password(
  student_name_param TEXT,
  student_school_param TEXT,
  student_grade_param TEXT,
  teacher_id_param UUID
)
RETURNS TABLE(
  success BOOLEAN,
  temporary_password TEXT,
  message TEXT,
  student_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to handle student password change after temporary login
CREATE OR REPLACE FUNCTION student_change_password_after_reset(
  student_id_param UUID,
  new_password TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
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
