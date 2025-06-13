
-- Create test student with proper UUID
INSERT INTO public.students (id, full_name, school, grade, password_hash) 
VALUES (
  gen_random_uuid(),
  'Demo Student',
  'Demo School',
  '10th Grade',
  '$2a$12$LQv3c1yqBwEHxv03ibjHVOVhqkqvlWBBHG6EsG8BPqTBaJt9z8ZFu'  -- password: 'demo123'
);

-- Create test teacher with proper UUID
INSERT INTO public.teachers (id, name, email, school, role, password_hash) 
VALUES (
  gen_random_uuid(),
  'Demo Teacher',
  'demoteacher@demo.com',
  'Demo School',
  'teacher',
  '$2a$12$LQv3c1yqBwEHxv03ibjHVOVhqkqvlWBBHG6EsG8BPqTBaJt9z8ZFu'  -- password: 'demo123'
);

-- Create test school admin with proper UUID
INSERT INTO public.teachers (id, name, email, school, role, password_hash) 
VALUES (
  gen_random_uuid(),
  'Demo Admin',
  'demoadmin@demo.com',
  'Demo School',
  'admin',
  '$2a$12$LQv3c1yqBwEHxv03ibjHVOVhqkqvlWBBHG6EsG8BPqTBaJt9z8ZFu'  -- password: 'demo123'
);

-- Create test doctor with proper UUID
INSERT INTO public.teachers (id, name, email, school, role, password_hash, specialization, license_number, is_available) 
VALUES (
  gen_random_uuid(),
  'Demo Doctor',
  'demodoc@demo.com',
  'Demo School',
  'doctor',
  '$2a$12$LQv3c1yqBwEHxv03ibjHVOVhqkqvlWBBHG6EsG8BPqTBaJt9z8ZFu',  -- password: 'demo123'
  'School Psychology',
  'DOC-12345',
  true
);

-- Create some sample class schedules for the demo teacher
INSERT INTO public.class_schedules (teacher_id, school, grade, subject, lesson_topic, class_date, class_time, duration_minutes, description)
SELECT 
  t.id,
  'Demo School',
  '10th Grade',
  'Mathematics',
  'Algebra Basics',
  CURRENT_DATE + INTERVAL '1 day',
  TIME '09:00:00',
  60,
  'Introduction to algebraic expressions and equations'
FROM public.teachers t 
WHERE t.email = 'demoteacher@demo.com'
UNION ALL
SELECT 
  t.id,
  'Demo School',
  '10th Grade',
  'Mathematics',
  'Geometry Fundamentals',
  CURRENT_DATE + INTERVAL '2 days',
  TIME '10:00:00',
  60,
  'Basic geometric shapes and properties'
FROM public.teachers t 
WHERE t.email = 'demoteacher@demo.com';

-- Create sample feedback entries
INSERT INTO public.feedback (class_schedule_id, student_id, student_name, is_anonymous, understanding, interest, educational_growth, emotional_state, what_went_well, suggestions, additional_comments)
SELECT 
  cs.id,
  s.id,
  s.full_name,
  false,
  4,
  5,
  4,
  'happy',
  'The teacher explained concepts clearly',
  'More interactive exercises would be helpful',
  'Really enjoyed the lesson!'
FROM public.class_schedules cs 
JOIN public.teachers t ON cs.teacher_id = t.id
JOIN public.students s ON s.full_name = 'Demo Student'
WHERE t.email = 'demoteacher@demo.com'
LIMIT 1;

-- Create sample mental health alert
INSERT INTO public.mental_health_alerts (student_id, student_name, school, grade, content, source_table, source_id, severity_level, alert_type)
SELECT 
  s.id,
  s.full_name,
  s.school,
  s.grade,
  'I have been feeling really stressed about exams lately',
  'feedback',
  gen_random_uuid(),
  2,
  'self_harm_language'
FROM public.students s 
WHERE s.full_name = 'Demo Student';
