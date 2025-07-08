-- Create a function to add sample psychologist data
CREATE OR REPLACE FUNCTION public.add_sample_psychologist_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert sample psychologist for demo school if none exists
  IF NOT EXISTS (SELECT 1 FROM public.school_psychologists WHERE school = 'demo school') THEN
    INSERT INTO public.school_psychologists (name, email, phone, school, office_location, availability_hours) 
    VALUES ('Dr. Sarah Johnson', 'sarah.johnson@demoschool.edu', '(555) 123-4567', 'demo school', 'Room 205, Main Building', 'Monday-Friday 9:00 AM - 5:00 PM');
  END IF;

  -- Insert sample psychologist for Platform Administration if none exists  
  IF NOT EXISTS (SELECT 1 FROM public.school_psychologists WHERE school = 'Platform Administration') THEN
    INSERT INTO public.school_psychologists (name, email, phone, school, office_location, availability_hours) 
    VALUES ('Dr. Michael Chen', 'michael.chen@platform.edu', '(555) 987-6543', 'Platform Administration', 'Suite 300, Admin Building', 'Monday-Friday 8:00 AM - 4:00 PM');
  END IF;
END;
$function$;

-- Call the function to add the sample data
SELECT public.add_sample_psychologist_data();