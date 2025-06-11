
-- Grant UPDATE permission to anonymous users on teachers table for admin authentication
GRANT UPDATE ON public.teachers TO anon;

-- Create a policy to allow updating password hashes for admin accounts
CREATE POLICY "Allow admin password hash updates" 
  ON public.teachers 
  FOR UPDATE 
  TO anon
  USING (role = 'admin')
  WITH CHECK (role = 'admin');
