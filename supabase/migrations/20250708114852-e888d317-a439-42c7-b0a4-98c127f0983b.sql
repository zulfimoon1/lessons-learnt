-- Fix teacher support chat by making policies match the working live chat system

-- Drop all existing policies on both tables
DROP POLICY IF EXISTS "Teachers can manage support sessions" ON public.support_chat_sessions;
DROP POLICY IF EXISTS "Teachers can manage support messages" ON public.support_chat_messages;
DROP POLICY IF EXISTS "Custom auth access for school_psychologists" ON public.school_psychologists;

-- Create simple, permissive policies that match the working chat system
CREATE POLICY "Allow all access for support_chat_sessions"
ON public.support_chat_sessions
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all access for support_chat_messages"
ON public.support_chat_messages
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all access for school_psychologists"
ON public.school_psychologists
FOR ALL
USING (true)
WITH CHECK (true);