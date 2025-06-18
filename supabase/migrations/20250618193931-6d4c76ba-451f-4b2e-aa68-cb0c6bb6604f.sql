
-- Fix RLS policies to properly allow platform admin access
-- Drop conflicting policies first
DROP POLICY IF EXISTS "Platform admin full access to teachers" ON public.teachers;
DROP POLICY IF EXISTS "Platform admin full access to students" ON public.students;
DROP POLICY IF EXISTS "Platform admin full access to class_schedules" ON public.class_schedules;
DROP POLICY IF EXISTS "Platform admin full access to feedback" ON public.feedback;
DROP POLICY IF EXISTS "Platform admin full access to mental_health_alerts" ON public.mental_health_alerts;

-- Create comprehensive policies that work with the admin context
CREATE POLICY "Platform admin access to teachers"
  ON public.teachers
  FOR ALL
  TO anon, authenticated
  USING (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '' AND
     EXISTS (
       SELECT 1 FROM public.teachers t
       WHERE t.email = current_setting('app.current_user_email', true) 
       AND t.role = 'admin'
     ))
  )
  WITH CHECK (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '' AND
     EXISTS (
       SELECT 1 FROM public.teachers t
       WHERE t.email = current_setting('app.current_user_email', true) 
       AND t.role = 'admin'
     ))
  );

CREATE POLICY "Platform admin access to students"
  ON public.students
  FOR ALL
  TO anon, authenticated
  USING (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '')
  )
  WITH CHECK (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '')
  );

CREATE POLICY "Platform admin access to feedback"
  ON public.feedback
  FOR ALL
  TO anon, authenticated
  USING (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '')
  )
  WITH CHECK (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '')
  );

CREATE POLICY "Platform admin access to subscriptions"
  ON public.subscriptions
  FOR ALL
  TO anon, authenticated
  USING (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '')
  )
  WITH CHECK (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    (current_setting('app.current_user_email', true) IS NOT NULL AND 
     current_setting('app.current_user_email', true) != '')
  );

-- Ensure the admin record exists
INSERT INTO public.teachers (
  name, 
  email, 
  school, 
  role, 
  password_hash
) VALUES (
  'Platform Admin',
  'zulfimoon1@gmail.com',
  'Platform Administration',
  'admin',
  '$2b$12$LQv3c1yX1/Y6GdE9e5Q8M.QmK5J5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Qu'
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  password_hash = '$2b$12$LQv3c1yX1/Y6GdE9e5Q8M.QmK5J5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Q5Qu';
