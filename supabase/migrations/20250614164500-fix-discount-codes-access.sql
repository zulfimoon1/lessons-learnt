
-- Drop existing policies
DROP POLICY IF EXISTS "Direct platform admin access to discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admin full access to discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admin discount code access" ON public.discount_codes;

-- Create security definer functions for discount code operations
CREATE OR REPLACE FUNCTION public.platform_admin_get_discount_codes(admin_email_param text)
RETURNS SETOF public.discount_codes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE email = admin_email_param 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Not a platform admin';
  END IF;
  
  -- Return all discount codes
  RETURN QUERY SELECT * FROM public.discount_codes ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.platform_admin_create_discount_code(
  admin_email_param text,
  code_param text,
  discount_percent_param integer,
  description_param text DEFAULT NULL,
  max_uses_param integer DEFAULT NULL,
  expires_at_param timestamp with time zone DEFAULT NULL,
  is_active_param boolean DEFAULT true,
  school_name_param text DEFAULT NULL,
  created_by_param uuid DEFAULT NULL
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
  
  -- Insert the discount code
  INSERT INTO public.discount_codes (
    code,
    discount_percent,
    description,
    max_uses,
    expires_at,
    is_active,
    school_name,
    created_by,
    current_uses
  ) VALUES (
    code_param,
    discount_percent_param,
    description_param,
    max_uses_param,
    expires_at_param,
    is_active_param,
    school_name_param,
    created_by_param,
    0
  ) RETURNING * INTO result_record;
  
  RETURN result_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.platform_admin_update_discount_code(
  admin_email_param text,
  code_id_param uuid,
  code_param text DEFAULT NULL,
  discount_percent_param integer DEFAULT NULL,
  description_param text DEFAULT NULL,
  max_uses_param integer DEFAULT NULL,
  expires_at_param timestamp with time zone DEFAULT NULL,
  is_active_param boolean DEFAULT NULL,
  school_name_param text DEFAULT NULL
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
  
  -- Update the discount code
  UPDATE public.discount_codes SET
    code = COALESCE(code_param, code),
    discount_percent = COALESCE(discount_percent_param, discount_percent),
    description = COALESCE(description_param, description),
    max_uses = COALESCE(max_uses_param, max_uses),
    expires_at = COALESCE(expires_at_param, expires_at),
    is_active = COALESCE(is_active_param, is_active),
    school_name = COALESCE(school_name_param, school_name),
    updated_at = now()
  WHERE id = code_id_param
  RETURNING * INTO result_record;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Discount code not found';
  END IF;
  
  RETURN result_record;
END;
$$;

CREATE OR REPLACE FUNCTION public.platform_admin_delete_discount_code(
  admin_email_param text,
  code_id_param uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE email = admin_email_param 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Not a platform admin';
  END IF;
  
  -- Delete the discount code
  DELETE FROM public.discount_codes WHERE id = code_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Discount code not found';
  END IF;
  
  RETURN true;
END;
$$;

-- Keep RLS enabled but allow public access to validation function
CREATE POLICY "Allow public discount code validation" 
  ON public.discount_codes 
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true);
