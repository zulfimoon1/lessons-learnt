
-- Fix infinite recursion by dropping ALL existing policies first, then creating new ones
-- Drop ALL existing policies on these tables to avoid conflicts
DO $$ 
DECLARE
    policy_rec RECORD;
BEGIN
    -- Drop all policies on teachers table
    FOR policy_rec IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'teachers' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.teachers', policy_rec.policyname);
    END LOOP;
    
    -- Drop all policies on students table
    FOR policy_rec IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'students' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.students', policy_rec.policyname);
    END LOOP;
    
    -- Drop all policies on feedback table
    FOR policy_rec IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'feedback' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.feedback', policy_rec.policyname);
    END LOOP;
    
    -- Drop all policies on subscriptions table
    FOR policy_rec IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'subscriptions' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.subscriptions', policy_rec.policyname);
    END LOOP;
    
    -- Drop all policies on class_schedules table
    FOR policy_rec IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'class_schedules' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.class_schedules', policy_rec.policyname);
    END LOOP;
    
    -- Drop all policies on mental_health_alerts table
    FOR policy_rec IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'mental_health_alerts' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.mental_health_alerts', policy_rec.policyname);
    END LOOP;
    
    -- Drop all policies on weekly_summaries table
    FOR policy_rec IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'weekly_summaries' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.weekly_summaries', policy_rec.policyname);
    END LOOP;
    
    -- Drop all policies on discount_codes table
    FOR policy_rec IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'discount_codes' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.discount_codes', policy_rec.policyname);
    END LOOP;
    
    -- Drop all policies on transactions table
    FOR policy_rec IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'transactions' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.transactions', policy_rec.policyname);
    END LOOP;
END $$;

-- Create a security definer function that won't cause recursion
CREATE OR REPLACE FUNCTION public.is_platform_admin_context()
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct check for the specific admin email without table lookup
  RETURN current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create simple, non-recursive policies for all tables
CREATE POLICY "Platform admin full access to teachers"
  ON public.teachers
  FOR ALL
  TO anon, authenticated
  USING (public.is_platform_admin_context())
  WITH CHECK (public.is_platform_admin_context());

CREATE POLICY "Platform admin full access to students"
  ON public.students
  FOR ALL
  TO anon, authenticated
  USING (public.is_platform_admin_context())
  WITH CHECK (public.is_platform_admin_context());

CREATE POLICY "Platform admin full access to feedback"
  ON public.feedback
  FOR ALL
  TO anon, authenticated
  USING (public.is_platform_admin_context())
  WITH CHECK (public.is_platform_admin_context());

CREATE POLICY "Platform admin full access to subscriptions"
  ON public.subscriptions
  FOR ALL
  TO anon, authenticated
  USING (public.is_platform_admin_context())
  WITH CHECK (public.is_platform_admin_context());

CREATE POLICY "Platform admin full access to class_schedules"
  ON public.class_schedules
  FOR ALL
  TO anon, authenticated
  USING (public.is_platform_admin_context())
  WITH CHECK (public.is_platform_admin_context());

CREATE POLICY "Platform admin full access to mental_health_alerts"
  ON public.mental_health_alerts
  FOR ALL
  TO anon, authenticated
  USING (public.is_platform_admin_context())
  WITH CHECK (public.is_platform_admin_context());

CREATE POLICY "Platform admin full access to weekly_summaries"
  ON public.weekly_summaries
  FOR ALL
  TO anon, authenticated
  USING (public.is_platform_admin_context())
  WITH CHECK (public.is_platform_admin_context());

CREATE POLICY "Platform admin full access to discount_codes"
  ON public.discount_codes
  FOR ALL
  TO anon, authenticated
  USING (public.is_platform_admin_context())
  WITH CHECK (public.is_platform_admin_context());

CREATE POLICY "Platform admin full access to transactions"
  ON public.transactions
  FOR ALL
  TO anon, authenticated
  USING (public.is_platform_admin_context())
  WITH CHECK (public.is_platform_admin_context());

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_platform_admin_context() TO anon, authenticated;
