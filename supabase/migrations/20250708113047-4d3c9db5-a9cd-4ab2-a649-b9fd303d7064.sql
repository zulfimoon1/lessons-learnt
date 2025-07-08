-- Re-enable RLS and create proper policy for custom auth system

-- Enable Row Level Security
ALTER TABLE public.school_psychologists ENABLE ROW LEVEL SECURITY;

-- Create a policy that works with your custom authentication system
CREATE POLICY "Custom auth access for school_psychologists"
ON public.school_psychologists
FOR ALL
USING (
  -- Allow platform admin access
  is_zulfimoon_admin() OR
  -- Allow when platform admin context is set (your custom auth system)
  ((current_setting('app.current_user_email'::text, true) IS NOT NULL) AND 
   (current_setting('app.current_user_email'::text, true) <> ''::text)) OR
  -- Allow authenticated users (since your app handles school filtering)
  auth.role() = 'authenticated'
);