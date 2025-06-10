
-- Enable RLS and create policies for live_chat_sessions table
ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Allow everyone to insert chat sessions (students can create sessions)
CREATE POLICY "Allow chat session creation" 
  ON public.live_chat_sessions 
  FOR INSERT 
  TO public, anon, authenticated
  WITH CHECK (true);

-- Allow everyone to read chat sessions (for doctors to see waiting sessions)
CREATE POLICY "Allow chat session reading" 
  ON public.live_chat_sessions 
  FOR SELECT 
  TO public, anon, authenticated
  USING (true);

-- Allow everyone to update chat sessions (for doctors to join and end sessions)
CREATE POLICY "Allow chat session updates" 
  ON public.live_chat_sessions 
  FOR UPDATE 
  TO public, anon, authenticated
  USING (true);

-- Enable RLS and create policies for chat_messages table
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to insert messages
CREATE POLICY "Allow message creation" 
  ON public.chat_messages 
  FOR INSERT 
  TO public, anon, authenticated
  WITH CHECK (true);

-- Allow everyone to read messages
CREATE POLICY "Allow message reading" 
  ON public.chat_messages 
  FOR SELECT 
  TO public, anon, authenticated
  USING (true);

-- Grant explicit permissions to ensure access
GRANT ALL ON public.live_chat_sessions TO anon;
GRANT ALL ON public.live_chat_sessions TO authenticated;
GRANT ALL ON public.chat_messages TO anon;
GRANT ALL ON public.chat_messages TO authenticated;
