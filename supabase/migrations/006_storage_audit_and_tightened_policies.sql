
-- =====================================================================
-- VILLEXA — MIGRATION 006: STORAGE POLICY HARDENING
-- =====================================================================
-- IMPORTANT:
-- Review existing policies and bucket visibility before production use.
-- Public bucket CDN playback is separate from Storage API listing.
-- This migration does not delete any Storage objects.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. REMOVE KNOWN LEGACY SELECT POLICIES
-- ---------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can view published showroom assets"
  ON storage.objects;
DROP POLICY IF EXISTS "Public can view published showroom videos"
  ON storage.objects;
DROP POLICY IF EXISTS "Public can view published product models"
  ON storage.objects;
DROP POLICY IF EXISTS "Public can view published images"
  ON storage.objects;
DROP POLICY IF EXISTS "Public can select published showroom videos"
  ON storage.objects;
DROP POLICY IF EXISTS "Public can select published product models"
  ON storage.objects;
DROP POLICY IF EXISTS "Public can select published images and sequences"
  ON storage.objects;
DROP POLICY IF EXISTS "Admins can list and view showroom videos"
  ON storage.objects;
DROP POLICY IF EXISTS "Admins can list and view product models"
  ON storage.objects;
DROP POLICY IF EXISTS "Admins can list and view all product images"
  ON storage.objects;
DROP POLICY IF EXISTS "Admins can access private vault files"
  ON storage.objects;
DROP POLICY IF EXISTS "Admins can list and manage all storage objects"
  ON storage.objects;
DROP POLICY IF EXISTS "Public can access non-draft showroom objects"
  ON storage.objects;
DROP POLICY IF EXISTS "Public can view public showroom objects"
  ON storage.objects;

-- ---------------------------------------------------------------------
-- 2. ADMIN SELECT ACCESS
-- ---------------------------------------------------------------------

CREATE POLICY "Villexa admins select storage objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- ---------------------------------------------------------------------
-- 3. ADMIN INSERT ACCESS
-- ---------------------------------------------------------------------

CREATE POLICY "Villexa admins insert storage objects"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
);

-- ---------------------------------------------------------------------
-- 4. ADMIN UPDATE ACCESS
-- ---------------------------------------------------------------------

CREATE POLICY "Villexa admins update storage objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);

-- ---------------------------------------------------------------------
-- 5. ADMIN DELETE ACCESS
-- ---------------------------------------------------------------------

CREATE POLICY "Villexa admins delete storage objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

-- ---------------------------------------------------------------------
-- 6. PUBLIC STORAGE API SELECT ACCESS FOR INTENDED PUBLIC BUCKETS
--
-- Public bucket CDN playback is controlled by bucket visibility.
-- This policy permits listing/querying non-staging objects in these
-- buckets. Review whether every listed asset is intended to be public.
-- ---------------------------------------------------------------------

CREATE POLICY "Villexa public select showroom assets"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id IN (
    'showroom-videos',
    'product-images',
    'product-models',
    '360-sequences'
  )
  AND name NOT LIKE 'drafts/%'
  AND name NOT LIKE 'staging/%'
  AND name NOT LIKE 'temp/%'
  AND name NOT LIKE '.%'
);

-- ---------------------------------------------------------------------
-- 7. PRIVATE ATELIER VAULT
--
-- No public SELECT policy is created for atelier-vault.
-- Admin access is covered by the admin policies above.
-- This migration does not change storage.buckets.public.
-- ---------------------------------------------------------------------

COMMIT;

-- =====================================================================
-- POST-MIGRATION VERIFICATION
-- =====================================================================

SELECT
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;
