
-- Drop the existing view completely to ensure clean state
DROP VIEW IF EXISTS public.feedback_analytics CASCADE;

-- Recreate the view with explicit SECURITY INVOKER to ensure it respects the querying user's permissions
CREATE VIEW public.feedback_analytics WITH (security_invoker = on) AS
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

-- Set proper ownership
ALTER VIEW public.feedback_analytics OWNER TO postgres;

-- Grant appropriate permissions - restrict to authenticated users only for security
GRANT SELECT ON public.feedback_analytics TO authenticated;

-- Ensure no anon access for security
REVOKE ALL ON public.feedback_analytics FROM anon;

-- Verify the view was created correctly (this comment is for reference)
-- You can check this by running: \d+ feedback_analytics in psql
-- It should show "security_invoker = on" and no mention of security_definer
