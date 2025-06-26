
-- Create teacher_notes table for storing teacher notes and uploaded articles
CREATE TABLE public.teacher_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  tags TEXT,
  school TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_url TEXT,
  file_name TEXT
);

-- Add Row Level Security (RLS)
ALTER TABLE public.teacher_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for teacher notes access
CREATE POLICY "Teachers can view notes from their school" 
  ON public.teacher_notes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE teachers.id = auth.uid() 
      AND teachers.school = teacher_notes.school
    )
  );

CREATE POLICY "Teachers can create notes for their school" 
  ON public.teacher_notes 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers 
      WHERE teachers.id = auth.uid() 
      AND teachers.school = teacher_notes.school
      AND teachers.id = teacher_notes.created_by
    )
  );

CREATE POLICY "Teachers can update their own notes" 
  ON public.teacher_notes 
  FOR UPDATE 
  USING (created_by = auth.uid());

CREATE POLICY "Teachers can delete their own notes" 
  ON public.teacher_notes 
  FOR DELETE 
  USING (created_by = auth.uid());

-- Create storage bucket for teacher files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('teacher-files', 'teacher-files', false);

-- Create storage policies
CREATE POLICY "Teachers can upload files to their school folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'teacher-files' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = 'teacher-notes'
);

CREATE POLICY "Teachers can view files from their school"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'teacher-files' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Teachers can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'teacher-files' AND
  auth.role() = 'authenticated'
);
