
-- Fix missing RLS policies and security issues

-- Enable RLS on discount_codes table if not already enabled
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Create missing policies for feedback table
DROP POLICY IF EXISTS "Students can update their own feedback" ON public.feedback;
CREATE POLICY "Students can update their own feedback"
  ON public.feedback
  FOR UPDATE
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can delete their own feedback" ON public.feedback;
CREATE POLICY "Students can delete their own feedback"
  ON public.feedback
  FOR DELETE
  USING (student_id = auth.uid());

-- Create missing policies for weekly_summaries table
DROP POLICY IF EXISTS "Students can update their own weekly summaries" ON public.weekly_summaries;
CREATE POLICY "Students can update their own weekly summaries"
  ON public.weekly_summaries
  FOR UPDATE
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can delete their own weekly summaries" ON public.weekly_summaries;
CREATE POLICY "Students can delete their own weekly summaries"
  ON public.weekly_summaries
  FOR DELETE
  USING (student_id = auth.uid());

-- Create missing policies for mental_health_alerts table
DROP POLICY IF EXISTS "System can insert mental health alerts" ON public.mental_health_alerts;
CREATE POLICY "System can insert mental health alerts"
  ON public.mental_health_alerts
  FOR INSERT
  WITH CHECK (true); -- Allow system triggers to insert alerts

-- Create missing policies for live_chat_sessions table
DROP POLICY IF EXISTS "Students can update their own chat sessions" ON public.live_chat_sessions;
CREATE POLICY "Students can update their own chat sessions"
  ON public.live_chat_sessions
  FOR UPDATE
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Doctors can update chat sessions from their school" ON public.live_chat_sessions;
CREATE POLICY "Doctors can update chat sessions from their school"
  ON public.live_chat_sessions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() 
      AND role = 'doctor'
      AND school = public.live_chat_sessions.school
    )
  );

-- Create missing policies for chat_messages table
DROP POLICY IF EXISTS "Participants can update their own messages" ON public.chat_messages;
CREATE POLICY "Participants can update their own messages"
  ON public.chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.live_chat_sessions lcs
      WHERE lcs.id = public.chat_messages.session_id
      AND (
        lcs.student_id = auth.uid() OR
        lcs.doctor_id = auth.uid()
      )
    )
  );

-- Create missing policies for school_psychologists table
DROP POLICY IF EXISTS "Psychologists can update their own profile" ON public.school_psychologists;
CREATE POLICY "Psychologists can update their own profile"
  ON public.school_psychologists
  FOR UPDATE
  USING (id = auth.uid());

-- Fix teacher policies to use proper UUID casting
DROP POLICY IF EXISTS "Teachers can view teachers from same school" ON public.teachers;
CREATE POLICY "Teachers can view teachers from same school"
  ON public.teachers
  FOR SELECT
  USING (
    school = (
      SELECT school FROM public.teachers 
      WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all teachers in their school" ON public.teachers;
CREATE POLICY "Admins can manage all teachers in their school"
  ON public.teachers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND school = public.teachers.school
    )
  );

-- Fix class_schedules policies
DROP POLICY IF EXISTS "Students can view classes for their grade and school" ON public.class_schedules;
CREATE POLICY "Students can view classes for their grade and school"
  ON public.class_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = auth.uid() 
      AND school = public.class_schedules.school 
      AND grade = public.class_schedules.grade
    )
  );

DROP POLICY IF EXISTS "Teachers can view and manage their own classes" ON public.class_schedules;
CREATE POLICY "Teachers can view and manage their own classes"
  ON public.class_schedules
  FOR ALL
  USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can view all classes in their school" ON public.class_schedules;
CREATE POLICY "Teachers can view all classes in their school"
  ON public.class_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() 
      AND school = public.class_schedules.school
    )
  );

-- Fix mental health alerts policies
DROP POLICY IF EXISTS "Only doctors and admins can view mental health alerts" ON public.mental_health_alerts;
CREATE POLICY "Only doctors and admins can view mental health alerts"
  ON public.mental_health_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() 
      AND (role = 'doctor' OR role = 'admin')
      AND school = public.mental_health_alerts.school
    )
  );

DROP POLICY IF EXISTS "Only doctors and admins can update mental health alerts" ON public.mental_health_alerts;
CREATE POLICY "Only doctors and admins can update mental health alerts"
  ON public.mental_health_alerts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid() 
      AND (role = 'doctor' OR role = 'admin')
      AND school = public.mental_health_alerts.school
    )
  );

-- Add public read access for anonymous users where appropriate
DROP POLICY IF EXISTS "Public can view mental health articles" ON public.mental_health_articles;
CREATE POLICY "Public can view mental health articles"
  ON public.mental_health_articles
  FOR SELECT
  TO anon
  USING (true);

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.teachers WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_current_user_school()
RETURNS TEXT AS $$
  SELECT school FROM public.teachers WHERE id = auth.uid()
  UNION ALL
  SELECT school FROM public.students WHERE id = auth.uid()
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Update policies to use security definer functions where needed
DROP POLICY IF EXISTS "Teachers can insert class schedules" ON public.class_schedules;
CREATE POLICY "Teachers can insert class schedules"
  ON public.class_schedules
  FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid() OR
    public.get_current_user_role() = 'admin'
  );
