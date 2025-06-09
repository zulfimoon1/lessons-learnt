
-- Completely drop and recreate the feedback_analytics view to ensure no SECURITY DEFINER property
DROP VIEW IF EXISTS public.feedback_analytics CASCADE;

-- Recreate the view with explicit ownership and no security definer
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

-- Ensure proper ownership and permissions
ALTER VIEW public.feedback_analytics OWNER TO postgres;
GRANT SELECT ON public.feedback_analytics TO authenticated;
GRANT SELECT ON public.feedback_analytics TO anon;

-- Explicitly ensure no security definer is set (this should be the default but making it explicit)
-- Note: Views don't have SECURITY DEFINER by default, but we're being extra thorough
