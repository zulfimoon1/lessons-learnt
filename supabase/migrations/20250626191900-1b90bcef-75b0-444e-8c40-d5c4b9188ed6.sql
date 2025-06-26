
-- Add voice note support to feedback table
ALTER TABLE public.feedback ADD COLUMN audio_url TEXT;
ALTER TABLE public.feedback ADD COLUMN transcription TEXT;
ALTER TABLE public.feedback ADD COLUMN audio_duration INTEGER;
ALTER TABLE public.feedback ADD COLUMN audio_file_size INTEGER;

-- Add voice note support to weekly_summaries table
ALTER TABLE public.weekly_summaries ADD COLUMN emotional_audio_url TEXT;
ALTER TABLE public.weekly_summaries ADD COLUMN emotional_transcription TEXT;
ALTER TABLE public.weekly_summaries ADD COLUMN academic_audio_url TEXT;
ALTER TABLE public.weekly_summaries ADD COLUMN academic_transcription TEXT;
ALTER TABLE public.weekly_summaries ADD COLUMN audio_duration INTEGER;
ALTER TABLE public.weekly_summaries ADD COLUMN audio_file_size INTEGER;

-- Add voice note support to chat_messages table
ALTER TABLE public.chat_messages ADD COLUMN audio_url TEXT;
ALTER TABLE public.chat_messages ADD COLUMN transcription TEXT;
ALTER TABLE public.chat_messages ADD COLUMN audio_duration INTEGER;
ALTER TABLE public.chat_messages ADD COLUMN audio_file_size INTEGER;

-- Create storage bucket for voice recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('voice-recordings', 'voice-recordings', true);

-- Create RLS policies for voice recordings bucket
CREATE POLICY "Allow authenticated users to upload voice recordings" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'voice-recordings' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to read voice recordings" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'voice-recordings' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to delete their own voice recordings" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'voice-recordings' AND auth.uid() IS NOT NULL);
