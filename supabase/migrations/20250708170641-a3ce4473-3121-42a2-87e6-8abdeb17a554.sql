-- Create student wellness table for tracking mood and wellness check-ins
CREATE TABLE public.student_wellness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('great', 'good', 'okay', 'poor', 'terrible')),
  notes TEXT,
  audio_url TEXT,
  transcription TEXT,
  audio_duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_wellness ENABLE ROW LEVEL SECURITY;

-- Students can create their own wellness entries
CREATE POLICY "Students can create their own wellness entries"
ON public.student_wellness
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = student_wellness.student_id
    AND s.school = student_wellness.school
  )
);

-- Students can view their own wellness entries
CREATE POLICY "Students can view their own wellness entries"
ON public.student_wellness
FOR SELECT
USING (student_id = auth.uid());

-- Doctors and admins can view wellness entries for their school
CREATE POLICY "Doctors and admins can view wellness entries for their school"
ON public.student_wellness
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid()
    AND t.school = student_wellness.school
    AND t.role IN ('doctor', 'admin')
  )
);

-- Platform admin can view all wellness entries
CREATE POLICY "Platform admin can view all wellness entries"
ON public.student_wellness
FOR ALL
USING (is_verified_platform_admin())
WITH CHECK (is_verified_platform_admin());

-- System can create wellness entries
CREATE POLICY "System can create wellness entries"
ON public.student_wellness
FOR INSERT
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_student_wellness_updated_at
BEFORE UPDATE ON public.student_wellness
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger to scan wellness entries for mental health concerns
CREATE OR REPLACE FUNCTION public.scan_wellness_for_mental_health()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
  severity INTEGER := 0;
  content_to_check TEXT;
BEGIN
  -- Check mood and notes for concerning content
  content_to_check := COALESCE(NEW.notes, '');
  
  -- Assign base severity based on mood
  CASE NEW.mood
    WHEN 'terrible' THEN severity := 5;
    WHEN 'poor' THEN severity := 3;
    WHEN 'okay' THEN severity := 1;
    ELSE severity := 0;
  END CASE;
  
  -- Check for concerning language in notes
  IF content_to_check != '' THEN
    severity := GREATEST(severity, public.detect_self_harm_language(content_to_check));
  END IF;
  
  -- Create alert if severity is concerning
  IF severity >= 3 THEN
    INSERT INTO public.mental_health_alerts (
      student_id,
      student_name,
      school,
      grade,
      content,
      source_table,
      source_id,
      severity_level,
      alert_type
    ) VALUES (
      NEW.student_id,
      NEW.student_name,
      NEW.school,
      NEW.grade,
      format('Mood: %s. %s', NEW.mood, COALESCE(NEW.notes, 'No additional notes.')),
      'student_wellness',
      NEW.id,
      severity,
      'wellness_concern'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for wellness mental health scanning
CREATE TRIGGER scan_wellness_mental_health
AFTER INSERT ON public.student_wellness
FOR EACH ROW
EXECUTE FUNCTION public.scan_wellness_for_mental_health();