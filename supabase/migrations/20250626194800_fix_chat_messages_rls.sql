
-- Fix RLS policies for chat_messages to allow authenticated users to send messages
-- First drop any existing restrictive policies
DROP POLICY IF EXISTS "Users can only see their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.chat_messages;

-- Create permissive policies for chat functionality
CREATE POLICY "Allow authenticated users to view chat messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert chat messages"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also allow anonymous users for demo purposes
CREATE POLICY "Allow anonymous chat message viewing"
  ON public.chat_messages
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous chat message insertion"
  ON public.chat_messages
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Enable RLS on the table
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
