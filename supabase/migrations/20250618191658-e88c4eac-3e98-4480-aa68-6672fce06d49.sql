
-- Fix RLS policies to give platform admin full access to all tables
-- Drop existing conflicting policies first
DROP POLICY IF EXISTS "Allow zulfimoon admin full access to teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow zulfimoon admin full access to students" ON public.students;
DROP POLICY IF EXISTS "Allow zulfimoon admin access to teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow zulfimoon admin access to students" ON public.students;
DROP POLICY IF EXISTS "Platform admin access for teachers" ON public.teachers;
DROP POLICY IF EXISTS "Platform admin access for students" ON public.students;
DROP POLICY IF EXISTS "Platform admin access for feedback" ON public.feedback;
DROP POLICY IF EXISTS "Platform admin access for class_schedules" ON public.class_schedules;

-- Create comprehensive policies for platform admin access to all tables
-- Teachers table
CREATE POLICY "Platform admin full access to teachers"
  ON public.teachers
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

-- Students table
CREATE POLICY "Platform admin full access to students" 
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

-- Class schedules table
CREATE POLICY "Platform admin full access to class_schedules" 
  ON public.class_schedules
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

-- Feedback table
CREATE POLICY "Platform admin full access to feedback" 
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

-- Mental health alerts table
CREATE POLICY "Platform admin full access to mental_health_alerts" 
  ON public.mental_health_alerts
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

-- Weekly summaries table
CREATE POLICY "Platform admin full access to weekly_summaries" 
  ON public.weekly_summaries
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

-- School psychologists table
CREATE POLICY "Platform admin full access to school_psychologists" 
  ON public.school_psychologists
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

-- Mental health articles table
CREATE POLICY "Platform admin full access to mental_health_articles" 
  ON public.mental_health_articles
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

-- Subscriptions table
CREATE POLICY "Platform admin full access to subscriptions" 
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

-- Transactions table
CREATE POLICY "Platform admin full access to transactions" 
  ON public.transactions
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

-- Payment notifications table
CREATE POLICY "Platform admin full access to payment_notifications" 
  ON public.payment_notifications
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
