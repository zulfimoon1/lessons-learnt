
-- Add grade_level for existing students based on their grade text
UPDATE students 
SET grade_level = CASE 
  WHEN LOWER(grade) LIKE '%kindergarten%' OR LOWER(grade) LIKE '%k%' THEN 0
  WHEN LOWER(grade) LIKE '%1%' OR LOWER(grade) = 'grade 1' OR LOWER(grade) = 'first grade' THEN 1
  WHEN LOWER(grade) LIKE '%2%' OR LOWER(grade) = 'grade 2' OR LOWER(grade) = 'second grade' THEN 2
  WHEN LOWER(grade) LIKE '%3%' OR LOWER(grade) = 'grade 3' OR LOWER(grade) = 'third grade' THEN 3
  WHEN LOWER(grade) LIKE '%4%' OR LOWER(grade) = 'grade 4' OR LOWER(grade) = 'fourth grade' THEN 4
  WHEN LOWER(grade) LIKE '%5%' OR LOWER(grade) = 'grade 5' OR LOWER(grade) = 'fifth grade' THEN 5
  WHEN LOWER(grade) LIKE '%6%' OR LOWER(grade) = 'grade 6' OR LOWER(grade) = 'sixth grade' THEN 6
  WHEN LOWER(grade) LIKE '%7%' OR LOWER(grade) = 'grade 7' OR LOWER(grade) = 'seventh grade' THEN 7
  WHEN LOWER(grade) LIKE '%8%' OR LOWER(grade) = 'grade 8' OR LOWER(grade) = 'eighth grade' THEN 8
  WHEN LOWER(grade) LIKE '%9%' OR LOWER(grade) = 'grade 9' OR LOWER(grade) = 'ninth grade' THEN 9
  WHEN LOWER(grade) LIKE '%10%' OR LOWER(grade) = 'grade 10' OR LOWER(grade) = 'tenth grade' THEN 10
  WHEN LOWER(grade) LIKE '%11%' OR LOWER(grade) = 'grade 11' OR LOWER(grade) = 'eleventh grade' THEN 11
  WHEN LOWER(grade) LIKE '%12%' OR LOWER(grade) = 'grade 12' OR LOWER(grade) = 'twelfth grade' THEN 12
  ELSE 6 -- Default to grade 6 if we can't determine
END
WHERE grade_level IS NULL;
