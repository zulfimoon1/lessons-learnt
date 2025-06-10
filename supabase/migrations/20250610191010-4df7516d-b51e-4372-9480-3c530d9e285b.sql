
-- First drop the existing function to avoid conflicts
DROP FUNCTION IF EXISTS public.get_current_user_info();

-- Fix the audit_trigger function by setting an explicit search path
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (table_name, operation, user_id, new_data)
        VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (table_name, operation, user_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (table_name, operation, user_id, old_data)
        VALUES (TG_TABLE_NAME, TG_OP, auth.uid(), to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Recreate the get_current_user_info function with the original signature but fixed search path
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE(user_role text, user_school text)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    RETURN QUERY
    SELECT t.role::TEXT, t.school
    FROM public.teachers t
    WHERE t.id = auth.uid()
    UNION ALL
    SELECT 'student'::TEXT, s.school
    FROM public.students s
    WHERE s.id = auth.uid();
END;
$$;
