
-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.feedback_analytics;

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
