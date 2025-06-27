
-- Create platform admin messages table for support requests
CREATE TABLE IF NOT EXISTS public.platform_admin_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Message details
  subject text NOT NULL,
  message text NOT NULL,
  category text NOT NULL CHECK (category IN ('technical', 'billing', 'feature_request', 'urgent')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  
  -- Sender information
  sender_email text NOT NULL,
  sender_name text NOT NULL,
  sender_role text NOT NULL,
  sender_school text NOT NULL,
  
  -- Context information
  user_agent text,
  browser_info jsonb,
  subscription_info jsonb,
  
  -- Admin response
  admin_response text,
  responded_at timestamp with time zone,
  responded_by text
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_platform_admin_messages_status ON public.platform_admin_messages(status);
CREATE INDEX IF NOT EXISTS idx_platform_admin_messages_priority ON public.platform_admin_messages(priority);
CREATE INDEX IF NOT EXISTS idx_platform_admin_messages_category ON public.platform_admin_messages(category);
CREATE INDEX IF NOT EXISTS idx_platform_admin_messages_sender_email ON public.platform_admin_messages(sender_email);
CREATE INDEX IF NOT EXISTS idx_platform_admin_messages_created_at ON public.platform_admin_messages(created_at);

-- Enable RLS
ALTER TABLE public.platform_admin_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Platform admin can see all messages" ON public.platform_admin_messages
  FOR ALL USING (public.is_platform_admin_access());

CREATE POLICY "Users can insert their own messages" ON public.platform_admin_messages
  FOR INSERT WITH CHECK (
    sender_email = (
      SELECT email FROM public.teachers WHERE id = auth.uid()
      UNION ALL
      SELECT email FROM public.teacher_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own messages" ON public.platform_admin_messages
  FOR SELECT USING (
    sender_email = (
      SELECT email FROM public.teachers WHERE id = auth.uid()
      UNION ALL
      SELECT email FROM public.teacher_profiles WHERE id = auth.uid()
    )
  );

-- Function to create platform admin message
CREATE OR REPLACE FUNCTION public.create_platform_admin_message(
  subject_param text,
  message_param text,
  category_param text,
  sender_email_param text,
  sender_name_param text,
  sender_role_param text,
  sender_school_param text,
  user_agent_param text DEFAULT NULL,
  browser_info_param jsonb DEFAULT NULL,
  subscription_info_param jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  message_id uuid;
  priority_level text := 'medium';
BEGIN
  -- Determine priority based on category and content
  IF category_param = 'urgent' OR message_param ILIKE '%emergency%' OR message_param ILIKE '%critical%' THEN
    priority_level := 'critical';
  ELSIF category_param = 'billing' OR message_param ILIKE '%payment%' OR message_param ILIKE '%subscription%' THEN
    priority_level := 'high';
  ELSIF category_param = 'technical' THEN
    priority_level := 'medium';
  ELSE
    priority_level := 'low';
  END IF;

  -- Insert the message
  INSERT INTO public.platform_admin_messages (
    subject,
    message,
    category,
    priority,
    sender_email,
    sender_name,
    sender_role,
    sender_school,
    user_agent,
    browser_info,
    subscription_info
  ) VALUES (
    subject_param,
    message_param,
    category_param,
    priority_level,
    sender_email_param,
    sender_name_param,
    sender_role_param,
    sender_school_param,
    user_agent_param,
    browser_info_param,
    subscription_info_param
  ) RETURNING id INTO message_id;

  -- Create notification for platform admin
  INSERT INTO public.in_app_notifications (
    recipient_email,
    recipient_type,
    title,
    message,
    notification_type,
    related_id
  ) VALUES (
    'zulfimoon1@gmail.com',
    'platform_admin',
    'New Support Request: ' || subject_param,
    'From ' || sender_name_param || ' (' || sender_school_param || '): ' || LEFT(message_param, 100) || '...',
    'support_request',
    message_id
  );

  RETURN message_id;
END;
$$;
