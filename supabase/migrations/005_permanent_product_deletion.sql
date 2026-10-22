-- =====================================================================
-- DIGITAL SHOWROOM — MIGRATION 005: PERMANENT PRODUCT DELETION RPC
-- =====================================================================
-- Provides an atomic, transaction-safe database procedure to delete
-- a product and all its dependent rows (media, finishes, 360 sequences)
-- while safely preserving customer enquiries (unlinking via SET NULL).
--
-- SECURITY & COMPATIBILITY AUDIT:
-- 1. SECURITY DEFINER hardening: Explicitly sets `search_path = public, pg_temp`
--    to prevent search-path hijacking attacks.
-- 2. Schema-qualification: All table references (products, product_media,
--    product_finishes, product_sequences_360, enquiries) and function calls
--    (is_admin) are explicitly schema-qualified.
-- 3. Secure caller check: Enforces `public.is_admin()`, which inspects
--    `auth.uid()` against `public.app_admins`. Anonymous and non-admin
--    authenticated accounts are rejected with SQLSTATE '42501'.
-- 4. Error reporting: Returns standard SQLSTATE 'P0002' if the target product
--    does not exist.
-- 5. Foreign Key Integrity: Unlinks customer enquiries (`SET product_id = NULL`)
--    so historical client contact records are never lost.
-- 6. Storage Decoupling: Storage object deletion is intentionally NOT executed
--    within this PostgreSQL transaction. The frontend admin service gathers
--    candidate storage paths, verifies exclusive unshared ownership, executes
--    this atomic database deletion, and subsequently removes the storage files
--    using a durable, retryable cleanup manifest.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.delete_product_permanent(target_product_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_product RECORD;
  v_media_count INT := 0;
  v_finishes_count INT := 0;
  v_sequences_count INT := 0;
  v_enquiries_count INT := 0;
BEGIN
  -- 1. Authorization: Executing user must be an authorized admin in app_admins
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only authorized administrators can permanently delete products.'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Verify target product exists
  SELECT id, name, slug, sku INTO v_product
  FROM public.products
  WHERE id = target_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with ID % not found.', target_product_id
      USING ERRCODE = 'P0002';
  END IF;

  -- 3. Audit dependent records count prior to removal
  SELECT COUNT(*) INTO v_media_count FROM public.product_media WHERE product_id = target_product_id;
  SELECT COUNT(*) INTO v_finishes_count FROM public.product_finishes WHERE product_id = target_product_id;
  SELECT COUNT(*) INTO v_sequences_count FROM public.product_sequences_360 WHERE product_id = target_product_id;
  SELECT COUNT(*) INTO v_enquiries_count FROM public.enquiries WHERE product_id = target_product_id;

  -- 4. Preserve customer enquiries by nullifying foreign key references
  UPDATE public.enquiries
  SET product_id = NULL
  WHERE product_id = target_product_id;

  -- 5. Delete dependent media records in reverse dependency order
  DELETE FROM public.product_sequences_360 WHERE product_id = target_product_id;
  DELETE FROM public.product_finishes WHERE product_id = target_product_id;
  DELETE FROM public.product_media WHERE product_id = target_product_id;

  -- 6. Delete the core product record
  DELETE FROM public.products WHERE id = target_product_id;

  RETURN jsonb_build_object(
    'success', true,
    'product_id', target_product_id,
    'product_name', v_product.name,
    'product_sku', v_product.sku,
    'deleted_media_count', v_media_count,
    'deleted_finishes_count', v_finishes_count,
    'deleted_sequences_count', v_sequences_count,
    'unlinked_enquiries_count', v_enquiries_count
  );
END;
$$;

-- Function permissions: Explicitly revoke from PUBLIC and anon; grant strictly to authenticated
REVOKE ALL ON FUNCTION public.delete_product_permanent(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_product_permanent(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_product_permanent(UUID) TO authenticated;
