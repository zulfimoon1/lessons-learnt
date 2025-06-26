
-- Add Stripe payment tracking fields to transactions table
ALTER TABLE public.transactions 
ADD COLUMN stripe_payment_intent_id TEXT,
ADD COLUMN stripe_session_id TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN payment_processed_at TIMESTAMP WITH TIME ZONE;

-- Create index for payment lookups
CREATE INDEX idx_transactions_stripe_payment_intent ON public.transactions(stripe_payment_intent_id);
CREATE INDEX idx_transactions_payment_status ON public.transactions(payment_status);

-- Update the school_admin_transaction_action function to trigger payment processing
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
      new_status := 'approved'; -- Changed from 'completed' to 'approved'
    WHEN 'rejected' THEN
      new_status := 'failed';
    ELSE
      new_status := transaction_record.status; -- Keep current status for other actions
  END CASE;

  -- Update transaction status if approved/rejected
  IF action_param IN ('approved', 'rejected') THEN
    UPDATE public.transactions 
    SET status = new_status, 
        updated_at = now(),
        payment_status = CASE WHEN action_param = 'approved' THEN 'processing' ELSE 'cancelled' END
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
    'transaction_id', transaction_id_param,
    'requires_payment', action_param = 'approved'
  );

  RETURN result_json;
END;
$$;
