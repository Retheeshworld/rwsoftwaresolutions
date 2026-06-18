CREATE POLICY "Resume owners can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Resume owners can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'resumes'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);