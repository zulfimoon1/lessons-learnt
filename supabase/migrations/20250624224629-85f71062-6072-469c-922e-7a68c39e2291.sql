
-- Add the missing is_anonymous column to weekly_summaries table
ALTER TABLE public.weekly_summaries 
ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;

-- Update the trigger function to handle the new column
CREATE OR REPLACE FUNCTION public.scan_weekly_summary_for_mental_health()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
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
$function$;
