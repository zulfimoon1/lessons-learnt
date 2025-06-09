
-- Fix 1: Remove SECURITY DEFINER from feedback_analytics view
DROP VIEW IF EXISTS public.feedback_analytics CASCADE;

-- Recreate the view without SECURITY DEFINER property
CREATE VIEW public.feedback_analytics AS
SELECT 
    cs.school,
    cs.grade,
    cs.subject,
    cs.lesson_topic,
    cs.class_date,
    COUNT(*) as total_responses,
    COUNT(CASE WHEN f.is_anonymous = true THEN 1 END) as anonymous_responses,
    COUNT(CASE WHEN f.is_anonymous = false THEN 1 END) as named_responses,
    AVG(f.understanding::numeric) as avg_understanding,
    AVG(f.interest::numeric) as avg_interest,
    AVG(f.educational_growth::numeric) as avg_growth
FROM public.feedback f
JOIN public.class_schedules cs ON f.class_schedule_id = cs.id
GROUP BY cs.school, cs.grade, cs.subject, cs.lesson_topic, cs.class_date;

-- Grant appropriate permissions
GRANT SELECT ON public.feedback_analytics TO authenticated;
GRANT SELECT ON public.feedback_analytics TO anon;

-- Fix 2-5: Update all functions to have immutable search_path
-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table for students or teachers based on metadata
  IF NEW.raw_user_meta_data->>'user_type' = 'student' THEN
    INSERT INTO public.profiles (
      id, 
      full_name, 
      school, 
      grade, 
      role
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'school',
      NEW.raw_user_meta_data->>'grade',
      'student'
    );
  ELSIF NEW.raw_user_meta_data->>'user_type' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (
      id,
      name,
      email,
      school,
      role,
      specialization
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'name',
      NEW.email,
      NEW.raw_user_meta_data->>'school',
      COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
      NEW.raw_user_meta_data->>'specialization'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix detect_self_harm_language function
CREATE OR REPLACE FUNCTION public.detect_self_harm_language(text_content text)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  severity INTEGER := 0;
  high_risk_keywords TEXT[] := ARRAY['kill myself', 'end my life', 'want to die', 'suicide', 'hurt myself', 'cut myself'];
  medium_risk_keywords TEXT[] := ARRAY['hopeless', 'worthless', 'hate myself', 'better off dead', 'no point living', 'cant go on'];
  low_risk_keywords TEXT[] := ARRAY['depressed', 'sad all the time', 'feel empty', 'dont care anymore', 'tired of everything'];
  keyword TEXT;
  lower_content TEXT;
BEGIN
  lower_content := LOWER(text_content);
  
  -- Check for high-risk keywords (severity 5)
  FOREACH keyword IN ARRAY high_risk_keywords LOOP
    IF lower_content LIKE '%' || keyword || '%' THEN
      RETURN 5;
    END IF;
  END LOOP;
  
  -- Check for medium-risk keywords (severity 3)
  FOREACH keyword IN ARRAY medium_risk_keywords LOOP
    IF lower_content LIKE '%' || keyword || '%' THEN
      severity := GREATEST(severity, 3);
    END IF;
  END LOOP;
  
  -- Check for low-risk keywords (severity 1)
  FOREACH keyword IN ARRAY low_risk_keywords LOOP
    IF lower_content LIKE '%' || keyword || '%' THEN
      severity := GREATEST(severity, 1);
    END IF;
  END LOOP;
  
  RETURN severity;
END;
$$;

-- Fix scan_feedback_for_mental_health function
CREATE OR REPLACE FUNCTION public.scan_feedback_for_mental_health()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  severity INTEGER := 0;
  content_to_check TEXT;
BEGIN
  -- Combine all text fields from feedback
  content_to_check := COALESCE(NEW.what_went_well, '') || ' ' || 
                     COALESCE(NEW.suggestions, '') || ' ' || 
                     COALESCE(NEW.additional_comments, '');
  
  severity := public.detect_self_harm_language(content_to_check);
  
  -- If concerning language detected, create alert
  IF severity > 0 THEN
    INSERT INTO public.mental_health_alerts (
      student_id,
      student_name,
      school,
      grade,
      content,
      source_table,
      source_id,
      severity_level
    )
    SELECT 
      s.id,
      COALESCE(NEW.student_name, s.full_name),
      s.school,
      s.grade,
      content_to_check,
      'feedback',
      NEW.id,
      severity
    FROM public.students s
    WHERE s.id = NEW.student_id
    UNION ALL
    SELECT 
      NULL,
      NEW.student_name,
      cs.school,
      cs.grade,
      content_to_check,
      'feedback',
      NEW.id,
      severity
    FROM public.class_schedules cs
    WHERE cs.id = NEW.class_schedule_id AND NEW.student_id IS NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix scan_weekly_summary_for_mental_health function
CREATE OR REPLACE FUNCTION public.scan_weekly_summary_for_mental_health()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  severity INTEGER := 0;
  content_to_check TEXT;
BEGIN
  -- Combine emotional and academic concerns
  content_to_check := COALESCE(NEW.emotional_concerns, '') || ' ' || 
                     COALESCE(NEW.academic_concerns, '');
  
  severity := public.detect_self_harm_language(content_to_check);
  
  -- If concerning language detected, create alert
  IF severity > 0 THEN
    INSERT INTO public.mental_health_alerts (
      student_id,
      student_name,
      school,
      grade,
      content,
      source_table,
      source_id,
      severity_level
    ) VALUES (
      NEW.student_id,
      NEW.student_name,
      NEW.school,
      NEW.grade,
      content_to_check,
      'weekly_summaries',
      NEW.id,
      severity
    );
  END IF;
  
  RETURN NEW;
END;
$$;
