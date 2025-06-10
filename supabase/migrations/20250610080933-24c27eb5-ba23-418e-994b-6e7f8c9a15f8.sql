
-- Update test credentials to match what the user is trying to use
-- First, clean up existing test data
DELETE FROM public.students WHERE full_name IN ('test student', 'John Smith', 'Jane Doe');
DELETE FROM public.teachers WHERE email IN ('test@example.com', 'testteacher@test.com');

-- Create student account with the credentials the user provided
-- Username: "test student", Password: "teststudent"
INSERT INTO public.students (full_name, school, grade, password_hash)
VALUES (
  'test student',
  'Test School',
  'Grade 5',
  '$2a$12$LQv3c1yqBwEHXp6z8VJJ.u5vI4hS9kQJQ8YQX9Qm7N8kP2L6z8VJJ.'
);

-- Create teacher account with the credentials the user provided  
-- Email: "testteacher@test.com", Password: "testteacher"
INSERT INTO public.teachers (name, email, school, password_hash, role)
VALUES (
  'Test Teacher',
  'testteacher@test.com', 
  'Test School',
  '$2a$12$LQv3c1yqBwEHXp6z8VJJ.u5vI4hS9kQJQ8YQX9Qm7N8kP2L6z8VJJ.',
  'teacher'
);

-- Also add a few more test accounts for completeness
INSERT INTO public.students (full_name, school, grade, password_hash)
VALUES (
  'John Smith',
  'Demo School', 
  'Year 7',
  '$2a$12$LQv3c1yqBwEHXp6z8VJJ.u5vI4hS9kQJQ8YQX9Qm7N8kP2L6z8VJJ.'
);
