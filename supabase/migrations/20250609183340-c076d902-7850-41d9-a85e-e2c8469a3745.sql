
-- Remove insecure custom authentication tables and replace with Supabase Auth integration

-- Create profiles table for additional user data (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  school TEXT,
  role TEXT DEFAULT 'student',
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create teacher profiles table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  school TEXT NOT NULL,
  role TEXT DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin', 'doctor')),
  specialization TEXT,
  license_number TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on teacher_profiles
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for teacher_profiles
CREATE POLICY "Teachers can view their own profile"
  ON public.teacher_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Teachers can update their own profile"
  ON public.teacher_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Teachers can insert their own profile"
  ON public.teacher_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Teachers can view other teachers in same school"
  ON public.teacher_profiles
  FOR SELECT
  USING (
    school = (
      SELECT school FROM public.teacher_profiles 
      WHERE id = auth.uid()
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table for students or teachers based on metadata
  IF NEW.raw_user_meta_data->>'user_type' = 'student' THEN
    INSERT INTO public.profiles (
      id, 
      full_name, 
      school, 
      grade, 
      role
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'school',
      NEW.raw_user_meta_data->>'grade',
      'student'
    );
  ELSIF NEW.raw_user_meta_data->>'user_type' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (
      id,
      name,
      email,
      school,
      role,
      specialization
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'name',
      NEW.email,
      NEW.raw_user_meta_data->>'school',
      COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
      NEW.raw_user_meta_data->>'specialization'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing tables to reference auth.users instead of custom tables
-- Update feedback table
ALTER TABLE public.feedback 
  DROP CONSTRAINT IF EXISTS feedback_student_id_fkey;

-- Update class_schedules table  
ALTER TABLE public.class_schedules
  DROP CONSTRAINT IF EXISTS class_schedules_teacher_id_fkey;

-- Update weekly_summaries table
ALTER TABLE public.weekly_summaries
  DROP CONSTRAINT IF EXISTS weekly_summaries_student_id_fkey;

-- Update live_chat_sessions table
ALTER TABLE public.live_chat_sessions
  DROP CONSTRAINT IF EXISTS live_chat_sessions_student_id_fkey,
  DROP CONSTRAINT IF EXISTS live_chat_sessions_doctor_id_fkey;

-- Update mental_health_alerts table
ALTER TABLE public.mental_health_alerts
  DROP CONSTRAINT IF EXISTS mental_health_alerts_student_id_fkey;

-- Remove the old insecure tables (after data migration if needed)
-- Note: In production, you'd want to migrate data first
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;

-- Remove platform_admins table as it uses insecure authentication
DROP TABLE IF EXISTS public.platform_admins CASCADE;

-- Update RLS policies to work with new auth system
-- Update feedback policies
DROP POLICY IF EXISTS "Students can submit feedback" ON public.feedback;
CREATE POLICY "Authenticated users can submit feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Teachers can view feedback for their classes" ON public.feedback;
CREATE POLICY "Teachers can view feedback for their classes"
  ON public.feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.class_schedules cs
      WHERE cs.id = public.feedback.class_schedule_id
      AND cs.teacher_id = auth.uid()
    )
  );

-- Update class_schedules policies
DROP POLICY IF EXISTS "Teachers can view and manage their own classes" ON public.class_schedules;
CREATE POLICY "Teachers can view and manage their own classes"
  ON public.class_schedules
  FOR ALL
  USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "Students can view classes for their grade and school" ON public.class_schedules;
CREATE POLICY "Students can view classes for their grade and school"
  ON public.class_schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.school = public.class_schedules.school 
      AND p.grade = public.class_schedules.grade
    )
  );

-- Update weekly_summaries policies
DROP POLICY IF EXISTS "Students can submit their own weekly summaries" ON public.weekly_summaries;
CREATE POLICY "Students can submit their own weekly summaries"
  ON public.weekly_summaries
  FOR INSERT
  WITH CHECK (
    student_id = auth.uid()
  );

-- Update mental health alerts policies
DROP POLICY IF EXISTS "Only doctors and admins can view mental health alerts" ON public.mental_health_alerts;
CREATE POLICY "Only doctors and admins can view mental health alerts"
  ON public.mental_health_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_profiles tp
      WHERE tp.id = auth.uid() 
      AND (tp.role = 'doctor' OR tp.role = 'admin')
      AND tp.school = public.mental_health_alerts.school
    )
  );
