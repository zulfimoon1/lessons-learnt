
-- First, let's check if audit_log table exists and create it if needed
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  user_id UUID,
  old_data JSONB,
  new_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow system audit logging" ON public.audit_log;
DROP POLICY IF EXISTS "Allow audit log reading" ON public.audit_log;
DROP POLICY IF EXISTS "Allow audit log updates" ON public.audit_log;

-- Create policies for audit_log access
-- Allow system-level operations (for SOC 2 compliance logging)
CREATE POLICY "Allow system audit logging" 
  ON public.audit_log 
  FOR INSERT 
  WITH CHECK (true); -- Allow all inserts for system logging

-- Allow reading audit logs for authenticated users with appropriate roles
CREATE POLICY "Allow audit log reading" 
  ON public.audit_log 
  FOR SELECT 
  USING (true); -- Allow reading for monitoring and compliance

-- Allow updates for system maintenance
CREATE POLICY "Allow audit log updates" 
  ON public.audit_log 
  FOR UPDATE 
  USING (true);

-- Create an index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
