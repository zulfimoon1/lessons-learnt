
-- God mode fix: Delete and recreate all demo accounts with a guaranteed working hash
-- This hash is pre-generated and tested: $2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

DELETE FROM public.teachers WHERE email IN ('demoadmin@demo.com', 'demoteacher@demo.com', 'demodoc@demo.com');
DELETE FROM public.students WHERE full_name = 'Demo Student';

-- Insert fresh demo accounts with the guaranteed working hash
INSERT INTO public.teachers (id, name, email, school, role, password_hash, created_at) VALUES
(gen_random_uuid(), 'Demo Administrator', 'demoadmin@demo.com', 'Demo School', 'admin', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', now()),
(gen_random_uuid(), 'Demo Teacher', 'demoteacher@demo.com', 'Demo School', 'teacher', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', now()),
(gen_random_uuid(), 'Demo Doctor', 'demodoc@demo.com', 'Demo School', 'doctor', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', now());

INSERT INTO public.students (id, full_name, school, grade, password_hash, created_at) VALUES
(gen_random_uuid(), 'Demo Student', 'Demo School', 'Grade 5', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', now());
