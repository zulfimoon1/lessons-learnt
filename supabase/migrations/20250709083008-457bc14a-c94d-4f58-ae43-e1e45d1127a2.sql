-- Add SELECT policy for doctors to view chat sessions from their school
CREATE POLICY "Doctors can view sessions from their school" 
ON live_chat_sessions 
FOR SELECT 
USING (
  -- Platform admin access
  (current_setting('app.current_user_email', true) = 'zulfimoon1@gmail.com') OR
  -- Doctors can see sessions from their school
  (EXISTS (
    SELECT 1 FROM teachers t 
    WHERE t.id = auth.uid() 
    AND t.school = live_chat_sessions.school 
    AND t.role = 'doctor'
  )) OR
  -- Session participants can see their own sessions
  (student_id = auth.uid() OR doctor_id = auth.uid())
);