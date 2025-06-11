
-- Clean up test and demo data from the database (corrected version)
-- This will remove placeholder/test data while preserving your admin account

-- Remove test students
DELETE FROM public.students 
WHERE full_name IN ('test student', 'John Smith', 'Jane Doe', 'Demo Student')
   OR school IN ('Test School', 'Demo School', 'Test Academy');

-- Remove test teachers (except your admin account)
DELETE FROM public.teachers 
WHERE email != 'zulfimoon1@gmail.com' 
  AND (name = 'Test Teacher' OR school IN ('Test School', 'Demo School', 'Test Academy'));

-- Remove test feedback/responses
DELETE FROM public.feedback 
WHERE student_id IN (
  SELECT id FROM public.students 
  WHERE school IN ('Test School', 'Demo School', 'Test Academy')
);

-- Remove test subscriptions
DELETE FROM public.subscriptions 
WHERE school_name IN ('Test School', 'Demo School', 'Test Academy');

-- Note: feedback_analytics is a view, so it will automatically update when we delete the underlying feedback data

-- Verify what data remains
SELECT 
  (SELECT COUNT(*) FROM public.students) as total_students,
  (SELECT COUNT(*) FROM public.teachers) as total_teachers,
  (SELECT COUNT(*) FROM public.feedback) as total_feedback,
  (SELECT COUNT(*) FROM public.subscriptions) as total_subscriptions;
