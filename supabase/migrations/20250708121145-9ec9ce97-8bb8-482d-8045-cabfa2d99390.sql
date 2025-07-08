-- Create school calendar events table for term dates and holidays
CREATE TABLE public.school_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school TEXT NOT NULL,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('term_start', 'term_end', 'holiday', 'red_day', 'school_event')),
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  color TEXT DEFAULT '#dc2626', -- Default red color for holidays
  is_recurring BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.teachers(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.school_calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "School admins can manage calendar events for their school"
ON public.school_calendar_events
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid() 
    AND t.school = school_calendar_events.school 
    AND t.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid() 
    AND t.school = school_calendar_events.school 
    AND t.role = 'admin'
  )
);

CREATE POLICY "Teachers and doctors can view calendar events for their school"
ON public.school_calendar_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.id = auth.uid() 
    AND t.school = school_calendar_events.school
  ) OR
  EXISTS (
    SELECT 1 FROM public.students s
    WHERE s.id = auth.uid() 
    AND s.school = school_calendar_events.school
  )
);

CREATE POLICY "Platform admin full access to school_calendar_events"
ON public.school_calendar_events
FOR ALL
USING (is_verified_platform_admin())
WITH CHECK (is_verified_platform_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_school_calendar_events_updated_at
BEFORE UPDATE ON public.school_calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for demo school
INSERT INTO public.school_calendar_events (school, title, event_type, start_date, end_date, description, color) VALUES
('demo school', 'Autumn Term Start', 'term_start', '2024-09-04', '2024-09-04', 'First day of Autumn term', '#059669'),
('demo school', 'Autumn Term End', 'term_end', '2024-12-15', '2024-12-15', 'Last day of Autumn term', '#dc2626'),
('demo school', 'Spring Term Start', 'term_start', '2025-01-08', '2025-01-08', 'First day of Spring term', '#059669'),
('demo school', 'Spring Term End', 'term_end', '2025-03-28', '2025-03-28', 'Last day of Spring term', '#dc2626'),
('demo school', 'Summer Term Start', 'term_start', '2025-04-15', '2025-04-15', 'First day of Summer term', '#059669'),
('demo school', 'Summer Term End', 'term_end', '2025-07-20', '2025-07-20', 'Last day of Summer term', '#dc2626'),
('demo school', 'Christmas Day', 'holiday', '2024-12-25', '2024-12-25', 'National Holiday', '#dc2626'),
('demo school', 'New Year''s Day', 'holiday', '2025-01-01', '2025-01-01', 'National Holiday', '#dc2626'),
('demo school', 'Independence Day', 'holiday', '2025-07-04', '2025-07-04', 'National Holiday', '#dc2626'),
('demo school', 'Thanksgiving', 'holiday', '2024-11-28', '2024-11-28', 'National Holiday', '#dc2626');

-- Add index for better performance
CREATE INDEX idx_school_calendar_events_school_date ON public.school_calendar_events(school, start_date);
CREATE INDEX idx_school_calendar_events_type ON public.school_calendar_events(event_type);