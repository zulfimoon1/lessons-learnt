
-- Create test student accounts for login testing
-- Password for both accounts will be "password123"
-- Using bcrypt hash with cost 12: $2a$12$LQv3c1yqBwEHXp6z8VJJ.u5vI4hS9kQJQ8YQX9Qm7N8kP2L6z8VJJ.

-- First test student
INSERT INTO public.students (full_name, school, grade, password_hash)
VALUES (
  'test student',
  'Test School',
  'Grade 5',
  '$2a$12$LQv3c1yqBwEHXp6z8VJJ.u5vI4hS9kQJQ8YQX9Qm7N8kP2L6z8VJJ.'
)
ON CONFLICT (full_name, school) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash;

-- Second test student for different school
INSERT INTO public.students (full_name, school, grade, password_hash)
VALUES (
  'John Smith',
  'Demo School', 
  'Year 7',
  '$2a$12$LQv3c1yqBwEHXp6z8VJJ.u5vI4hS9kQJQ8YQX9Qm7N8kP2L6z8VJJ.'
)
ON CONFLICT (full_name, school) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash;

-- Third test student
INSERT INTO public.students (full_name, school, grade, password_hash)
VALUES (
  'Jane Doe',
  'Test Academy',
  'Grade 8',
  '$2a$12$LQv3c1yqBwEHXp6z8VJJ.u5vI4hS9kQJQ8YQX9Qm7N8kP2L6z8VJJ.'
)
ON CONFLICT (full_name, school) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash;

-- Test teacher account
INSERT INTO public.teachers (name, email, school, password_hash, role)
VALUES (
  'Test Teacher',
  'test@example.com',
  'Test School',
  '$2a$12$LQv3c1yqBwEHXp6z8VJJ.u5vI4hS9kQJQ8YQX9Qm7N8kP2L6z8VJJ.',
  'teacher'
)
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash;
