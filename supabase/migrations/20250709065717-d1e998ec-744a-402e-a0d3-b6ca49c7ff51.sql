-- Fix chat system with proper security while ensuring functionality works
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow all access for live_chat_sessions" ON live_chat_sessions;
DROP POLICY IF EXISTS "Allow all access for chat_messages" ON chat_messages;

-- Create secure but functional policies for live_chat_sessions
CREATE POLICY "Platform admin can access all sessions" ON live_chat_sessions
FOR ALL
USING (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com')
WITH CHECK (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com');

CREATE POLICY "Allow session creation for students" ON live_chat_sessions
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Participants can access their sessions" ON live_chat_sessions
FOR ALL
USING (
  student_id = auth.uid() OR 
  doctor_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM teachers t 
    WHERE t.id = auth.uid() 
    AND t.school = live_chat_sessions.school 
    AND t.role = 'doctor'
  )
);

-- Create secure but functional policies for chat_messages  
CREATE POLICY "Platform admin can access all messages" ON chat_messages
FOR ALL
USING (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com')
WITH CHECK (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com');

CREATE POLICY "Allow message creation" ON chat_messages
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Session participants can view messages" ON chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM live_chat_sessions lcs
    WHERE lcs.id = chat_messages.session_id
    AND (
      lcs.student_id = auth.uid() OR 
      lcs.doctor_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM teachers t 
        WHERE t.id = auth.uid() 
        AND t.school = lcs.school 
        AND t.role = 'doctor'
      )
    )
  )
);