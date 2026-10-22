-- =====================================================================
-- DIGITAL SHOWROOM — ROLLBACK SCRIPT FOR MIGRATION 006
-- =====================================================================
-- Reverts the tightened storage object policies from Migration 006 back
-- to the prior state defined in the live inventory and Migrations 001/004.
--
-- TARGET SUPABASE PROJECT: skpadbzwtprsuizvpyrd (https://skpadbzwtprsuizvpyrd.supabase.co)
--
-- WARNING:
-- Restoring the broad public SELECT policies below ("Villexa public select showroom assets"
-- or "Public can view published showroom assets") will re-enable anonymous directory listing
-- and will restore the Supabase Dashboard security alert:
-- "Bucket showroom-videos allows listing all files to anonymous users."
-- =====================================================================

-- 1. DROP CONSOLIDATED ADMIN POLICY CREATED BY MIGRATION 006
DROP POLICY IF EXISTS "Admins can list and manage all storage objects" ON storage.objects;

-- 2. RESTORE PRIOR ADMIN SELECT POLICY (FROM LIVE INVENTORY)
-- Re-establishes admin select permissions using the previous inventory name
DROP POLICY IF EXISTS "Villexa admins select storage objects" ON storage.objects;
CREATE POLICY "Villexa admins select storage objects"
ON storage.objects FOR SELECT
TO authenticated
USING (public.is_admin());

-- Also restore legacy vault policy if referenced
DROP POLICY IF EXISTS "Admins can access private vault files" ON storage.objects;
CREATE POLICY "Admins can access private vault files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'atelier-vault' AND public.is_admin());

-- 3. RESTORE BROAD PUBLIC SELECT POLICIES (FROM LIVE INVENTORY & MIGRATIONS 001/004)
-- WARNING: This re-exposes anonymous directory listing on storage.objects
DROP POLICY IF EXISTS "Villexa public select showroom assets" ON storage.objects;
CREATE POLICY "Villexa public select showroom assets"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id IN ('product-images', 'product-models', 'showroom-videos', '360-sequences'));

DROP POLICY IF EXISTS "Public can view published showroom assets" ON storage.objects;
CREATE POLICY "Public can view published showroom assets"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id IN ('product-images', 'product-models', 'showroom-videos', '360-sequences'));

DROP POLICY IF EXISTS "Public can view published showroom videos" ON storage.objects;
CREATE POLICY "Public can view published showroom videos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'showroom-videos');

DROP POLICY IF EXISTS "Public can view published product models" ON storage.objects;
CREATE POLICY "Public can view published product models"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-models');
