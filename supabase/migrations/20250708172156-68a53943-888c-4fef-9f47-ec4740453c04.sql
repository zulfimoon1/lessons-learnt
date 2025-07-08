-- Add sample wellness entries for demo student to show wellness reporting functionality
INSERT INTO public.student_wellness (
  student_id,
  student_name,
  school,
  grade,
  mood,
  notes,
  created_at
) VALUES 
(
  'ac830b7a-1812-4e1c-8193-935f7f55f215',
  'demo student',
  'demo school',
  '5',
  'okay',
  'Feeling a bit stressed about the upcoming math test. Had trouble sleeping last night.',
  now() - interval '2 days'
),
(
  'ac830b7a-1812-4e1c-8193-935f7f55f215',
  'demo student',
  'demo school',
  '5',
  'good',
  'Had a great day today! Really enjoyed the science experiment we did in class.',
  now() - interval '1 day'
),
(
  'ac830b7a-1812-4e1c-8193-935f7f55f215',
  'demo student',
  'demo school',
  '5',
  'poor',
  'Not feeling great today. Had an argument with a friend and it made me really sad. I dont want to talk to anyone.',
  now() - interval '6 hours'
);