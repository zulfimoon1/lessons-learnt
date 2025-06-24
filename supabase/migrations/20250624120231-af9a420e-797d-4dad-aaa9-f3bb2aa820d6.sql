
-- Fix RLS policies to support the complete platform flow

-- Drop existing problematic policies on class_schedules
DROP POLICY IF EXISTS "Teachers can view schedules in their school" ON public.class_schedules;
DROP POLICY IF EXISTS "Teachers can create schedules in their school" ON public.class_schedules;
DROP POLICY IF EXISTS "Teachers can update their own schedules" ON public.class_schedules;
DROP POLICY IF EXISTS "Teachers can delete their own schedules" ON public.class_schedules;
DROP POLICY IF EXISTS "Platform admin comprehensive access to class_schedules" ON public.class_schedules;

-- Create comprehensive policies for class_schedules
CREATE POLICY "Teachers can manage schedules in their school"
ON public.class_schedules
FOR ALL
TO authenticated, anon
USING (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Teachers can access schedules in their school
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = teacher_id
    AND t.school = school
  )
)
WITH CHECK (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Teachers can create schedules for their school
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = teacher_id
    AND t.school = school
  )
);

-- Students can view schedules for their school and grade
CREATE POLICY "Students can view relevant schedules"
ON public.class_schedules
FOR SELECT
TO authenticated, anon
USING (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Students can see schedules for their school and grade
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.school = class_schedules.school
    AND s.grade = class_schedules.grade
  )
);

-- Fix feedback table policies
DROP POLICY IF EXISTS "Students can insert own feedback only" ON public.feedback;
DROP POLICY IF EXISTS "Users can view relevant feedback only" ON public.feedback;

-- Students can submit feedback
CREATE POLICY "Students can submit feedback"
ON public.feedback
FOR INSERT
TO authenticated, anon
WITH CHECK (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Students can submit feedback for classes in their school
  EXISTS (
    SELECT 1 FROM public.class_schedules cs
    WHERE cs.id = class_schedule_id
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.school = cs.school
      AND s.grade = cs.grade
      AND (student_id IS NULL OR s.id = student_id)
    )
  )
);

-- Teachers and admins can view feedback for their school
CREATE POLICY "Teachers and admins can view school feedback"
ON public.feedback
FOR SELECT
TO authenticated, anon
USING (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Teachers and admins can see feedback for their school
  EXISTS (
    SELECT 1 FROM public.class_schedules cs
    JOIN public.teachers t ON t.school = cs.school
    WHERE cs.id = feedback.class_schedule_id
    AND (t.role = 'admin' OR t.role = 'teacher')
  ) OR
  -- Students can see their own feedback
  (student_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.students s WHERE s.id = student_id
  ))
);

-- Fix weekly summaries policies
DROP POLICY IF EXISTS "Students can insert own weekly summaries" ON public.weekly_summaries;
DROP POLICY IF EXISTS "Authorized users can view weekly summaries" ON public.weekly_summaries;

-- Students can submit weekly summaries
CREATE POLICY "Students can submit weekly summaries"
ON public.weekly_summaries
FOR INSERT
TO authenticated, anon
WITH CHECK (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Students can submit for their school
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.school = weekly_summaries.school
    AND s.grade = weekly_summaries.grade
    AND (student_id IS NULL OR s.id = student_id)
  )
);

-- Doctors and admins can view weekly summaries for their school
CREATE POLICY "Doctors and admins can view weekly summaries"
ON public.weekly_summaries
FOR SELECT
TO authenticated, anon
USING (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Doctors and admins can see summaries for their school
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.school = weekly_summaries.school
    AND t.role IN ('doctor', 'admin')
  ) OR
  -- Students can see their own summaries
  (student_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.students s WHERE s.id = student_id
  ))
);

-- Fix live chat sessions policies
DROP POLICY IF EXISTS "Students can view own chat sessions" ON public.live_chat_sessions;

-- Students can create and view chat sessions
CREATE POLICY "Students can manage chat sessions"
ON public.live_chat_sessions
FOR ALL
TO authenticated, anon
USING (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Students can see their own sessions
  (student_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.students s WHERE s.id = student_id
  )) OR
  -- Doctors can see sessions in their school
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.school = live_chat_sessions.school
    AND t.role = 'doctor'
    AND (t.id = doctor_id OR doctor_id IS NULL)
  )
)
WITH CHECK (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Students can create sessions for their school
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.school = live_chat_sessions.school
    AND (student_id IS NULL OR s.id = student_id)
  ) OR
  -- Doctors can update sessions in their school
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.school = live_chat_sessions.school
    AND t.role = 'doctor'
  )
);

-- Fix chat messages policies
DROP POLICY IF EXISTS "Chat participants can view messages" ON public.chat_messages;

-- Chat participants can manage messages
CREATE POLICY "Chat participants can manage messages"
ON public.chat_messages
FOR ALL
TO authenticated, anon
USING (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Participants can see messages in their sessions
  EXISTS (
    SELECT 1 FROM public.live_chat_sessions lcs
    WHERE lcs.id = chat_messages.session_id
    AND (
      (lcs.student_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.students s WHERE s.id = lcs.student_id
      )) OR
      (lcs.doctor_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.teachers t 
        WHERE t.id = lcs.doctor_id AND t.role = 'doctor'
      ))
    )
  )
)
WITH CHECK (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Participants can send messages in their sessions
  EXISTS (
    SELECT 1 FROM public.live_chat_sessions lcs
    WHERE lcs.id = chat_messages.session_id
    AND (
      (lcs.student_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.students s WHERE s.id = lcs.student_id
      )) OR
      (lcs.doctor_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.teachers t 
        WHERE t.id = lcs.doctor_id AND t.role = 'doctor'
      ))
    )
  )
);

-- Fix mental health alerts policies
DROP POLICY IF EXISTS "Only authorized personnel can view mental health alerts" ON public.mental_health_alerts;
DROP POLICY IF EXISTS "Only authorized personnel can update mental health alerts" ON public.mental_health_alerts;

-- Doctors and admins can manage mental health alerts
CREATE POLICY "Doctors and admins can manage mental health alerts"
ON public.mental_health_alerts
FOR ALL
TO authenticated, anon
USING (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- Doctors and admins can see alerts for their school
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.school = mental_health_alerts.school
    AND t.role IN ('doctor', 'admin')
  )
)
WITH CHECK (
  -- Platform admin access
  (current_setting('app.current_user_email', true) IS NOT NULL AND 
   current_setting('app.current_user_email', true) != '') OR
  -- System can create alerts, doctors and admins can update
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.school = mental_health_alerts.school
    AND t.role IN ('doctor', 'admin')
  )
);

-- Ensure all tables have proper permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_schedules TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_summaries TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_chat_sessions TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mental_health_alerts TO authenticated, anon;
