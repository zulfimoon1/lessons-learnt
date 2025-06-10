
-- Let's check the current admin record and update it with a fresh password hash
-- First, let's see what we have
SELECT id, name, email, school, role, 
       CASE WHEN password_hash IS NOT NULL THEN 'Has hash' ELSE 'No hash' END as hash_status,
       LENGTH(password_hash) as hash_length
FROM public.teachers 
WHERE email = 'zulfimoon1@gmail.com' AND role = 'admin';

-- Update with a fresh bcrypt hash for 'admin123'
UPDATE public.teachers 
SET password_hash = '$2b$12$LQv3c1ybd1/1NQhqvI/T4.6wvQA6LMBUZn/dOokQ8Z2K2UHEYzHpu'
WHERE email = 'zulfimoon1@gmail.com' AND role = 'admin';
