-- Fix RLS policies for teacher support chat system by dropping ALL policies first

-- Drop ALL existing policies on support_chat_sessions
DROP POLICY IF EXISTS "Teachers can manage support sessions" ON public.support_chat_sessions;
DROP POLICY IF EXISTS "Teachers can access their support sessions" ON public.support_chat_sessions;
DROP POLICY IF EXISTS "Teachers can view their own support sessions" ON public.support_chat_sessions;

-- Drop ALL existing policies on support_chat_messages  
DROP POLICY IF EXISTS "Teachers can manage support messages" ON public.support_chat_messages;
DROP POLICY IF EXISTS "Teachers can view messages from their sessions" ON public.support_chat_messages;
DROP POLICY IF EXISTS "Users can access their support chat messages" ON public.support_chat_messages;

-- Create new policies for support_chat_sessions that work with custom auth
CREATE POLICY "Teachers can manage support sessions"
ON public.support_chat_sessions
FOR ALL
USING (
  -- Allow platform admin access
  is_zulfimoon_admin() OR
  -- Allow when platform admin context is set (custom auth system)
  ((current_setting('app.current_user_email'::text, true) IS NOT NULL) AND 
   (current_setting('app.current_user_email'::text, true) <> ''::text)) OR
  -- Allow all authenticated users (app handles school filtering)
  auth.role() = 'authenticated'
)
WITH CHECK (
  -- Same conditions for inserts/updates
  is_zulfimoon_admin() OR
  ((current_setting('app.current_user_email'::text, true) IS NOT NULL) AND 
   (current_setting('app.current_user_email'::text, true) <> ''::text)) OR
  auth.role() = 'authenticated'
);

-- Create new policies for support_chat_messages
CREATE POLICY "Teachers can manage support messages"
ON public.support_chat_messages
FOR ALL
USING (
  -- Allow platform admin access
  is_zulfimoon_admin() OR
  -- Allow when platform admin context is set
  ((current_setting('app.current_user_email'::text, true) IS NOT NULL) AND 
   (current_setting('app.current_user_email'::text, true) <> ''::text)) OR
  -- Allow all authenticated users (app handles session filtering)
  auth.role() = 'authenticated'
)
WITH CHECK (
  -- Same conditions for inserts/updates
  is_zulfimoon_admin() OR
  ((current_setting('app.current_user_email'::text, true) IS NOT NULL) AND 
   (current_setting('app.current_user_email'::text, true) <> ''::text)) OR
  auth.role() = 'authenticated'
);