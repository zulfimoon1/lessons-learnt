
-- Add support for platform admin context setting
-- This allows the platform admin dashboard to bypass RLS policies

-- Create a function to set configuration for platform admin access
CREATE OR REPLACE FUNCTION public.set_config(setting_name text, setting_value text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT set_config(setting_name, setting_value, false);
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.set_config(text, text) TO anon, authenticated;
