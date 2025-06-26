
-- Drop the existing security_dashboard view
DROP VIEW IF EXISTS public.security_dashboard CASCADE;

-- Recreate the view with SECURITY INVOKER to respect user permissions
CREATE VIEW public.security_dashboard WITH (security_invoker = on) AS
SELECT 
    (SELECT COUNT(*) FROM public.students) as total_students,
    (SELECT COUNT(*) FROM public.teachers) as total_teachers,
    (SELECT COUNT(*) FROM public.mental_health_alerts WHERE is_reviewed = false) as unreviewed_alerts,
    (SELECT COUNT(*) FROM public.mental_health_alerts WHERE created_at > now() - interval '24 hours') as recent_alerts,
    (SELECT COUNT(*) FROM public.audit_log WHERE table_name = 'security_events' AND timestamp > now() - interval '1 hour') as recent_security_events;

-- Set proper ownership
ALTER VIEW public.security_dashboard OWNER TO postgres;

-- Grant appropriate permissions - restrict to authenticated users only
GRANT SELECT ON public.security_dashboard TO authenticated;

-- Ensure no anon access for security
REVOKE ALL ON public.security_dashboard FROM anon;
