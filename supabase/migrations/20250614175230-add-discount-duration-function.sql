
-- Create function to create discount code with duration support
CREATE OR REPLACE FUNCTION public.platform_admin_create_discount_code_with_duration(
  admin_email_param text,
  code_param text,
  discount_percent_param integer,
  description_param text DEFAULT NULL,
  max_uses_param integer DEFAULT NULL,
  expires_at_param timestamp with time zone DEFAULT NULL,
  is_active_param boolean DEFAULT true,
  school_name_param text DEFAULT NULL,
  created_by_param uuid DEFAULT NULL,
  duration_months_param integer DEFAULT NULL
)
RETURNS public.discount_codes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result_record public.discount_codes;
BEGIN
  -- Verify admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE email = admin_email_param 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Not a platform admin';
  END IF;
  
  -- Insert the discount code with duration
  INSERT INTO public.discount_codes (
    code,
    discount_percent,
    description,
    max_uses,
    expires_at,
    is_active,
    school_name,
    created_by,
    current_uses,
    duration_months
  ) VALUES (
    code_param,
    discount_percent_param,
    description_param,
    max_uses_param,
    expires_at_param,
    is_active_param,
    school_name_param,
    created_by_param,
    0,
    duration_months_param
  ) RETURNING * INTO result_record;
  
  RETURN result_record;
END;
$$;
