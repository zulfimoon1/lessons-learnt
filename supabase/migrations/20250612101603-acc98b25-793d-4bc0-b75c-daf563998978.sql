
-- Add RLS policies for platform admin access to subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow platform admins to view all subscriptions
CREATE POLICY "Platform admins can view all subscriptions" 
  ON public.subscriptions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE teachers.id = auth.uid() 
      AND teachers.role = 'admin'
    )
  );

-- Add RLS policies for platform admin access to discount_codes table  
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow platform admins to manage discount codes
CREATE POLICY "Platform admins can view all discount codes" 
  ON public.discount_codes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE teachers.id = auth.uid() 
      AND teachers.role = 'admin'
    )
  );

CREATE POLICY "Platform admins can create discount codes" 
  ON public.discount_codes 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE teachers.id = auth.uid() 
      AND teachers.role = 'admin'
    )
  );

CREATE POLICY "Platform admins can update discount codes" 
  ON public.discount_codes 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE teachers.id = auth.uid() 
      AND teachers.role = 'admin'
    )
  );

CREATE POLICY "Platform admins can delete discount codes" 
  ON public.discount_codes 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE teachers.id = auth.uid() 
      AND teachers.role = 'admin'
    )
  );
