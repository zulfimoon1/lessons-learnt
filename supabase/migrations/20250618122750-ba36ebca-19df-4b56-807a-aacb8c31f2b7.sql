
-- Phase 1: Critical RLS Policy Cleanup
-- Drop all conflicting and problematic policies

-- Clean up students table policies
DROP POLICY IF EXISTS "Allow zulfimoon admin full access to students" ON public.students;
DROP POLICY IF EXISTS "Allow platform admin operations on students" ON public.students;
DROP POLICY IF EXISTS "Students can view own profile only" ON public.students;
DROP POLICY IF EXISTS "Students can update own profile only" ON public.students;
DROP POLICY IF EXISTS "Allow student registration" ON public.students;

-- Clean up teachers table policies  
DROP POLICY IF EXISTS "Allow zulfimoon admin full access to teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow platform admin operations on teachers" ON public.teachers;
DROP POLICY IF EXISTS "Allow admin authentication" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can view own profile" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can update own profile" ON public.teachers;

-- Clean up audit_log policies (critical for security monitoring)
DROP POLICY IF EXISTS "Platform admins can read all data for analytics" ON public.students;
DROP POLICY IF EXISTS "Platform admins can read teacher data for analytics" ON public.teachers;

-- Clean up mental health alerts policies
DROP POLICY IF EXISTS "Authorized personnel can view mental health alerts" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Authorized personnel can update mental health alerts" ON public.mental_health_alerts;

-- Create simplified, secure RLS policies

-- Students: Only authenticated users can access their own data
CREATE POLICY "Students secure access" ON public.students
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Teachers: Only authenticated users can access their own data
CREATE POLICY "Teachers secure access" ON public.teachers
  FOR ALL TO authenticated  
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Mental health alerts: Only doctors and admins from same school
CREATE POLICY "Mental health secure access" ON public.mental_health_alerts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = auth.uid() 
      AND t.role IN ('doctor', 'admin')
      AND t.school = mental_health_alerts.school
    )
  );

-- Feedback: Students can access their own, teachers can access from their school
CREATE POLICY "Feedback secure access" ON public.feedback
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.teachers t
      JOIN public.class_schedules cs ON cs.id = feedback.class_schedule_id
      WHERE t.id = auth.uid() AND t.school = cs.school
    )
  );

CREATE POLICY "Feedback secure insert" ON public.feedback
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() OR student_id IS NULL);

-- Audit log: Secure access for security monitoring
CREATE POLICY "Audit log secure access" ON public.audit_log
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Grant minimal necessary permissions
REVOKE ALL ON public.students FROM anon;
REVOKE ALL ON public.teachers FROM anon;
REVOKE ALL ON public.mental_health_alerts FROM anon;

-- Only allow authenticated access
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.teachers TO authenticated;
GRANT SELECT, UPDATE ON public.mental_health_alerts TO authenticated;
GRANT SELECT, INSERT ON public.feedback TO authenticated;
GRANT INSERT ON public.audit_log TO authenticated;
