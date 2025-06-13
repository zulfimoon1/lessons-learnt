
-- Ensure the admin account exists with the correct password hash
-- First, delete any existing admin records that might be corrupted
DELETE FROM public.teachers WHERE email = 'zulfimoon1@gmail.com' AND role = 'admin';

-- Create the admin account with a fresh bcrypt hash for 'admin123'
INSERT INTO public.teachers (
  name, 
  email, 
  school, 
  role, 
  password_hash
) VALUES (
  'Platform Admin',
  'zulfimoon1@gmail.com',
  'Platform Administration',
  'admin',
  '$2b$12$LQv3c1ybd1/1NQhqvI/T4.6wvQA6LMBUZn/dOokQ8Z2K2UHEYzHpu'
);

-- Verify the admin was created
SELECT id, name, email, school, role, 
       CASE WHEN password_hash IS NOT NULL THEN 'Has hash' ELSE 'No hash' END as hash_status
FROM public.teachers 
WHERE email = 'zulfimoon1@gmail.com' AND role = 'admin';
