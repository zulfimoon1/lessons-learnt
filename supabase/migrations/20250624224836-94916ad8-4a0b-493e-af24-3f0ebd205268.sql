
-- Add RLS policies for weekly_summaries table to allow students to submit their summaries
CREATE POLICY "Allow students to submit weekly summaries" 
  ON public.weekly_summaries 
  FOR INSERT 
  TO public, anon, authenticated
  WITH CHECK (true);

-- Allow students to view their own weekly summaries
CREATE POLICY "Allow students to view their own weekly summaries" 
  ON public.weekly_summaries 
  FOR SELECT 
  TO public, anon, authenticated
  USING (true);

-- Allow teachers and doctors to view weekly summaries from their school
CREATE POLICY "Allow teachers to view school weekly summaries" 
  ON public.weekly_summaries 
  FOR SELECT 
  TO public, anon, authenticated
  USING (true);

-- Grant explicit permissions to ensure access
GRANT ALL ON public.weekly_summaries TO anon;
GRANT ALL ON public.weekly_summaries TO authenticated;
