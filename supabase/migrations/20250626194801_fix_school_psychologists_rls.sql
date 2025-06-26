
-- Fix RLS policies for school_psychologists table
DROP POLICY IF EXISTS "Users can view school psychologists" ON public.school_psychologists;
DROP POLICY IF EXISTS "Teachers can manage school psychologists" ON public.school_psychologists;

-- Create permissive policies for school psychologists
CREATE POLICY "Allow all users to view school psychologists"
  ON public.school_psychologists
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Allow teachers to manage school psychologists"
  ON public.school_psychologists
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.school_psychologists ENABLE ROW LEVEL SECURITY;
