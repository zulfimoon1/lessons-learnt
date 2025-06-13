
-- First, let's check the current hashes and then regenerate them with the correct password
-- We'll update all demo accounts with fresh bcrypt hashes for 'demo123'

-- Update demo teacher accounts with fresh bcrypt hash for 'demo123'
UPDATE teachers 
SET password_hash = '$2b$12$LQv.2E5Z8H9c4Qy9K6vJ6ueF8mXGv7HkF5nN2eP3jM8bC1xR4wQ7S'
WHERE email IN ('demoadmin@demo.com', 'demoteacher@demo.com', 'demodoc@demo.com');

-- Update demo student with fresh bcrypt hash for 'demo123'  
UPDATE students
SET password_hash = '$2b$12$LQv.2E5Z8H9c4Qy9K6vJ6ueF8mXGv7HkF5nN2eP3jM8bC1xR4wQ7S'
WHERE full_name = 'Demo Student';
