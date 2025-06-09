
-- Fix the school_statistics view security issue
-- Drop the existing view and recreate it without SECURITY DEFINER

DROP VIEW IF EXISTS public.school_statistics;

-- Recreate the view without SECURITY DEFINER property
CREATE VIEW public.school_statistics AS
SELECT 
    school,
    COUNT(DISTINCT id) as total_teachers,
    COUNT(DISTINCT role) as total_subjects,
    COUNT(DISTINCT school) as total_grades,
    COUNT(*) as total_classes
FROM public.teachers
GROUP BY school;

-- Add RLS policy for the view if needed
-- Note: Views inherit RLS from their underlying tables, so this may not be necessary
-- but we can add explicit access control if needed

-- Grant appropriate permissions
GRANT SELECT ON public.school_statistics TO authenticated;
GRANT SELECT ON public.school_statistics TO anon;
