-- ============================================================
-- Script 008: Create Supabase Storage Bucket for Equipment Images
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Create the equipment-images storage bucket (public read access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-images',
  'equipment-images',
  true,         -- Public bucket so images are accessible without auth
  5242880,      -- 5MB max file size
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Storage RLS Policies
-- ============================================================

-- Policy 1: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload equipment images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'equipment-images');

-- Policy 2: Anyone can view/download equipment images (public gallery)
CREATE POLICY "Anyone can view equipment images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'equipment-images');

-- Policy 3: Owners can delete/update their own uploaded images
CREATE POLICY "Users can update their own equipment images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'equipment-images' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own equipment images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'equipment-images' AND auth.uid() = owner);
