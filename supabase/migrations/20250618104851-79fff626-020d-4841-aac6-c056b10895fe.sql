
-- Phase 1: Fix Critical Database Security Issues

-- 1. Fix audit log permissions - grant proper access for security logging
GRANT INSERT ON public.audit_log TO authenticated;
GRANT SELECT ON public.audit_log TO authenticated;

-- 2. Add missing RLS policies for unprotected tables

-- Discount codes - only platform admins can manage
CREATE POLICY "Platform admin can manage discount codes"
  ON public.discount_codes
  FOR ALL
  TO authenticated
  USING (public.is_zulfimoon_admin())
  WITH CHECK (public.is_zulfimoon_admin());

-- Transactions - users can view their school's transactions
CREATE POLICY "School-based transaction access"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND school = transactions.school_name AND role IN ('admin', 'teacher')
    )
  );

-- Subscriptions - school admins can manage their school's subscription
CREATE POLICY "School admin can manage subscription"
  ON public.subscriptions
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND school = subscriptions.school_name AND role = 'admin'
    )
  );

-- Chat messages - users can access messages from their sessions
CREATE POLICY "Users can access their chat messages"
  ON public.chat_messages
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.live_chat_sessions 
      WHERE id = chat_messages.session_id 
      AND (student_id = auth.uid() OR doctor_id = auth.uid())
    )
  );

-- Support chat messages - users can access their support sessions
CREATE POLICY "Users can access their support chat messages"
  ON public.support_chat_messages
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.support_chat_sessions scs
      JOIN public.teachers t ON t.email = scs.teacher_email
      WHERE scs.id = support_chat_messages.session_id AND t.id = auth.uid()
    )
  );

-- Profiles - users can manage their own profile
CREATE POLICY "Users can manage their own profile"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Invitations - school admins can manage invitations for their school
CREATE POLICY "School admin can manage invitations"
  ON public.invitations
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND school = invitations.school AND role = 'admin'
    )
  );

-- Payment notifications - school admins can view their notifications
CREATE POLICY "School admin can view payment notifications"
  ON public.payment_notifications
  FOR SELECT
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND email = payment_notifications.admin_email AND role = 'admin'
    )
  );

-- Mental health articles - doctors and admins can manage articles for their school
CREATE POLICY "Doctors and admins can manage mental health articles"
  ON public.mental_health_articles
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND school = mental_health_articles.school AND role IN ('doctor', 'admin')
    )
  );

-- School psychologists - school admins can manage psychologists for their school
CREATE POLICY "School admin can manage psychologists"
  ON public.school_psychologists
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND school = school_psychologists.school AND role = 'admin'
    )
  );

-- Live chat sessions - participants can access their sessions
CREATE POLICY "Participants can access live chat sessions"
  ON public.live_chat_sessions
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    student_id = auth.uid() OR
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND school = live_chat_sessions.school AND role IN ('doctor', 'admin')
    )
  );

-- Support chat sessions - teachers can access their support sessions
CREATE POLICY "Teachers can access their support sessions"
  ON public.support_chat_sessions
  FOR ALL
  TO authenticated
  USING (
    public.is_zulfimoon_admin() OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() AND email = support_chat_sessions.teacher_email
    )
  );

-- Teacher profiles - users can manage their own teacher profile
CREATE POLICY "Teachers can manage their own profile"
  ON public.teacher_profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. Create enhanced security logging function
CREATE OR REPLACE FUNCTION public.log_security_event_safe(
  event_type text,
  user_id uuid DEFAULT NULL,
  details text DEFAULT '',
  severity text DEFAULT 'medium'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Safe insert that won't fail if audit_log has issues
  BEGIN
    INSERT INTO public.audit_log (
      table_name,
      operation,
      user_id,
      new_data
    ) VALUES (
      'security_events',
      event_type,
      COALESCE(user_id, auth.uid()),
      jsonb_build_object(
        'details', details,
        'severity', severity,
        'timestamp', now(),
        'user_agent', COALESCE(current_setting('request.headers', true)::jsonb->>'user-agent', 'unknown')
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log to PostgreSQL log if audit table fails
      RAISE NOTICE 'Security event logged: % - % - %', event_type, severity, details;
  END;
END;
$$;
