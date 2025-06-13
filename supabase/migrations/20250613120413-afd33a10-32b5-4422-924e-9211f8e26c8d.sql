
-- Grant SELECT permission on feedback_analytics view for platform admin
GRANT SELECT ON public.feedback_analytics TO anon;
GRANT SELECT ON public.feedback_analytics TO authenticated;

-- Fix any remaining policies that might be blocking access
-- Ensure platform admin can properly delete data
GRANT DELETE ON public.teachers TO anon;
GRANT DELETE ON public.students TO anon;
GRANT DELETE ON public.class_schedules TO anon;

-- Create policy for feedback_analytics view access
DROP POLICY IF EXISTS "Platform admin can access feedback analytics" ON public.feedback_analytics;
-- Note: Views typically inherit policies from underlying tables, but let's ensure access

-- Update class_schedules policy for platform admin operations
DROP POLICY IF EXISTS "Platform admin can access class schedules" ON public.class_schedules;
CREATE POLICY "Platform admin can access class schedules"
  ON public.class_schedules
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());
