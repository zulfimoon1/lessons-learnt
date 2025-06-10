
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow platform admin authentication" ON public.teachers;

-- Create a more permissive policy that allows SELECT for admin role without authentication
CREATE POLICY "Allow platform admin authentication" 
  ON public.teachers 
  FOR SELECT 
  USING (role = 'admin');

-- Grant SELECT permission to anonymous users on teachers table for authentication
GRANT SELECT ON public.teachers TO anon;
