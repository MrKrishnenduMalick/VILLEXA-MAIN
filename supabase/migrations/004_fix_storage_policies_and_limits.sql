-- =====================================================================
-- DIGITAL SHOWROOM — MIGRATION 004: STORAGE POLICIES & QUOTA ALIGNMENT
-- =====================================================================
-- Fixes missing RLS policies on `showroom-videos` and `product-models`.
-- Aligns bucket quotas to support up to 100MB videos and 50MB 3D models.
-- Uses bucket-scoped, idempotent policies with is_admin() authorization.
-- =====================================================================

-- 1. ENSURE BUCKET DEFINITIONS AND QUOTAS IN storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('showroom-videos', 'showroom-videos', true, 104857600, ARRAY['video/mp4', 'video/webm']),
  ('product-models', 'product-models', true, 52428800, ARRAY['model/gltf-binary', 'application/octet-stream'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Ensure atelier-vault quota supports 100MB video draft staging
UPDATE storage.buckets
SET 
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'model/gltf-binary', 'application/octet-stream', 'video/mp4', 'video/webm']
WHERE id = 'atelier-vault';

-- 2. DEDICATED RLS POLICIES FOR showroom-videos BUCKET
-- Public can view/stream published showroom videos
DROP POLICY IF EXISTS "Public can view published showroom videos" ON storage.objects;
CREATE POLICY "Public can view published showroom videos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'showroom-videos');

-- Only authorized administrators can insert into showroom-videos
DROP POLICY IF EXISTS "Only admins can upload showroom videos" ON storage.objects;
CREATE POLICY "Only admins can upload showroom videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'showroom-videos' AND is_admin());

-- Only authorized administrators can update showroom-videos
DROP POLICY IF EXISTS "Only admins can update showroom videos" ON storage.objects;
CREATE POLICY "Only admins can update showroom videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'showroom-videos' AND is_admin())
WITH CHECK (bucket_id = 'showroom-videos' AND is_admin());

-- Only authorized administrators can delete showroom videos
DROP POLICY IF EXISTS "Only admins can delete showroom videos" ON storage.objects;
CREATE POLICY "Only admins can delete showroom videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'showroom-videos' AND is_admin());

-- 3. DEDICATED RLS POLICIES FOR product-models BUCKET
-- Public can download/view published GLB models
DROP POLICY IF EXISTS "Public can view published product models" ON storage.objects;
CREATE POLICY "Public can view published product models"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-models');

-- Only authorized administrators can insert into product-models
DROP POLICY IF EXISTS "Only admins can upload product models" ON storage.objects;
CREATE POLICY "Only admins can upload product models"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-models' AND is_admin());

-- Only authorized administrators can update product-models
DROP POLICY IF EXISTS "Only admins can update product models" ON storage.objects;
CREATE POLICY "Only admins can update product models"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-models' AND is_admin())
WITH CHECK (bucket_id = 'product-models' AND is_admin());

-- Only authorized administrators can delete product models
DROP POLICY IF EXISTS "Only admins can delete product models" ON storage.objects;
CREATE POLICY "Only admins can delete product models"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-models' AND is_admin());
