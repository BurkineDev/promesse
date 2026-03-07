-- PromessTrack - Storage setup for package photos
-- Run this AFTER 001_initial_schema.sql

-- Create storage bucket for package photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'package-photos',
  'package-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated staff to upload photos
CREATE POLICY "package_photos_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'package-photos'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

-- Allow authenticated staff to update/delete photos
CREATE POLICY "package_photos_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'package-photos'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

CREATE POLICY "package_photos_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'package-photos'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'agent')
    )
  );

-- Public read (bucket is public, so anyone can view photos via URL)
CREATE POLICY "package_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'package-photos');
