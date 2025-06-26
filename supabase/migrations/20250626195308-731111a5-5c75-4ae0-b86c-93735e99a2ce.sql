
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow authenticated users to upload voice recordings" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read voice recordings" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own voice recordings" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to upload voice recordings" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to read voice recordings" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous users to delete voice recordings" ON storage.objects;

-- Create storage bucket for voice recordings if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-recordings', 'voice-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for voice recordings bucket
CREATE POLICY "Allow all users to upload voice recordings" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'voice-recordings');

CREATE POLICY "Allow all users to read voice recordings" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'voice-recordings');

CREATE POLICY "Allow all users to delete voice recordings" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'voice-recordings');
