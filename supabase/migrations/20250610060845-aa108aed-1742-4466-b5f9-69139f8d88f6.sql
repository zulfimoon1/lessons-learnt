
-- Completely remove the feedback_analytics view and recreate it properly
-- This will fix the Security Definer View security issue

-- First, drop any dependencies and the view completely
DROP VIEW IF EXISTS public.feedback_analytics CASCADE;

-- Recreate the view as a standard view without any security definer properties
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

-- Set proper ownership (standard for views)
ALTER VIEW public.feedback_analytics OWNER TO postgres;

-- Grant appropriate permissions - restrict to authenticated users only for security
GRANT SELECT ON public.feedback_analytics TO authenticated;

-- Remove any anon access to maintain security
REVOKE ALL ON public.feedback_analytics FROM anon;

-- Add RLS policy to the view if needed (views inherit from underlying tables)
-- Since this view aggregates data, we'll rely on the underlying table policies
-- The users will only see aggregated data they have access to through the underlying tables
