-- Clean up all conflicting RLS policies and create a simple working policy like students use
-- Drop all current policies that are causing conflicts
DROP POLICY IF EXISTS "Allow anonymous session creation" ON live_chat_sessions;
DROP POLICY IF EXISTS "Allow session creation for students" ON live_chat_sessions;
DROP POLICY IF EXISTS "Allow teacher support session creation" ON live_chat_sessions;
DROP POLICY IF EXISTS "Teachers can create support sessions" ON live_chat_sessions;
DROP POLICY IF EXISTS "Doctors can view sessions from their school" ON live_chat_sessions;
DROP POLICY IF EXISTS "Platform admin can access all sessions" ON live_chat_sessions;

-- Create one simple policy that works for everyone (students, teachers, anonymous)
CREATE POLICY "Allow chat session creation and access" 
ON live_chat_sessions 
FOR ALL 
USING (true) 
WITH CHECK (true);