
-- Create a secure function for platform admin school deletion that bypasses RLS
CREATE OR REPLACE FUNCTION public.platform_admin_delete_school(
  school_name_param text,
  admin_email_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_counts json;
  feedback_count bigint := 0;
  alerts_count bigint := 0;
  summaries_count bigint := 0;
  schedules_count bigint := 0;
  students_count bigint := 0;
  psychologists_count bigint := 0;
  articles_count bigint := 0;
  teachers_count bigint := 0;
BEGIN
  -- Verify admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE email = admin_email_param 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Not a platform admin';
  END IF;

  -- Delete feedback for this school (via class schedules and students)
  WITH school_schedules AS (
    SELECT id FROM public.class_schedules WHERE school = school_name_param
  ),
  school_students AS (
    SELECT id FROM public.students WHERE school = school_name_param
  )
  DELETE FROM public.feedback 
  WHERE class_schedule_id IN (SELECT id FROM school_schedules)
     OR student_id IN (SELECT id FROM school_students);
  
  GET DIAGNOSTICS feedback_count = ROW_COUNT;

  -- Delete mental health alerts
  DELETE FROM public.mental_health_alerts WHERE school = school_name_param;
  GET DIAGNOSTICS alerts_count = ROW_COUNT;

  -- Delete weekly summaries
  DELETE FROM public.weekly_summaries WHERE school = school_name_param;
  GET DIAGNOSTICS summaries_count = ROW_COUNT;

  -- Delete class schedules
  DELETE FROM public.class_schedules WHERE school = school_name_param;
  GET DIAGNOSTICS schedules_count = ROW_COUNT;

  -- Delete students
  DELETE FROM public.students WHERE school = school_name_param;
  GET DIAGNOSTICS students_count = ROW_COUNT;

  -- Delete school psychologists
  DELETE FROM public.school_psychologists WHERE school = school_name_param;
  GET DIAGNOSTICS psychologists_count = ROW_COUNT;

  -- Delete mental health articles
  DELETE FROM public.mental_health_articles WHERE school = school_name_param;
  GET DIAGNOSTICS articles_count = ROW_COUNT;

  -- Delete teachers (last)
  DELETE FROM public.teachers WHERE school = school_name_param;
  GET DIAGNOSTICS teachers_count = ROW_COUNT;

  -- Return deletion counts
  result_counts := json_build_object(
    'feedback_deleted', feedback_count,
    'alerts_deleted', alerts_count,
    'summaries_deleted', summaries_count,
    'schedules_deleted', schedules_count,
    'students_deleted', students_count,
    'psychologists_deleted', psychologists_count,
    'articles_deleted', articles_count,
    'teachers_deleted', teachers_count,
    'school_name', school_name_param,
    'deleted_by', admin_email_param,
    'deleted_at', now()
  );

  RETURN result_counts;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.platform_admin_delete_school(text, text) TO authenticated;
