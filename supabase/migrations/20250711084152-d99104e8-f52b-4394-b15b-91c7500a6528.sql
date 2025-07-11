-- Create a comprehensive function to handle calendar events with proper admin context
CREATE OR REPLACE FUNCTION public.admin_manage_calendar_event(
  admin_email_param text,
  operation_type text, -- 'insert' or 'update'
  event_id_param uuid DEFAULT NULL,
  title_param text DEFAULT NULL,
  event_type_param text DEFAULT NULL,
  start_date_param date DEFAULT NULL,
  end_date_param date DEFAULT NULL,
  description_param text DEFAULT NULL,
  color_param text DEFAULT '#dc2626',
  school_param text DEFAULT NULL,
  created_by_param uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_json json;
  event_record RECORD;
BEGIN
  -- Set platform admin context for the session
  PERFORM set_config('app.current_user_email', admin_email_param, false);
  PERFORM set_config('app.platform_admin', 'true', false);
  PERFORM set_config('app.admin_verified', 'true', false);
  PERFORM set_config('app.admin_context_set', 'true', false);
  
  -- Verify admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE email = admin_email_param 
    AND role = 'admin'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized: Not a platform admin'
    );
  END IF;
  
  IF operation_type = 'insert' THEN
    -- Insert new calendar event
    INSERT INTO public.school_calendar_events (
      title, event_type, start_date, end_date, description, color, school, created_by
    ) VALUES (
      title_param, event_type_param, start_date_param, 
      COALESCE(end_date_param, start_date_param), 
      description_param, color_param, school_param, created_by_param
    ) RETURNING * INTO event_record;
    
    result_json := json_build_object(
      'success', true,
      'operation', 'insert',
      'event', row_to_json(event_record)
    );
    
  ELSIF operation_type = 'update' THEN
    -- Update existing calendar event
    UPDATE public.school_calendar_events 
    SET 
      title = title_param,
      event_type = event_type_param,
      start_date = start_date_param,
      end_date = COALESCE(end_date_param, start_date_param),
      description = description_param,
      color = color_param,
      updated_at = now()
    WHERE id = event_id_param
    RETURNING * INTO event_record;
    
    IF NOT FOUND THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Event not found'
      );
    END IF;
    
    result_json := json_build_object(
      'success', true,
      'operation', 'update',
      'event', row_to_json(event_record)
    );
    
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid operation type'
    );
  END IF;
  
  RETURN result_json;
END;
$$;