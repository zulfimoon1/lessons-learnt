
-- Create a function for platform admin statistics that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_platform_stats(stat_type text)
RETURNS TABLE(count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs with elevated privileges to bypass RLS for platform admin
  CASE stat_type
    WHEN 'students' THEN
      RETURN QUERY SELECT COUNT(*)::bigint FROM public.students;
    WHEN 'teachers' THEN
      RETURN QUERY SELECT COUNT(*)::bigint FROM public.teachers;
    WHEN 'feedback' THEN
      RETURN QUERY SELECT COUNT(*)::bigint FROM public.feedback;
    ELSE
      RETURN QUERY SELECT 0::bigint;
  END CASE;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_platform_stats(text) TO anon, authenticated;
