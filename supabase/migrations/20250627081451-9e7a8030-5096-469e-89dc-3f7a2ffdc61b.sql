
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "School admins can view invitations for their school" ON public.invitations;
DROP POLICY IF EXISTS "School admins can create invitations for their school" ON public.invitations;
DROP POLICY IF EXISTS "School admins can update invitations for their school" ON public.invitations;
DROP POLICY IF EXISTS "School admins can delete invitations for their school" ON public.invitations;

-- Create a more reliable platform admin check function
CREATE OR REPLACE FUNCTION public.is_platform_admin_authenticated()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check multiple context variables for maximum reliability
  RETURN (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com' OR
    current_setting('app.platform_admin', true) = 'true' OR
    current_setting('app.admin_verified', true) = 'true' OR
    current_setting('app.admin_context_set', true) = 'true'
  );
END;
$$;

-- Grant execute permission to all roles
GRANT EXECUTE ON FUNCTION public.is_platform_admin_authenticated() TO anon, authenticated;

-- Create simplified policies that prioritize platform admin access
CREATE POLICY "Allow platform admin full access to invitations" 
ON public.invitations 
FOR ALL 
USING (public.is_platform_admin_authenticated());

CREATE POLICY "School admins can manage invitations for their school" 
ON public.invitations 
FOR ALL 
USING (
  public.is_platform_admin_authenticated() OR
  EXISTS (
    SELECT 1 FROM public.teachers t 
    WHERE t.school = invitations.school 
    AND t.id = auth.uid() 
    AND t.role = 'admin'
  )
);
