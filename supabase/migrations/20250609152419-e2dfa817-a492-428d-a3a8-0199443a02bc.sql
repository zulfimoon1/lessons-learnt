
-- Enable RLS on all tables (using correct column name)
DO $$
BEGIN
    -- Enable RLS only if not already enabled (using correct column name 'rowsecurity')
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'students' AND schemaname = 'public') THEN
        ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'teachers' AND schemaname = 'public') THEN
        ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'class_schedules' AND schemaname = 'public') THEN
        ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'feedback' AND schemaname = 'public') THEN
        ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'weekly_summaries' AND schemaname = 'public') THEN
        ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'mental_health_alerts' AND schemaname = 'public') THEN
        ALTER TABLE public.mental_health_alerts ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'mental_health_articles' AND schemaname = 'public') THEN
        ALTER TABLE public.mental_health_articles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'live_chat_sessions' AND schemaname = 'public') THEN
        ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'chat_messages' AND schemaname = 'public') THEN
        ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'school_psychologists' AND schemaname = 'public') THEN
        ALTER TABLE public.school_psychologists ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'invitations' AND schemaname = 'public') THEN
        ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'subscriptions' AND schemaname = 'public') THEN
        ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE tablename = 'platform_admins' AND schemaname = 'public') THEN
        ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Drop existing policies that might conflict and recreate them
DROP POLICY IF EXISTS "Platform admins can manage discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "School admins can view codes for their school" ON public.discount_codes;

-- Students table policies
CREATE POLICY "Students can view their own profile"
  ON public.students
  FOR SELECT
  USING (id = auth.uid()::text::uuid);

CREATE POLICY "Students can update their own profile"
  ON public.students
  FOR UPDATE
  USING (id = auth.uid()::text::uuid);

-- Teachers table policies
CREATE POLICY "Teachers can view teachers from same school"
  ON public.teachers
  FOR SELECT
  USING (
    school = (
      SELECT school FROM public.teachers 
      WHERE id = auth.uid()::text::uuid
    )
  );

CREATE POLICY "Teachers can update their own profile"
  ON public.teachers
  FOR UPDATE
  USING (id = auth.uid()::text::uuid);

CREATE POLICY "Admins can manage all teachers in their school"
  ON public.teachers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND role = 'admin' 
      AND school = public.teachers.school
    )
  );

-- Class schedules policies
CREATE POLICY "Students can view classes for their grade and school"
  ON public.class_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = auth.uid()::text::uuid 
      AND school = public.class_schedules.school 
      AND grade = public.class_schedules.grade
    )
  );

CREATE POLICY "Teachers can view and manage their own classes"
  ON public.class_schedules
  FOR ALL
  USING (teacher_id = auth.uid()::text::uuid);

CREATE POLICY "Teachers can view all classes in their school"
  ON public.class_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND school = public.class_schedules.school
    )
  );

-- Feedback policies
CREATE POLICY "Students can submit feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (
    student_id = auth.uid()::text::uuid OR
    student_id IS NULL
  );

CREATE POLICY "Teachers can view feedback for their classes"
  ON public.feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_schedules cs
      JOIN public.teachers t ON cs.teacher_id = t.id
      WHERE cs.id = public.feedback.class_schedule_id
      AND t.id = auth.uid()::text::uuid
    )
  );

CREATE POLICY "School staff can view feedback from their school"
  ON public.feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_schedules cs
      JOIN public.teachers t ON t.school = cs.school
      WHERE cs.id = public.feedback.class_schedule_id
      AND t.id = auth.uid()::text::uuid
    )
  );

-- Weekly summaries policies
CREATE POLICY "Students can submit their own weekly summaries"
  ON public.weekly_summaries
  FOR INSERT
  WITH CHECK (
    student_id = auth.uid()::text::uuid OR
    student_id IS NULL
  );

CREATE POLICY "School staff can view weekly summaries from their school"
  ON public.weekly_summaries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND school = public.weekly_summaries.school
    )
  );

-- Mental health alerts policies (restricted access)
CREATE POLICY "Only doctors and admins can view mental health alerts"
  ON public.mental_health_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND (role = 'doctor' OR role = 'admin')
      AND school = public.mental_health_alerts.school
    )
  );

CREATE POLICY "Only doctors and admins can update mental health alerts"
  ON public.mental_health_alerts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND (role = 'doctor' OR role = 'admin')
      AND school = public.mental_health_alerts.school
    )
  );

-- Mental health articles policies
CREATE POLICY "School staff can view mental health articles from their school"
  ON public.mental_health_articles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND school = public.mental_health_articles.school
    )
  );

CREATE POLICY "Students can view mental health articles from their school"
  ON public.mental_health_articles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = auth.uid()::text::uuid 
      AND school = public.mental_health_articles.school
    )
  );

CREATE POLICY "Only doctors can manage mental health articles"
  ON public.mental_health_articles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND role = 'doctor'
      AND school = public.mental_health_articles.school
    )
  );

-- Live chat sessions policies
CREATE POLICY "Students can view their own chat sessions"
  ON public.live_chat_sessions
  FOR SELECT
  USING (student_id = auth.uid()::text::uuid);

CREATE POLICY "Students can create chat sessions"
  ON public.live_chat_sessions
  FOR INSERT
  WITH CHECK (
    student_id = auth.uid()::text::uuid OR
    student_id IS NULL
  );

CREATE POLICY "Doctors can view and manage chat sessions from their school"
  ON public.live_chat_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND role = 'doctor'
      AND school = public.live_chat_sessions.school
    )
  );

-- Chat messages policies
CREATE POLICY "Participants can view messages from their sessions"
  ON public.chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.live_chat_sessions lcs
      WHERE lcs.id = public.chat_messages.session_id
      AND (
        lcs.student_id = auth.uid()::text::uuid OR
        lcs.doctor_id = auth.uid()::text::uuid
      )
    )
  );

CREATE POLICY "Participants can send messages to their sessions"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.live_chat_sessions lcs
      WHERE lcs.id = public.chat_messages.session_id
      AND (
        lcs.student_id = auth.uid()::text::uuid OR
        lcs.doctor_id = auth.uid()::text::uuid
      )
    )
  );

-- School psychologists policies
CREATE POLICY "School community can view psychologists from their school"
  ON public.school_psychologists
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE id = auth.uid()::text::uuid 
      AND school = public.school_psychologists.school
    ) OR
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND school = public.school_psychologists.school
    )
  );

CREATE POLICY "Only admins can manage school psychologists"
  ON public.school_psychologists
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND role = 'admin'
      AND school = public.school_psychologists.school
    )
  );

-- Invitations policies
CREATE POLICY "Only admins can manage invitations"
  ON public.invitations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND role = 'admin'
    )
  );

-- Subscriptions policies
CREATE POLICY "Only admins can view subscriptions for their school"
  ON public.subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND role = 'admin'
      AND school = public.subscriptions.school_name
    )
  );

-- Platform admins policies (only platform admins can access)
CREATE POLICY "Only platform admins can access admin table"
  ON public.platform_admins
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_admins 
      WHERE id = auth.uid()::text::uuid
    )
  );

-- Discount codes policies (recreated after dropping)
CREATE POLICY "Platform admins can manage discount codes"
  ON public.discount_codes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.platform_admins 
      WHERE id = auth.uid()::text::uuid
    )
  );

CREATE POLICY "School admins can view codes for their school"
  ON public.discount_codes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE id = auth.uid()::text::uuid 
      AND role = 'admin'
      AND school = public.discount_codes.school_name
    )
  );
