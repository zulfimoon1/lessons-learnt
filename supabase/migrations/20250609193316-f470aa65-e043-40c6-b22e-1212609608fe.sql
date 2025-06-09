
-- First, completely drop any existing view and dependencies
DROP VIEW IF EXISTS public.feedback_analytics CASCADE;

-- Check if there are any functions with the same name that might be interfering
DROP FUNCTION IF EXISTS public.feedback_analytics() CASCADE;

-- Recreate the view as a simple view without any security definer properties
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

-- Set proper ownership and permissions
ALTER VIEW public.feedback_analytics OWNER TO postgres;

-- Grant necessary permissions
GRANT SELECT ON public.feedback_analytics TO authenticated;
GRANT SELECT ON public.feedback_analytics TO anon;

-- Ensure the view is created as a regular view (not security definer)
-- Note: Views should not have SECURITY DEFINER by default, but we're being explicit
