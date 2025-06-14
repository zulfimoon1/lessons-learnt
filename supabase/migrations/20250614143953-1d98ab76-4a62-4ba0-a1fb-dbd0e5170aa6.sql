
-- Temporarily disable RLS to test if that's the issue
ALTER TABLE public.discount_codes DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start completely fresh
DROP POLICY IF EXISTS "Platform admin access to discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admin full access to discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admin can manage discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Allow platform admin access to discount codes" ON public.discount_codes;

-- Create a much simpler policy that should work
CREATE POLICY "admin_full_access_discount_codes"
  ON public.discount_codes
  FOR ALL
  TO anon, authenticated
  USING (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com'
    OR EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE email = current_setting('app.current_user_email', true) 
      AND role = 'admin'
    )
  );
