
-- Fix the invite_token column to use standard base64 encoding instead of base64url
ALTER TABLE public.invitations 
ALTER COLUMN invite_token 
SET DEFAULT encode(extensions.gen_random_bytes(32), 'base64');

-- Update any existing records that might have problematic tokens
UPDATE public.invitations 
SET invite_token = encode(extensions.gen_random_bytes(32), 'base64')
WHERE status = 'pending';
