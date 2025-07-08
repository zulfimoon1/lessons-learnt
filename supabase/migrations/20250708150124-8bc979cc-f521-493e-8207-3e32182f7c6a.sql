-- Fix platform admin authentication for zulfimoon1@gmail.com
-- Update to a working password hash for 'admin123'

UPDATE public.teachers 
SET password_hash = '6f3a97b7a4885466517ebd31cc9e716825904e0ce2703e78fa9c86276a225259'
WHERE email = 'zulfimoon1@gmail.com';

-- Ensure the admin has the right name
UPDATE public.teachers 
SET name = 'Zulfimoon Admin'
WHERE email = 'zulfimoon1@gmail.com';