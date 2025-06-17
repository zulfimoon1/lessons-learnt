
-- Phase 1: Critical RLS Policy Implementation

-- 1. Fix invitations table RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations for their school" 
ON public.invitations 
FOR SELECT 
USING (
  school = (
    SELECT school FROM public.teachers WHERE id = auth.uid()
    UNION ALL
    SELECT school FROM public.students WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can manage invitations for their school" 
ON public.invitations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = auth.uid() 
    AND school = invitations.school 
    AND role IN ('admin', 'doctor')
  )
);

-- 2. Fix payment_notifications table RLS
ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view payment notifications for their school" 
ON public.payment_notifications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = auth.uid() 
    AND school = payment_notifications.school_name 
    AND role = 'admin'
  )
);

-- 3. Fix profiles table RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

-- 4. Fix teacher_profiles table RLS
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view profiles in their school" 
ON public.teacher_profiles 
FOR SELECT 
USING (
  school = (SELECT school FROM public.teachers WHERE id = auth.uid())
);

CREATE POLICY "Teachers can update their own profile" 
ON public.teacher_profiles 
FOR UPDATE 
USING (id = auth.uid());

-- 5. Fix subscriptions table RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view subscriptions for their school" 
ON public.subscriptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = auth.uid() 
    AND school = subscriptions.school_name 
    AND role = 'admin'
  )
);

-- 6. Fix transactions table RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view transactions for their school" 
ON public.transactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = auth.uid() 
    AND school = transactions.school_name 
    AND role = 'admin'
  )
);

-- 7. Fix support chat sessions and messages RLS
ALTER TABLE public.support_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view their own support sessions" 
ON public.support_chat_sessions 
FOR SELECT 
USING (
  teacher_email = (SELECT email FROM public.teachers WHERE id = auth.uid())
);

CREATE POLICY "Teachers can view messages from their sessions" 
ON public.support_chat_messages 
FOR SELECT 
USING (
  session_id IN (
    SELECT id FROM public.support_chat_sessions 
    WHERE teacher_email = (SELECT email FROM public.teachers WHERE id = auth.uid())
  )
);

-- 8. Fix discount_codes policy (remove existing broken one and create proper one)
DROP POLICY IF EXISTS "Platform admins can manage discount codes" ON public.discount_codes;

CREATE POLICY "Platform admins can manage discount codes" 
ON public.discount_codes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- 9. Enhanced audit log security - restrict to security team and admins
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Security team and admins can view audit logs" 
ON public.audit_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'doctor')
  )
);

-- 10. Enhanced mental health data security
CREATE POLICY "Only doctors and admins can view mental health alerts" 
ON public.mental_health_alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = auth.uid() 
    AND role IN ('doctor', 'admin')
    AND school = mental_health_alerts.school
  )
);

CREATE POLICY "Only doctors and admins can update mental health alerts" 
ON public.mental_health_alerts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = auth.uid() 
    AND role IN ('doctor', 'admin')
    AND school = mental_health_alerts.school
  )
);

-- 11. Create security event logging function for enhanced monitoring
CREATE OR REPLACE FUNCTION public.log_enhanced_security_event(
  event_type text,
  user_id uuid DEFAULT NULL,
  details text DEFAULT '',
  severity text DEFAULT 'medium',
  ip_address text DEFAULT NULL,
  user_agent text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_log (
    table_name,
    operation,
    user_id,
    new_data
  ) VALUES (
    'security_events_enhanced',
    event_type,
    COALESCE(user_id, auth.uid()),
    jsonb_build_object(
      'details', details,
      'severity', severity,
      'timestamp', now(),
      'ip_address', ip_address,
      'user_agent', user_agent,
      'session_info', current_setting('request.headers', true)
    )
  );
END;
$$;

-- 12. Create function to validate mental health data access
CREATE OR REPLACE FUNCTION public.validate_mental_health_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only doctors and admins can access mental health data
  RETURN EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE id = auth.uid() 
    AND role IN ('doctor', 'admin')
  );
END;
$$;
