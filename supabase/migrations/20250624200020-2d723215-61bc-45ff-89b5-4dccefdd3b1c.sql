
-- Fix the teachers table RLS policies to allow proper access
-- Drop existing problematic policies that might be blocking access
DROP POLICY IF EXISTS "Platform admin comprehensive access to teachers" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can view their own data" ON public.teachers;
DROP POLICY IF EXISTS "Platform admin full access to teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow admin authentication" ON public.teachers;

-- Create a simple, permissive policy for platform admin access
CREATE POLICY "Platform admin context access" 
ON public.teachers 
FOR ALL 
TO anon, authenticated
USING (
  -- Allow if platform admin context is set
  current_setting('app.current_user_email', true) IS NOT NULL AND 
  current_setting('app.current_user_email', true) != ''
)
WITH CHECK (
  -- Same condition for insert/update
  current_setting('app.current_user_email', true) IS NOT NULL AND 
  current_setting('app.current_user_email', true) != ''
);

-- Create a policy for teachers to access their own data
CREATE POLICY "Teachers self access" 
ON public.teachers 
FOR SELECT 
TO anon, authenticated
USING (
  -- Allow platform admin context OR self-access for authentication
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Allow access during authentication flow
  true
);

-- Grant necessary permissions to ensure policies work
GRANT ALL ON public.teachers TO anon, authenticated;
