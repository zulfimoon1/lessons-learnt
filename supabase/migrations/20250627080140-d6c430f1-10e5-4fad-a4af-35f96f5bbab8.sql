
-- First, let's ensure all necessary columns exist in the invitations table
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS specialization text;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "School admins can view invitations for their school" ON public.invitations;
DROP POLICY IF EXISTS "School admins can create invitations for their school" ON public.invitations;
DROP POLICY IF EXISTS "School admins can update invitations for their school" ON public.invitations;

-- Enable RLS on the invitations table if not already enabled
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for the invitations table to allow school admins to manage invitations
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
