
-- Create admin account for zulfimoon1@gmail.com
-- This migration will create your admin account with a secure password hash

INSERT INTO public.teachers (
  name, 
  email, 
  school, 
  role, 
  password_hash
) 
SELECT 
  'Zulfimoon',
  'zulfimoon1@gmail.com',
  'Lesson Lens Platform',
  'admin',
  -- This is a bcrypt hash for 'admin123' - you can change this password after login
  '$2b$12$LQv3c1ybd1/1NQhqvI/T4.6wvQA6LMBUZn/dOokQ8Z2K2UHEYzHpu'
WHERE NOT EXISTS (
  SELECT 1 FROM public.teachers WHERE email = 'zulfimoon1@gmail.com'
);

-- Also remove any placeholder admin if it exists
DELETE FROM public.teachers 
WHERE email = 'your-email@domain.com' OR email = 'admin@test.com';
