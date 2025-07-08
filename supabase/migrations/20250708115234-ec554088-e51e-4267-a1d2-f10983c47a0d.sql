-- Grant basic table permissions to anon and authenticated roles
GRANT ALL ON public.support_chat_sessions TO anon, authenticated;
GRANT ALL ON public.support_chat_messages TO anon, authenticated;
GRANT ALL ON public.school_psychologists TO anon, authenticated;