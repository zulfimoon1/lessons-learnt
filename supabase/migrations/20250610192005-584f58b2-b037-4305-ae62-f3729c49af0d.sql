
-- Create a custom admin account
-- Replace 'your-email@domain.com', 'Your Name', 'Your School', and 'your-secure-password' with your actual details

INSERT INTO public.teachers (
  name, 
  email, 
  school, 
  role, 
  password_hash
) 
SELECT 
  'Your Name',  -- Replace with your actual name
  'your-email@domain.com',  -- Replace with your actual email
  'Your School',  -- Replace with your actual school name
  'admin',
  -- This will hash the password 'your-secure-password' - replace with your desired password
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'  -- This is a bcrypt hash for 'password' - you'll need to replace this
WHERE NOT EXISTS (
  SELECT 1 FROM public.teachers WHERE email = 'your-email@domain.com'
);
