
-- Completely disable RLS and remove all policies
ALTER TABLE public.discount_codes DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "platform_admin_discount_access" ON public.discount_codes;
DROP POLICY IF EXISTS "admin_full_access_discount_codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can view all discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can create discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can update discount codes" ON public.discount_codes;
DROP POLICY IF EXISTS "Platform admins can delete discount codes" ON public.discount_codes;

-- Drop the constraint if it exists to avoid conflicts
ALTER TABLE public.discount_codes DROP CONSTRAINT IF EXISTS discount_codes_code_unique;

-- Add the constraint back
ALTER TABLE public.discount_codes ADD CONSTRAINT discount_codes_code_unique UNIQUE (code);

-- Grant explicit permissions to anon and authenticated roles
GRANT ALL ON public.discount_codes TO anon;
GRANT ALL ON public.discount_codes TO authenticated;
GRANT ALL ON public.discount_codes TO service_role;

-- Ensure sequence permissions if any auto-increment columns exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
