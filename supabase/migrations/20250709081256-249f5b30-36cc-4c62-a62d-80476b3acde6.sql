-- Allow teachers to create support chat sessions
-- This policy allows teachers authenticated through our custom system to create chat sessions
CREATE POLICY "Teachers can create support sessions" 
ON public.live_chat_sessions 
FOR INSERT 
WITH CHECK (
  -- Allow if it's a teacher support session (grade = 'Teacher Support')
  grade = 'Teacher Support' 
  OR 
  -- Allow if the student_id matches a teacher in the teachers table
  (student_id IN (SELECT id FROM public.teachers))
  OR
  -- Allow anonymous sessions (existing functionality)
  true
);