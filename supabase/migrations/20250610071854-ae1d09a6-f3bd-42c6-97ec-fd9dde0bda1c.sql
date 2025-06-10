
-- Fix RLS policies for simple authentication system
-- This migration addresses the "permission denied" errors in the logs

-- Drop existing overly restrictive policies
DROP POLICY IF EXISTS "Allow student authentication lookup" ON public.students;
DROP POLICY IF EXISTS "Allow student registration" ON public.students;
DROP POLICY IF EXISTS "Allow student profile updates" ON public.students;
DROP POLICY IF EXISTS "Allow teacher authentication lookup" ON public.teachers;
DROP POLICY IF EXISTS "Allow teacher registration" ON public.teachers;
DROP POLICY IF EXISTS "Allow teacher profile updates" ON public.teachers;

-- Create comprehensive policies for simple auth system
-- Students table policies
CREATE POLICY "Enable simple auth for students" 
  ON public.students 
  FOR ALL 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Teachers table policies  
CREATE POLICY "Enable simple auth for teachers" 
  ON public.teachers 
  FOR ALL 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled but permissive for the simple auth system
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
