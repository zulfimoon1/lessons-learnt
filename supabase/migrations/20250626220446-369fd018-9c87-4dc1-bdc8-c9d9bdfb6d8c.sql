
-- Continue fixing remaining database functions with search_path security warnings

-- Update process_expired_discounts function
CREATE OR REPLACE FUNCTION public.process_expired_discounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_subscription RECORD;
BEGIN
  -- Find subscriptions with expired discounts
  FOR expired_subscription IN 
    SELECT s.id, s.school_name, s.stripe_subscription_id, s.original_amount,
           t.email as admin_email, s.discount_code_id
    FROM public.subscriptions s
    JOIN public.teachers t ON t.school = s.school_name AND t.role = 'admin'
    WHERE s.discount_expires_at IS NOT NULL 
      AND s.discount_expires_at <= now()
      AND s.amount < s.original_amount
  LOOP
    -- Update subscription to original amount
    UPDATE public.subscriptions 
    SET amount = expired_subscription.original_amount,
        discount_code_id = NULL,
        discount_expires_at = NULL
    WHERE id = expired_subscription.id;
    
    -- Schedule payment due notification
    INSERT INTO public.payment_notifications (
      subscription_id, school_name, admin_email, 
      notification_type, scheduled_for
    ) VALUES (
      expired_subscription.id, 
      expired_subscription.school_name,
      expired_subscription.admin_email,
      'payment_due',
      now() + interval '1 day'
    );
  END LOOP;
END;
$$;

-- Update schedule_discount_notifications function
CREATE OR REPLACE FUNCTION public.schedule_discount_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  -- Find subscriptions with discounts ending in 7 days
  FOR subscription_record IN 
    SELECT s.id, s.school_name, s.discount_expires_at,
           t.email as admin_email
    FROM public.subscriptions s
    JOIN public.teachers t ON t.school = s.school_name AND t.role = 'admin'
    WHERE s.discount_expires_at IS NOT NULL 
      AND s.discount_expires_at BETWEEN now() + interval '6 days' AND now() + interval '8 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.payment_notifications pn 
        WHERE pn.subscription_id = s.id 
          AND pn.notification_type = 'discount_ending'
          AND pn.sent_at IS NULL
      )
  LOOP
    -- Schedule discount ending notification
    INSERT INTO public.payment_notifications (
      subscription_id, school_name, admin_email, 
      notification_type, scheduled_for
    ) VALUES (
      subscription_record.id, 
      subscription_record.school_name,
      subscription_record.admin_email,
      'discount_ending',
      subscription_record.discount_expires_at - interval '7 days'
    );
  END LOOP;
END;
$$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table for students or teachers based on metadata
  IF NEW.raw_user_meta_data->>'user_type' = 'student' THEN
    INSERT INTO public.profiles (
      id, 
      full_name, 
      school, 
      grade, 
      role
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'school',
      NEW.raw_user_meta_data->>'grade',
      'student'
    );
  ELSIF NEW.raw_user_meta_data->>'user_type' = 'teacher' THEN
    INSERT INTO public.teacher_profiles (
      id,
      name,
      email,
      school,
      role,
      specialization
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'name',
      NEW.email,
      NEW.raw_user_meta_data->>'school',
      COALESCE(NEW.raw_user_meta_data->>'role', 'teacher'),
      NEW.raw_user_meta_data->>'specialization'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update generate_temporary_password function
CREATE OR REPLACE FUNCTION public.generate_temporary_password()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  temp_password TEXT;
  adjectives TEXT[] := ARRAY['quick', 'brave', 'smart', 'kind', 'bright', 'calm', 'bold', 'wise', 'neat', 'cool'];
  nouns TEXT[] := ARRAY['lion', 'eagle', 'tiger', 'bear', 'wolf', 'fox', 'owl', 'hawk', 'star', 'moon'];
  numbers TEXT[] := ARRAY['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
BEGIN
  -- Generate a readable temporary password like "brave-lion-05"
  temp_password := adjectives[floor(random() * array_length(adjectives, 1) + 1)] || 
                   '-' || 
                   nouns[floor(random() * array_length(nouns, 1) + 1)] || 
                   '-' || 
                   numbers[floor(random() * array_length(numbers, 1) + 1)];
  
  RETURN temp_password;
END;
$$;

-- Update detect_self_harm_language function
CREATE OR REPLACE FUNCTION public.detect_self_harm_language(text_content text)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  severity INTEGER := 0;
  high_risk_keywords TEXT[] := ARRAY['kill myself', 'end my life', 'want to die', 'suicide', 'hurt myself', 'cut myself'];
  medium_risk_keywords TEXT[] := ARRAY['hopeless', 'worthless', 'hate myself', 'better off dead', 'no point living', 'cant go on'];
  low_risk_keywords TEXT[] := ARRAY['depressed', 'sad all the time', 'feel empty', 'dont care anymore', 'tired of everything'];
  keyword TEXT;
  lower_content TEXT;
BEGIN
  lower_content := LOWER(text_content);
  
  -- Check for high-risk keywords (severity 5)
  FOREACH keyword IN ARRAY high_risk_keywords LOOP
    IF lower_content LIKE '%' || keyword || '%' THEN
      RETURN 5;
    END IF;
  END LOOP;
  
  -- Check for medium-risk keywords (severity 3)
  FOREACH keyword IN ARRAY medium_risk_keywords LOOP
    IF lower_content LIKE '%' || keyword || '%' THEN
      severity := GREATEST(severity, 3);
    END IF;
  END LOOP;
  
  -- Check for low-risk keywords (severity 1)
  FOREACH keyword IN ARRAY low_risk_keywords LOOP
    IF lower_content LIKE '%' || keyword || '%' THEN
      severity := GREATEST(severity, 1);
    END IF;
  END LOOP;
  
  RETURN severity;
END;
$$;
