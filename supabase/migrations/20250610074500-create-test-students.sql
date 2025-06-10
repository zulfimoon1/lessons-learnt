
-- Create test student accounts for login testing
-- Password for both accounts will be "password123"
-- Using bcrypt hash with cost 12: $2a$12$LQv3c1yqBwEHXfOuE8VJJvJZVJQJvJZVJQJvJZVJQJvJZVJQJvJZV

-- First test student
INSERT INTO public.students (full_name, school, grade, password_hash)
VALUES (
  'test student',
  'Test School',
  'Grade 5',
  '$2a$12$LQv3c1yqBwEHXfOuE8VJJvJZVJQJvJZVJQJvJZVJQJvJZVJQJvJZV'
);

-- Second test student for different school
INSERT INTO public.students (full_name, school, grade, password_hash)
VALUES (
  'John Smith',
  'Demo School', 
  'Year 7',
  '$2a$12$LQv3c1yqBwEHXfOuE8VJJvJZVJQJvJZVJQJvJZVJQJvJZVJQJvJZV'
);

-- Third test student
INSERT INTO public.students (full_name, school, grade, password_hash)
VALUES (
  'Jane Doe',
  'Test Academy',
  'Grade 8',
  '$2a$12$LQv3c1yqBwEHXfOuE8VJJvJZVJQJvJZVJQJvJZVJQJvJZVJQJvJZV'
);
