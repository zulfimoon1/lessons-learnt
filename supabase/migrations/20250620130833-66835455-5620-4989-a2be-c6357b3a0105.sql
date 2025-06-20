
-- Fix RLS policies to allow proper authentication flow
-- Drop overly restrictive policies
DROP POLICY IF EXISTS "Allow zulfimoon admin access to teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow zulfimoon admin access to students" ON public.students;

-- Create permissive policies that allow authentication to work
CREATE POLICY "Allow teacher authentication and registration" 
ON public.teachers 
FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow student authentication and registration" 
ON public.students 
FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Keep platform admin access for other operations
CREATE POLICY "Platform admin full access to teachers" 
ON public.teachers 
FOR ALL 
TO anon, authenticated
USING (
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
  OR current_setting('app.platform_admin', true) = 'true'
  OR current_setting('app.admin_verified', true) = 'true'
);

CREATE POLICY "Platform admin full access to students" 
ON public.students 
FOR ALL 
TO anon, authenticated
USING (
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
  OR current_setting('app.platform_admin', true) = 'true'
  OR current_setting('app.admin_verified', true) = 'true'
);
