
-- Update all demo accounts with a proper bcrypt hash for 'demo123'
-- This hash was generated using bcrypt with 12 rounds for the password 'demo123'

UPDATE public.teachers 
SET password_hash = '$2a$12$LQv3c1yqBwEHxv03ibjHVOVhqkqvlWBBHG6EsG8BPqTBaJt9z8ZFu'
WHERE email IN ('demoadmin@demo.com', 'demoteacher@demo.com', 'demodoc@demo.com');

UPDATE public.students
SET password_hash = '$2a$12$LQv3c1yqBwEHxv03ibjHVOVhqkqvlWBBHG6EsG8BPqTBaJt9z8ZFu'
WHERE full_name = 'Demo Student';
