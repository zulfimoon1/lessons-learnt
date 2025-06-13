
-- Delete existing demo accounts and recreate them with fresh hashes
DELETE FROM public.teachers WHERE email IN ('demoadmin@demo.com', 'demoteacher@demo.com', 'demodoc@demo.com');
DELETE FROM public.students WHERE full_name = 'Demo Student';

-- Create fresh demo teacher accounts with properly hashed passwords
-- Note: We'll generate the actual bcrypt hashes in the application code
INSERT INTO public.teachers (id, name, email, school, role, password_hash) VALUES
(gen_random_uuid(), 'Demo Administrator', 'demoadmin@demo.com', 'Demo School', 'admin', '$2a$12$TEMP_HASH_TO_BE_REPLACED'),
(gen_random_uuid(), 'Demo Teacher', 'demoteacher@demo.com', 'Demo School', 'teacher', '$2a$12$TEMP_HASH_TO_BE_REPLACED'),
(gen_random_uuid(), 'Demo Doctor', 'demodoc@demo.com', 'Demo School', 'doctor', '$2a$12$TEMP_HASH_TO_BE_REPLACED');

-- Create fresh demo student account
INSERT INTO public.students (id, full_name, school, grade, password_hash) VALUES
(gen_random_uuid(), 'Demo Student', 'Demo School', 'Grade 5', '$2a$12$TEMP_HASH_TO_BE_REPLACED');
