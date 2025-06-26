
-- Add notification tracking and approval workflow tables
CREATE TABLE public.transaction_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  school_admin_email TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('pending_created', 'status_changed', 'reminder')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create transaction approvals table for workflow tracking
CREATE TABLE public.transaction_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  school_admin_email TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'requested_changes')),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create in-app notifications table
CREATE TABLE public.in_app_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('school_admin', 'platform_admin')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add notification_sent flag to transactions table
ALTER TABLE public.transactions 
ADD COLUMN notification_sent BOOLEAN DEFAULT false,
ADD COLUMN last_reminder_sent TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.transaction_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for transaction_notifications
CREATE POLICY "Platform admins can manage transaction notifications" 
  ON public.transaction_notifications 
  FOR ALL 
  USING (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    current_setting('app.platform_admin', true) = 'true' OR
    public.is_verified_platform_admin() = true
  );

-- Create policies for transaction_approvals
CREATE POLICY "Platform admins can view transaction approvals" 
  ON public.transaction_approvals 
  FOR SELECT 
  USING (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    current_setting('app.platform_admin', true) = 'true' OR
    public.is_verified_platform_admin() = true
  );

CREATE POLICY "School admins can create transaction approvals" 
  ON public.transaction_approvals 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers t 
      WHERE t.email = school_admin_email 
      AND t.role = 'admin' 
      AND t.id = auth.uid()
    )
  );

-- Create policies for in_app_notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.in_app_notifications 
  FOR SELECT 
  USING (
    recipient_email = current_setting('app.current_user_email', true) OR
    (current_setting('app.platform_admin', true) = 'true' AND recipient_type = 'platform_admin')
  );

CREATE POLICY "Platform admins can create notifications" 
  ON public.in_app_notifications 
  FOR INSERT 
  WITH CHECK (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    current_setting('app.platform_admin', true) = 'true' OR
    public.is_verified_platform_admin() = true
  );

-- Create function to handle transaction approval workflow
CREATE OR REPLACE FUNCTION public.school_admin_transaction_action(
  transaction_id_param UUID,
  school_admin_email_param TEXT,
  action_param TEXT,
  comments_param TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  transaction_record RECORD;
  school_name_var TEXT;
  new_status TEXT;
  result_json JSON;
BEGIN
  -- Verify school admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE email = school_admin_email_param 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Not a school admin';
  END IF;

  -- Get transaction details
  SELECT t.*, t.school_name INTO transaction_record
  FROM public.transactions t
  WHERE t.id = transaction_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  -- Get school name for the admin
  SELECT school INTO school_name_var
  FROM public.teachers
  WHERE email = school_admin_email_param;

  -- Verify admin belongs to the transaction's school
  IF transaction_record.school_name != school_name_var THEN
    RAISE EXCEPTION 'Unauthorized: Admin not associated with this school';
  END IF;

  -- Determine new status based on action
  CASE action_param
    WHEN 'approved' THEN
      new_status := 'completed';
    WHEN 'rejected' THEN
      new_status := 'failed';
    ELSE
      new_status := transaction_record.status; -- Keep current status for other actions
  END CASE;

  -- Update transaction status if approved/rejected
  IF action_param IN ('approved', 'rejected') THEN
    UPDATE public.transactions 
    SET status = new_status, updated_at = now()
    WHERE id = transaction_id_param;
  END IF;

  -- Record the approval action
  INSERT INTO public.transaction_approvals (
    transaction_id, school_admin_email, action, comments
  ) VALUES (
    transaction_id_param, school_admin_email_param, action_param, comments_param
  );

  -- Create notification for platform admin
  INSERT INTO public.in_app_notifications (
    recipient_email, recipient_type, title, message, notification_type, related_id
  ) VALUES (
    'zulfimoon1@gmail.com', 'platform_admin',
    'Transaction ' || action_param,
    'School admin from ' || transaction_record.school_name || ' has ' || action_param || ' transaction #' || transaction_id_param::TEXT,
    'transaction_action',
    transaction_id_param
  );

  result_json := json_build_object(
    'success', true,
    'action', action_param,
    'new_status', new_status,
    'transaction_id', transaction_id_param
  );

  RETURN result_json;
END;
$$;

-- Create function to get pending transactions for a school
CREATE OR REPLACE FUNCTION public.get_school_pending_transactions(school_admin_email_param TEXT)
RETURNS SETOF transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  admin_school TEXT;
BEGIN
  -- Verify school admin permissions and get school
  SELECT school INTO admin_school
  FROM public.teachers 
  WHERE email = school_admin_email_param 
  AND role = 'admin';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized: Not a school admin';
  END IF;

  -- Return pending transactions for the school
  RETURN QUERY 
  SELECT * FROM public.transactions 
  WHERE school_name = admin_school 
  AND status = 'pending'
  ORDER BY created_at DESC;
END;
$$;
