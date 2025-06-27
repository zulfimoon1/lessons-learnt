
-- Drop all existing invitation policies
DROP POLICY IF EXISTS "Allow platform admin full access to invitations" ON public.invitations;
DROP POLICY IF EXISTS "School admins can manage invitations for their school" ON public.invitations;

-- Create simple policy for regular school admins only
-- Platform admin operations now go through the Edge Function
CREATE POLICY "School admins can view invitations for their school" 
ON public.invitations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t 
    WHERE t.school = invitations.school 
    AND t.id = auth.uid() 
    AND t.role = 'admin'
  )
);

CREATE POLICY "School admins can create invitations for their school" 
ON public.invitations 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t 
    WHERE t.school = invitations.school 
    AND t.id = auth.uid() 
    AND t.role = 'admin'
  )
);

CREATE POLICY "School admins can update invitations for their school" 
ON public.invitations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t 
    WHERE t.school = invitations.school 
    AND t.id = auth.uid() 
    AND t.role = 'admin'
  )
);

CREATE POLICY "School admins can delete invitations for their school" 
ON public.invitations 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t 
    WHERE t.school = invitations.school 
    AND t.id = auth.uid() 
    AND t.role = 'admin'
  )
);
