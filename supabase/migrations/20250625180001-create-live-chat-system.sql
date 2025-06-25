
-- Enable realtime for live chat functionality
CREATE TABLE IF NOT EXISTS public.live_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES auth.users,
  student_name TEXT NOT NULL,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  doctor_id UUID REFERENCES auth.users,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.live_chat_sessions(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('student', 'doctor')),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_chat_sessions
CREATE POLICY "Students can view their own sessions" 
  ON public.live_chat_sessions 
  FOR SELECT 
  USING (auth.uid() = student_id OR is_anonymous = true);

CREATE POLICY "Doctors can view sessions they are assigned to or available sessions" 
  ON public.live_chat_sessions 
  FOR SELECT 
  USING (auth.uid() = doctor_id OR (doctor_id IS NULL AND status = 'waiting'));

CREATE POLICY "Students can create their own sessions" 
  ON public.live_chat_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = student_id OR student_id IS NULL);

CREATE POLICY "Doctors can update sessions they join" 
  ON public.live_chat_sessions 
  FOR UPDATE 
  USING (auth.uid() = doctor_id OR (doctor_id IS NULL AND status = 'waiting'));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages from their sessions" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.live_chat_sessions s 
      WHERE s.id = session_id 
      AND (s.student_id = auth.uid() OR s.doctor_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages to their sessions" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.live_chat_sessions s 
      WHERE s.id = session_id 
      AND (s.student_id = auth.uid() OR s.doctor_id = auth.uid())
    )
  );

-- Enable realtime for both tables
ALTER TABLE public.live_chat_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Add is_available column to teachers table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teachers' AND column_name = 'is_available') THEN
    ALTER TABLE public.teachers ADD COLUMN is_available BOOLEAN DEFAULT true;
  END IF;
END $$;
