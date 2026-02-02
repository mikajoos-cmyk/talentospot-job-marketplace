-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('cvs', 'cvs', true),
  ('portfolios', 'portfolios', true),
  ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own CVs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own CVs" ON storage.objects;
DROP POLICY IF EXISTS "CVs are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own CVs" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload their own portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Portfolio images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own portfolio images" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Documents are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- CVs bucket policies
CREATE POLICY "Users can upload their own CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own CVs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "CVs are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cvs');

CREATE POLICY "Users can delete their own CVs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'cvs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Portfolios bucket policies
CREATE POLICY "Users can upload their own portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Portfolio images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolios');

CREATE POLICY "Users can delete their own portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolios' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Documents bucket policies
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Documents are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'documents');

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
