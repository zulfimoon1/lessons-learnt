
-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "School admins can view invitations for their school" ON public.invitations;
DROP POLICY IF EXISTS "School admins can create invitations for their school" ON public.invitations;
DROP POLICY IF EXISTS "School admins can update invitations for their school" ON public.invitations;

-- Create more permissive policies that work with platform admin context
CREATE POLICY "School admins can view invitations for their school" 
ON public.invitations 
FOR SELECT 
USING (
  -- Allow if user is a school admin for this school
  EXISTS (
    SELECT 1 FROM public.teachers t 
    WHERE t.school = invitations.school 
    AND t.id = auth.uid() 
    AND t.role = 'admin'
  )
  OR
  -- Allow if platform admin context is set
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
);

CREATE POLICY "School admins can create invitations for their school" 
ON public.invitations 
FOR INSERT 
WITH CHECK (
  -- Allow if user is a school admin for this school
  EXISTS (
    SELECT 1 FROM public.teachers t 
    WHERE t.school = invitations.school 
    AND t.id = auth.uid() 
    AND t.role = 'admin'
  )
  OR
  -- Allow if platform admin context is set
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
);

CREATE POLICY "School admins can update invitations for their school" 
ON public.invitations 
FOR UPDATE 
USING (
  -- Allow if user is a school admin for this school
  EXISTS (
    SELECT 1 FROM public.teachers t 
    WHERE t.school = invitations.school 
    AND t.id = auth.uid() 
    AND t.role = 'admin'
  )
  OR
  -- Allow if platform admin context is set
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
);

-- Also add a policy for DELETE operations in case it's needed
CREATE POLICY "School admins can delete invitations for their school" 
ON public.invitations 
FOR DELETE 
USING (
  -- Allow if user is a school admin for this school
  EXISTS (
    SELECT 1 FROM public.teachers t 
    WHERE t.school = invitations.school 
    AND t.id = auth.uid() 
    AND t.role = 'admin'
  )
  OR
  -- Allow if platform admin context is set
  current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
);
