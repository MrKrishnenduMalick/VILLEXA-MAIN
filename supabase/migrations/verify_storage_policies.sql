-- =====================================================================
-- DIGITAL SHOWROOM — STORAGE POLICIES VERIFICATION QUERIES
-- =====================================================================
-- Run these read-only queries in the Supabase Dashboard SQL Editor
-- (Project skpadbzwtprsuizvpyrd) to inspect and verify storage policies.
-- =====================================================================

-- ---------------------------------------------------------------------
-- VERIFICATION QUERY 1: COMPLETE INVENTORY OF ALL storage.objects POLICIES
-- ---------------------------------------------------------------------
-- Lists every active policy on storage.objects across all commands
-- (SELECT, INSERT, UPDATE, DELETE), displaying its target roles and expressions.
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd AS command,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY cmd, policyname;

-- ---------------------------------------------------------------------
-- VERIFICATION QUERY 2: SPECIFIC AUDIT OF REMAINING SELECT POLICIES
-- ---------------------------------------------------------------------
-- After applying Migration 006, run this query to verify that:
-- 1. EXACTLY ONE SELECT policy remains: "Admins can list and manage all storage objects"
--    with roles = {authenticated} and using_expression = public.is_admin().
-- 2. ZERO broad anonymous SELECT policies remain (e.g. no "Villexa public select showroom assets",
--    no "Public can view published showroom assets", etc.).
-- 3. Any unexpected or unmanaged SELECT policy is immediately surfaced for inspection.
SELECT 
    policyname,
    roles,
    qual AS using_expression,
    CASE 
        WHEN 'anon' = ANY(roles) OR roles = '{public}' THEN 'ALERT: Anonymous SELECT Active'
        WHEN policyname = 'Admins can list and manage all storage objects' THEN 'OK: Canonical Admin Policy'
        ELSE 'WARNING: Unexpected SELECT Policy'
    END AS policy_status
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd = 'SELECT'
ORDER BY policyname;

-- ---------------------------------------------------------------------
-- VERIFICATION QUERY 3: VERIFY storage.buckets VISIBILITY
-- ---------------------------------------------------------------------
-- Confirms that the 4 showroom buckets remain public for direct CDN access,
-- while atelier-vault remains strictly private.
SELECT 
    id AS bucket_name,
    public AS is_public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY id;
