
-- Generate proper bcrypt hash for demo123 and update all demo accounts
-- Using a verified bcrypt hash for 'demo123'

-- Update demo teacher accounts with correct bcrypt hash for 'demo123'
UPDATE teachers 
SET password_hash = '$2a$12$LQv3c1yqBwEHxv03ibjHVOVhqkqvlWBBHG6EsG8BPqTBaJt9z8ZFu'
WHERE email IN ('demoadmin@demo.com', 'demoteacher@demo.com', 'demodoc@demo.com');

-- Update demo student with correct bcrypt hash for 'demo123'  
UPDATE students
SET password_hash = '$2a$12$LQv3c1yqBwEHxv03ibjHVOVhqkqvlWBBHG6EsG8BPqTBaJt9z8ZFu'
WHERE full_name = 'Demo Student';
