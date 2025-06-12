
-- First, completely disable RLS on teacher_profiles to stop the recursion
ALTER TABLE public.teacher_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on teacher_profiles
DROP POLICY IF EXISTS "Teachers can view own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update own profile" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Allow teacher registration" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Admins can view school teacher profiles" ON public.teacher_profiles;
DROP POLICY IF EXISTS "Admins can view school teachers" ON public.teacher_profiles;

-- Drop the existing function that might still be causing issues
DROP FUNCTION IF EXISTS public.get_current_teacher_info();

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

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own teacher profile" 
    ON public.teacher_profiles 
    FOR SELECT 
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can update own teacher profile" 
    ON public.teacher_profiles 
    FOR UPDATE 
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own teacher profile" 
    ON public.teacher_profiles 
    FOR INSERT 
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Create admin policy using the security definer function (fixed alias name)
CREATE POLICY "Admins can view same school teacher profiles" 
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
