
-- Create a function for platform admin to create transactions
CREATE OR REPLACE FUNCTION public.platform_admin_create_transaction(
  admin_email_param text,
  school_name_param text,
  amount_param integer,
  currency_param text,
  transaction_type_param text,
  status_param text,
  description_param text
)
RETURNS public.transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_record public.transactions;
BEGIN
  -- Verify admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE email = admin_email_param 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Not a platform admin';
  END IF;
  
  -- Set context for the transaction
  PERFORM set_config('app.current_user_email', admin_email_param, true);
  PERFORM set_config('app.platform_admin', 'true', true);
  PERFORM set_config('app.admin_verified', 'true', true);
  PERFORM set_config('app.admin_context_set', 'true', true);
  
  -- Insert the transaction
  INSERT INTO public.transactions (
    school_name,
    amount,
    currency,
    transaction_type,
    status,
    description
  ) VALUES (
    school_name_param,
    amount_param,
    currency_param,
    transaction_type_param,
    status_param,
    description_param
  ) RETURNING * INTO result_record;
  
  RETURN result_record;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.platform_admin_create_transaction(text, text, integer, text, text, text, text) TO anon, authenticated;
