
-- Fix access for platform admins by ensuring proper policies on underlying tables
-- The feedback_analytics view uses feedback and class_schedules tables

-- Grant permissions to the view itself
GRANT SELECT ON public.feedback_analytics TO anon, authenticated;

-- Ensure platform admins can access feedback table
CREATE POLICY "Platform admin access for feedback" 
  ON public.feedback
  FOR SELECT
  TO anon, authenticated
  USING (public.check_platform_admin_access());

-- Ensure platform admins can access class_schedules table  
CREATE POLICY "Platform admin access for class_schedules"
  ON public.class_schedules
  FOR SELECT
  TO anon, authenticated
  USING (public.check_platform_admin_access());

-- Update the get_platform_stats function to ensure it works properly
CREATE OR REPLACE FUNCTION public.get_platform_stats(stat_type TEXT)
RETURNS TABLE(count BIGINT) AS $$
BEGIN
  -- This function runs with elevated privileges to bypass RLS for platform admin
  CASE stat_type
    WHEN 'students' THEN
      RETURN QUERY SELECT COUNT(*)::BIGINT FROM public.students;
    WHEN 'teachers' THEN
      RETURN QUERY SELECT COUNT(*)::BIGINT FROM public.teachers;
    WHEN 'feedback' THEN
      RETURN QUERY SELECT COUNT(*)::BIGINT FROM public.feedback;
    ELSE
      RETURN QUERY SELECT 0::BIGINT;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
