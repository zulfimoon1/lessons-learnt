
-- Phase 1: Emergency RLS Restoration (Safe Version)
-- Re-enable RLS on discount_codes table
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Remove dangerous GRANT ALL permissions from anonymous users
REVOKE ALL ON public.discount_codes FROM anon;

-- Keep limited permissions for authenticated users and service role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.discount_codes TO authenticated;
GRANT ALL ON public.discount_codes TO service_role;

-- Drop and recreate platform admin policy for discount codes
DROP POLICY IF EXISTS "Platform admin access to discount codes" ON public.discount_codes;
CREATE POLICY "Platform admin access to discount codes"
  ON public.discount_codes
  FOR ALL
  TO authenticated
  USING (
    -- Check if platform admin context is set and user is admin
    current_setting('app.current_user_email', true) IS NOT NULL
    AND current_setting('app.current_user_email', true) != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    -- Same check for inserts/updates
    current_setting('app.current_user_email', true) IS NOT NULL
    AND current_setting('app.current_user_email', true) != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    )
  );

-- Enable RLS on remaining critical tables (only if not already enabled)
DO $$
BEGIN
  -- Enable RLS on tables that don't have it yet
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'class_schedules' AND n.nspname = 'public' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'weekly_summaries' AND n.nspname = 'public' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'subscriptions' AND n.nspname = 'public' 
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for class schedules (teachers can manage their own school's schedules)
DROP POLICY IF EXISTS "Teachers can manage school schedules" ON public.class_schedules;
CREATE POLICY "Teachers can manage school schedules"
  ON public.class_schedules
  FOR ALL
  TO authenticated
  USING (
    -- Teachers can access schedules from their school
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() 
      AND school = class_schedules.school
    )
    OR
    -- Platform admin can see all
    (current_setting('app.current_user_email', true) IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM public.teachers 
       WHERE email = current_setting('app.current_user_email', true) 
       AND role = 'admin'
     ))
  );

-- Create policies for weekly summaries
DROP POLICY IF EXISTS "School-based access to weekly summaries" ON public.weekly_summaries;
CREATE POLICY "School-based access to weekly summaries"
  ON public.weekly_summaries
  FOR ALL
  TO authenticated
  USING (
    -- Students can see their own summaries
    student_id = auth.uid()
    OR
    -- Teachers can see summaries from their school
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() 
      AND school = weekly_summaries.school
    )
    OR
    -- Platform admin can see all
    (current_setting('app.current_user_email', true) IS NOT NULL
     AND EXISTS (
       SELECT 1 FROM public.teachers 
       WHERE email = current_setting('app.current_user_email', true) 
       AND role = 'admin'
     ))
  );

-- Create policies for subscriptions (platform admin only)
DROP POLICY IF EXISTS "Platform admin subscriptions access" ON public.subscriptions;
CREATE POLICY "Platform admin subscriptions access"
  ON public.subscriptions
  FOR ALL
  TO authenticated
  USING (
    -- Only platform admin can access subscriptions
    current_setting('app.current_user_email', true) IS NOT NULL
    AND current_setting('app.current_user_email', true) != ''
    AND EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    )
  );
