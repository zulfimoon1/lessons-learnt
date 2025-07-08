-- Disable RLS entirely on school_psychologists table since the app handles access control

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all reads for school_psychologists" ON public.school_psychologists;
DROP POLICY IF EXISTS "Platform admin full access to school_psychologists" ON public.school_psychologists;

-- Disable Row Level Security on the table
ALTER TABLE public.school_psychologists DISABLE ROW LEVEL SECURITY;