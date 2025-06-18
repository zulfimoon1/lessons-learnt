
-- Drop all problematic policies and create a comprehensive solution
DO $$ 
DECLARE
    policy_rec RECORD;
BEGIN
    -- Drop all existing policies on key tables
    FOR policy_rec IN 
        SELECT policyname, tablename FROM pg_policies 
        WHERE tablename IN ('teachers', 'students', 'feedback', 'subscriptions', 'class_schedules', 'mental_health_alerts', 'weekly_summaries', 'discount_codes', 'transactions')
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_rec.policyname, policy_rec.tablename);
    END LOOP;
END $$;

-- Create a robust admin check function that works reliably
CREATE OR REPLACE FUNCTION public.is_platform_admin_access()
RETURNS BOOLEAN AS $$
BEGIN
  -- Always allow access if the admin email is set in context
  RETURN current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
    OR current_setting('app.platform_admin', true) = 'true';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create very permissive policies for platform admin
CREATE POLICY "Platform admin access teachers"
  ON public.teachers FOR ALL TO anon, authenticated
  USING (public.is_platform_admin_access())
  WITH CHECK (public.is_platform_admin_access());

CREATE POLICY "Platform admin access students"
  ON public.students FOR ALL TO anon, authenticated
  USING (public.is_platform_admin_access())
  WITH CHECK (public.is_platform_admin_access());

CREATE POLICY "Platform admin access feedback"
  ON public.feedback FOR ALL TO anon, authenticated
  USING (public.is_platform_admin_access())
  WITH CHECK (public.is_platform_admin_access());

CREATE POLICY "Platform admin access subscriptions"
  ON public.subscriptions FOR ALL TO anon, authenticated
  USING (public.is_platform_admin_access())
  WITH CHECK (public.is_platform_admin_access());

CREATE POLICY "Platform admin access class_schedules"
  ON public.class_schedules FOR ALL TO anon, authenticated
  USING (public.is_platform_admin_access())
  WITH CHECK (public.is_platform_admin_access());

CREATE POLICY "Platform admin access mental_health_alerts"
  ON public.mental_health_alerts FOR ALL TO anon, authenticated
  USING (public.is_platform_admin_access())
  WITH CHECK (public.is_platform_admin_access());

CREATE POLICY "Platform admin access weekly_summaries"
  ON public.weekly_summaries FOR ALL TO anon, authenticated
  USING (public.is_platform_admin_access())
  WITH CHECK (public.is_platform_admin_access());

CREATE POLICY "Platform admin access discount_codes"
  ON public.discount_codes FOR ALL TO anon, authenticated
  USING (public.is_platform_admin_access())
  WITH CHECK (public.is_platform_admin_access());

CREATE POLICY "Platform admin access transactions"
  ON public.transactions FOR ALL TO anon, authenticated
  USING (public.is_platform_admin_access())
  WITH CHECK (public.is_platform_admin_access());

-- Enhanced context setting function with multiple fallbacks
CREATE OR REPLACE FUNCTION public.set_platform_admin_context(admin_email text)
RETURNS void AS $$
BEGIN
  -- Set multiple context variables for redundancy
  PERFORM set_config('app.current_user_email', admin_email, true);
  PERFORM set_config('app.platform_admin', 'true', true);
  PERFORM set_config('app.admin_verified', 'true', true);
  
  -- Log successful context setting
  RAISE NOTICE 'Platform admin context set for: % with multiple flags', admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_platform_admin_access() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_platform_admin_context(text) TO anon, authenticated;
