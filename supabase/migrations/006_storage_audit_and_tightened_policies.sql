-- =====================================================================
-- DIGITAL SHOWROOM — MIGRATION 006: TIGHTENED STORAGE OBJECT POLICIES
-- =====================================================================
-- Resolves the Supabase Dashboard security warning:
-- "Bucket showroom-videos allows listing all files to anonymous users."
--
-- TARGET SUPABASE PROJECT: skpadbzwtprsuizvpyrd (https://skpadbzwtprsuizvpyrd.supabase.co)
--
-- ARCHITECTURAL PRINCIPLES:
-- 1. Direct Public CDN Streaming:
--    Buckets marked 'public = true' in storage.buckets ('showroom-videos',
--    'product-images', 'product-models', '360-sequences') serve assets directly
--    via public CDN URLs (GET /storage/v1/object/public/<bucket>/<path>)
--    without evaluating storage.objects RLS policies.
--    Public playback of the hero video (showroom-videos/hero/videos/1792270227821_5nt5cz_villexa-hero.mp4),
--    showroom videos, product images, GLB 3D models, and 360 sequences
--    remains completely functional across all paths without requiring any specific prefix.
--
-- 2. Storage API Listing (.list()) and PostgREST Table Queries:
--    The storage.objects SELECT policies govern client-side listing via
--    `supabase.storage.from(...).list()` and direct table queries.
--    In the live database, broad SELECT policies were granted to `anon`:
--      - "Villexa public select showroom assets"
--      - "Public can view published showroom assets" (Migration 001)
--      - "Public can view published showroom videos" (Migration 004)
--      - "Public can view published product models" (Migration 004)
--    These policies allowed anonymous users to list the entire directory tree
--    of public buckets, triggering the Supabase security finding.
--    Because PostgreSQL combines permissive policies with OR, EVERY broad
--    anonymous SELECT policy must be explicitly dropped.
--
-- 3. Consolidated Canonical Administrator Access:
--    Removes duplicate admin SELECT policies (e.g. "Villexa admins select storage objects")
--    and establishes a single canonical policy: "Admins can list and manage all storage objects"
--    granting authenticated administrators (public.is_admin() = true) full access
--    to list, scan, and inspect all 5 buckets (required by src/services/storageAuditService.ts).
--
-- 4. Protection of Private Staging (atelier-vault):
--    'atelier-vault' remains strictly private (public = false) and accessible
--    only by authorized administrators.
--
-- 5. Existing Admin Mutation Policies:
--    All existing INSERT, UPDATE, and DELETE policies (including "Villexa admins insert storage objects",
--    "Villexa admins update storage objects", "Villexa admins delete storage objects", and Migration 001/004
--    admin write policies) are fully preserved and retained untouched.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. DROP BROAD & OVERLAPPING SELECT POLICIES
-- ---------------------------------------------------------------------
-- Drop live database policies identified in inventory
DROP POLICY IF EXISTS "Villexa public select showroom assets" ON storage.objects;
DROP POLICY IF EXISTS "Villexa admins select storage objects" ON storage.objects;

-- Drop broad anonymous SELECT policies from Migrations 001 and 004
DROP POLICY IF EXISTS "Public can view published showroom assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view published showroom videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view published product models" ON storage.objects;
DROP POLICY IF EXISTS "Public can view published images" ON storage.objects;

-- Drop any intermediate draft variants
DROP POLICY IF EXISTS "Public can select published showroom videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can select published product models" ON storage.objects;
DROP POLICY IF EXISTS "Public can select published images and sequences" ON storage.objects;
DROP POLICY IF EXISTS "Public can access non-draft showroom objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can view public showroom objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list and view showroom videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list and view product models" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list and view all product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can access private vault files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can list and manage all storage objects" ON storage.objects;

-- ---------------------------------------------------------------------
-- 2. CREATE CANONICAL CONSOLIDATED ADMIN SELECT POLICY
-- ---------------------------------------------------------------------
-- Enables authorized administrators to execute .list() across all 5 buckets
-- (showroom-videos, product-images, product-models, 360-sequences, atelier-vault)
-- during storage audits, media management, and staged file recovery.
CREATE POLICY "Admins can list and manage all storage objects"
ON storage.objects FOR SELECT
TO authenticated
USING (
  public.is_admin()
);


