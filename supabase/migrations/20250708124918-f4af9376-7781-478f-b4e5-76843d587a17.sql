-- Update the existing is_verified_platform_admin function to recognize demo admin
CREATE OR REPLACE FUNCTION public.is_verified_platform_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Multiple verification paths for reliability, including demo admin
  RETURN (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    current_setting('app.current_user_email', true) = 'demoadmin@demo.com' OR
    current_setting('app.platform_admin', true) = 'true' OR
    current_setting('app.admin_verified', true) = 'true' OR
    current_setting('app.admin_context_set', true) = 'true'
  );
END;
$function$;