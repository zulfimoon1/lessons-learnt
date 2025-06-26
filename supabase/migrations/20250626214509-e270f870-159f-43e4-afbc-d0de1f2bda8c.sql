
-- Add age-appropriate password policy support
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS grade_level INTEGER,
ADD COLUMN IF NOT EXISTS password_strength_score INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Update grade_level based on existing grade data
UPDATE public.students 
SET grade_level = CASE 
  WHEN grade ILIKE '%kindergarten%' OR grade ILIKE '%k%' THEN 0
  WHEN grade ILIKE '%1%' OR grade ILIKE '%first%' THEN 1
  WHEN grade ILIKE '%2%' OR grade ILIKE '%second%' THEN 2
  WHEN grade ILIKE '%3%' OR grade ILIKE '%third%' THEN 3
  WHEN grade ILIKE '%4%' OR grade ILIKE '%fourth%' THEN 4
  WHEN grade ILIKE '%5%' OR grade ILIKE '%fifth%' THEN 5
  WHEN grade ILIKE '%6%' OR grade ILIKE '%sixth%' THEN 6
  WHEN grade ILIKE '%7%' OR grade ILIKE '%seventh%' THEN 7
  WHEN grade ILIKE '%8%' OR grade ILIKE '%eighth%' THEN 8
  WHEN grade ILIKE '%9%' OR grade ILIKE '%ninth%' THEN 9
  WHEN grade ILIKE '%10%' OR grade ILIKE '%tenth%' THEN 10
  WHEN grade ILIKE '%11%' OR grade ILIKE '%eleventh%' THEN 11
  WHEN grade ILIKE '%12%' OR grade ILIKE '%twelfth%' THEN 12
  ELSE 6 -- Default to grade 6 if can't parse
END
WHERE grade_level IS NULL;

-- Add session timeout tracking
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 30;

-- Set shorter timeouts for younger students
UPDATE public.students 
SET session_timeout_minutes = CASE 
  WHEN grade_level <= 3 THEN 15  -- K-3: 15 minutes
  WHEN grade_level <= 6 THEN 20  -- 4-6: 20 minutes
  WHEN grade_level <= 9 THEN 30  -- 7-9: 30 minutes
  ELSE 45                        -- 10-12: 45 minutes
END;

-- Create student login activity tracking table
CREATE TABLE IF NOT EXISTS public.student_login_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  school TEXT NOT NULL,
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on student login activity
ALTER TABLE public.student_login_activity ENABLE ROW LEVEL SECURITY;

-- Teachers can view login activity for students in their school
CREATE POLICY "Teachers can view student login activity in their school"
ON public.student_login_activity
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t 
    WHERE t.id = auth.uid() 
    AND t.school = student_login_activity.school
  )
);

-- System can insert login activity
CREATE POLICY "System can insert student login activity"
ON public.student_login_activity
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create age-appropriate password validation function
CREATE OR REPLACE FUNCTION public.validate_student_password(
  password_text TEXT,
  student_grade_level INTEGER DEFAULT 6
) RETURNS JSON
LANGUAGE plpgsql
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

-- Enhanced teacher password reset function with better tracking
CREATE OR REPLACE FUNCTION public.teacher_reset_student_password_enhanced(
  student_name_param TEXT,
  student_school_param TEXT,
  student_grade_param TEXT,
  teacher_id_param UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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
