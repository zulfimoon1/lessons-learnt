
-- Add missing permissions and policies for platform admin operations (fixed version)

-- Grant permissions for additional tables that platform admin needs access to
GRANT SELECT ON public.subscriptions TO anon;
GRANT SELECT ON public.mental_health_alerts TO anon;
GRANT SELECT ON public.weekly_summaries TO anon;
GRANT SELECT ON public.live_chat_sessions TO anon;
GRANT SELECT ON public.chat_messages TO anon;
GRANT SELECT ON public.transactions TO anon;
GRANT SELECT ON public.discount_codes TO anon;

-- Grant DELETE permissions for platform admin operations on core tables
GRANT DELETE ON public.teachers TO anon;
GRANT DELETE ON public.students TO anon;
GRANT DELETE ON public.class_schedules TO anon;

-- Create policies for subscription access
DROP POLICY IF EXISTS "Platform admin can access subscriptions" ON public.subscriptions;
CREATE POLICY "Platform admin can access subscriptions"
  ON public.subscriptions
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());

-- Create policies for other tables (excluding feedback_analytics view)
DROP POLICY IF EXISTS "Platform admin can access feedback" ON public.feedback;
CREATE POLICY "Platform admin can access feedback"
  ON public.feedback
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());

DROP POLICY IF EXISTS "Platform admin can access class schedules" ON public.class_schedules;
CREATE POLICY "Platform admin can access class schedules"
  ON public.class_schedules
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());

-- Create policies for transactions
DROP POLICY IF EXISTS "Platform admin can access transactions" ON public.transactions;
CREATE POLICY "Platform admin can access transactions"
  ON public.transactions
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());

-- Create policies for discount codes
DROP POLICY IF EXISTS "Platform admin can access discount codes" ON public.discount_codes;
CREATE POLICY "Platform admin can access discount codes"
  ON public.discount_codes
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());

-- Create policies for mental health alerts
DROP POLICY IF EXISTS "Platform admin can access mental health alerts" ON public.mental_health_alerts;
CREATE POLICY "Platform admin can access mental health alerts"
  ON public.mental_health_alerts
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());

-- Create policies for weekly summaries
DROP POLICY IF EXISTS "Platform admin can access weekly summaries" ON public.weekly_summaries;
CREATE POLICY "Platform admin can access weekly summaries"
  ON public.weekly_summaries
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());

-- Create policies for live chat sessions
DROP POLICY IF EXISTS "Platform admin can access live chat sessions" ON public.live_chat_sessions;
CREATE POLICY "Platform admin can access live chat sessions"
  ON public.live_chat_sessions
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());

-- Create policies for chat messages
DROP POLICY IF EXISTS "Platform admin can access chat messages" ON public.chat_messages;
CREATE POLICY "Platform admin can access chat messages"
  ON public.chat_messages
  FOR ALL
  TO anon, authenticated
  USING (public.check_platform_admin_access())
  WITH CHECK (public.check_platform_admin_access());
