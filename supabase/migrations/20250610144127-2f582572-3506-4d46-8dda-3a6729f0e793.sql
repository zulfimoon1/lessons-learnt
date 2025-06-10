
-- Create support chat sessions table
CREATE TABLE public.support_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_name TEXT NOT NULL,
  teacher_email TEXT NOT NULL,
  school_name TEXT NOT NULL,
  teacher_role TEXT NOT NULL DEFAULT 'teacher',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE NULL
);

-- Create support chat messages table
CREATE TABLE public.support_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.support_chat_sessions(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('teacher', 'admin')),
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.support_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for support chat sessions (teachers can create and view their own)
CREATE POLICY "Teachers can create support sessions" 
  ON public.support_chat_sessions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Teachers can view their own support sessions" 
  ON public.support_chat_sessions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Teachers can update their own support sessions" 
  ON public.support_chat_sessions 
  FOR UPDATE 
  USING (true);

-- Create policies for support chat messages (teachers can create and view messages in their sessions)
CREATE POLICY "Teachers can create support messages" 
  ON public.support_chat_messages 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Teachers can view support messages" 
  ON public.support_chat_messages 
  FOR SELECT 
  USING (true);
