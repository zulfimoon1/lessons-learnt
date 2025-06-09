
-- Fix 1: Completely remove and recreate feedback_analytics view without SECURITY DEFINER
DROP VIEW IF EXISTS public.feedback_analytics CASCADE;

-- Create a clean view without any SECURITY DEFINER property
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

-- Fix 2: Add RLS policies for discount_codes table
CREATE POLICY "Platform admins can manage discount codes"
  ON public.discount_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "School admins can view codes for their school"
  ON public.discount_codes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND school = public.discount_codes.school_name
    )
  );

-- Fix 3: Add RLS policies for school_psychologists table
CREATE POLICY "School community can view psychologists from their school"
  ON public.school_psychologists
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND school = public.school_psychologists.school
    ) OR
    EXISTS (
      SELECT 1 FROM public.teacher_profiles 
      WHERE id = auth.uid() 
      AND school = public.school_psychologists.school
    )
  );

CREATE POLICY "Only admins can manage school psychologists"
  ON public.school_psychologists
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND school = public.school_psychologists.school
    )
  );

-- Fix 4: Add RLS policies for subscriptions table
CREATE POLICY "Only admins can view subscriptions for their school"
  ON public.subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND school = public.subscriptions.school_name
    )
  );

CREATE POLICY "Only admins can manage subscriptions for their school"
  ON public.subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND school = public.subscriptions.school_name
    )
  );
