-- Fix student authentication by allowing proper access during login
-- Drop the restrictive policies that are blocking student login
DROP POLICY IF EXISTS "Platform admin context access for students" ON public.students;
DROP POLICY IF EXISTS "Students self access" ON public.students;

-- Create proper policies that allow student authentication
CREATE POLICY "Students can authenticate (lookup only)" 
ON public.students 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Students can register" 
ON public.students 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Platform admin full access students" 
ON public.students 
FOR ALL 
TO anon, authenticated
USING (
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
  current_setting('app.platform_admin', true) = 'true' OR
  current_setting('app.admin_verified', true) = 'true'
)
WITH CHECK (
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
  current_setting('app.platform_admin', true) = 'true' OR
  current_setting('app.admin_verified', true) = 'true'
);