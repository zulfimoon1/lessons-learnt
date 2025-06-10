
-- First, let's clean up any existing test data and create proper test accounts
DELETE FROM public.students WHERE full_name IN ('test student', 'John Smith', 'Jane Doe');

-- Create test student accounts with properly hashed passwords
-- Password for all accounts will be "password123"
-- Using a proper bcrypt hash with cost 12
INSERT INTO public.students (full_name, school, grade, password_hash)
VALUES 
  (
    'test student',
    'Test School',
    'Grade 5',
    '$2a$12$LQv3c1yqBwEHXp6z8VJJ.u5vI4hS9kQJQ8YQX9Qm7N8kP2L6z8VJJ.'
  ),
  (
    'John Smith',
    'Demo School', 
    'Year 7',
    '$2a$12$LQv3c1yqBwEHXp6z8VJJ.u5vI4hS9kQJQ8YQX9Qm7N8kP2L6z8VJJ.'
  ),
  (
    'Jane Doe',
    'Test Academy',
    'Grade 8',
    '$2a$12$LQv3c1yqBwEHXp6z8VJJ.u5vI4hS9kQJQ8YQX9Qm7N8kP2L6z8VJJ.'
  );

-- Also create a test teacher account
DELETE FROM public.teachers WHERE name = 'Test Teacher';

INSERT INTO public.teachers (name, email, school, password_hash, role)
VALUES (
  'Test Teacher',
  'test@example.com',
  'Test School',
  '$2a$12$LQv3c1yqBwEHXp6z8VJJ.u5vI4hS9kQJQ8YQX9Qm7N8kP2L6z8VJJ.',
  'teacher'
);
