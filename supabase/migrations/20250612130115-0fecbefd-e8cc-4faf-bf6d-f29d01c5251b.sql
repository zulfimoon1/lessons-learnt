
-- Force drop all policies and recreate everything from scratch
ALTER TABLE public.teacher_profiles DISABLE ROW LEVEL SECURITY;

-- Use a more aggressive approach to drop ALL policies
DO $$ 
DECLARE
    policy_name text;
BEGIN
    -- Get all policy names for teacher_profiles and drop them
    FOR policy_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'teacher_profiles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.teacher_profiles', policy_name);
    END LOOP;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Drop and recreate the function completely
DROP FUNCTION IF EXISTS public.get_teacher_role_and_school(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_current_teacher_info() CASCADE;

-- Create a completely new security definer function with a different name
CREATE OR REPLACE FUNCTION public.safe_get_teacher_info(user_uuid uuid)
RETURNS TABLE(user_role text, user_school text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Simple direct query without any RLS complications
    RETURN QUERY
    SELECT t.role::text, t.school::text
    FROM public.teachers t
    WHERE t.id = user_uuid
    LIMIT 1;
END;
$$;

-- Grant permissions immediately
GRANT EXECUTE ON FUNCTION public.safe_get_teacher_info(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_get_teacher_info(uuid) TO anon;

-- Re-enable RLS
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Create completely new policies with different names
CREATE POLICY "tp_select_own" 
    ON public.teacher_profiles 
    FOR SELECT 
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "tp_update_own" 
    ON public.teacher_profiles 
    FOR UPDATE 
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "tp_insert_own" 
    ON public.teacher_profiles 
    FOR INSERT 
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Create admin policy with the new function
CREATE POLICY "tp_admin_select" 
    ON public.teacher_profiles 
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM public.safe_get_teacher_info(auth.uid()) AS info
            WHERE info.user_role = 'admin' 
            AND info.user_school = teacher_profiles.school
        )
    );

-- Force a refresh of the policy cache
NOTIFY pgrst, 'reload schema';
