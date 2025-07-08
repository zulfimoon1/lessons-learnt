-- Enable real-time updates for school calendar events
ALTER TABLE public.school_calendar_events REPLICA IDENTITY FULL;

-- Add school_calendar_events to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.school_calendar_events;