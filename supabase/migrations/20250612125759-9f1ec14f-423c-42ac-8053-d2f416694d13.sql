
-- First, completely disable RLS on teacher_profiles to stop the recursion
ALTER TABLE public.teacher_profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on teacher_profiles (using more comprehensive approach)
DO $$ 
BEGIN
    -- Drop all policies that might exist
    DROP POLICY IF EXISTS "Teachers can view own profile" ON public.teacher_profiles;
    DROP POLICY IF EXISTS "Teachers can update own profile" ON public.teacher_profiles;
    DROP POLICY IF EXISTS "Allow teacher registration" ON public.teacher_profiles;
    DROP POLICY IF EXISTS "Admins can view school teacher profiles" ON public.teacher_profiles;
    DROP POLICY IF EXISTS "Admins can view school teachers" ON public.teacher_profiles;
    DROP POLICY IF EXISTS "Users can view own teacher profile" ON public.teacher_profiles;
    DROP POLICY IF EXISTS "Users can update own teacher profile" ON public.teacher_profiles;
    DROP POLICY IF EXISTS "Users can insert own teacher profile" ON public.teacher_profiles;
    DROP POLICY IF EXISTS "Admins can view same school teacher profiles" ON public.teacher_profiles;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore errors if policies don't exist
END $$;

-- Drop the existing function that might still be causing issues
DROP FUNCTION IF EXISTS public.get_current_teacher_info();
DROP FUNCTION IF EXISTS public.get_teacher_role_and_school(uuid);

-- Create a simpler, more reliable security definer function
CREATE OR REPLACE FUNCTION public.get_teacher_role_and_school(user_uuid uuid)
RETURNS TABLE(user_role text, user_school text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT t.role::text, t.school::text
    FROM public.teachers t
    WHERE t.id = user_uuid;
END;
$$;

-- Re-enable RLS on teacher_profiles
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies with unique names
CREATE POLICY "teacher_profiles_own_select" 
    ON public.teacher_profiles 
    FOR SELECT 
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "teacher_profiles_own_update" 
    ON public.teacher_profiles 
    FOR UPDATE 
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "teacher_profiles_own_insert" 
    ON public.teacher_profiles 
    FOR INSERT 
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Create admin policy using the security definer function
CREATE POLICY "teacher_profiles_admin_school_select" 
    ON public.teacher_profiles 
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM public.get_teacher_role_and_school(auth.uid()) AS teacher_info
            WHERE teacher_info.user_role = 'admin' 
            AND teacher_info.user_school = teacher_profiles.school
        )
    );

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_teacher_role_and_school(uuid) TO authenticated;
