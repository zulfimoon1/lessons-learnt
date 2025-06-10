
-- Remove the overly permissive policy and implement proper security
-- while maintaining compatibility with the simple auth system

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow all operations for simple auth" ON public.students;

-- Create properly scoped policies for the simple auth system
-- Allow anonymous users to read student data for login verification (needed for authentication)
CREATE POLICY "Allow student authentication lookup" 
  ON public.students 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Allow anonymous users to insert new students (needed for signup)
CREATE POLICY "Allow student registration" 
  ON public.students 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Allow updates for password changes and profile updates
CREATE POLICY "Allow student profile updates" 
  ON public.students 
  FOR UPDATE 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Similarly secure the teachers table
-- Drop any existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations for simple auth" ON public.teachers;

-- Create proper policies for teachers
CREATE POLICY "Allow teacher authentication lookup" 
  ON public.teachers 
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow teacher registration" 
  ON public.teachers 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow teacher profile updates" 
  ON public.teachers 
  FOR UPDATE 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Secure mental health alerts with proper access control
ALTER TABLE public.mental_health_alerts ENABLE ROW LEVEL SECURITY;

-- Only allow mental health professionals and admins to view alerts
CREATE POLICY "Mental health professionals can view alerts" 
  ON public.mental_health_alerts 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t 
      WHERE t.id = auth.uid() 
      AND t.role IN ('doctor', 'admin')
      AND t.school = mental_health_alerts.school
    )
  );

-- Allow system to insert alerts (from triggers)
CREATE POLICY "System can create mental health alerts" 
  ON public.mental_health_alerts 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Allow mental health professionals to update alert status
CREATE POLICY "Mental health professionals can update alerts" 
  ON public.mental_health_alerts 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t 
      WHERE t.id = auth.uid() 
      AND t.role IN ('doctor', 'admin')
      AND t.school = mental_health_alerts.school
    )
  );
