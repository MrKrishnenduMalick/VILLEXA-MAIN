
-- =====================================================================
-- VILLEXA - MIGRATION 006: TIGHTEN STORAGE SELECT POLICIES
-- =====================================================================
-- Remove known public Storage listing policies.
-- Preserve existing INSERT, UPDATE, and DELETE policies.
-- Keep administrator listing access.
-- Do not change bucket visibility or delete Storage files.
-- =====================================================================

BEGIN;

-- 1. Remove known public SELECT policies
DROP POLICY IF EXISTS "Villexa public select showroom assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view published showroom assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view published showroom videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view published product models" ON storage.objects;
DROP POLICY IF EXISTS "Public can view published images" ON storage.objects;
DROP POLICY IF EXISTS "Public can select published showroom videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can select published product models" ON storage.objects;
DROP POLICY IF EXISTS "Public can select published images and sequences" ON storage.objects;
DROP POLICY IF EXISTS "Public can access non-draft showroom objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can view public showroom objects" ON storage.objects;

-- 2. Remove duplicate or superseded SELECT policies
DROP POLICY IF EXISTS "Villexa admins select storage objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list and view showroom videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list and view product models" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list and view all product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can access private vault files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list and manage all storage objects" ON storage.objects;

-- 3. Allow authenticated administrators to list Storage objects
CREATE POLICY "Admins can list and manage all storage objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (public.is_admin());

COMMIT;
