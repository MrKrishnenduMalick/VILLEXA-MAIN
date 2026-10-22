-- =====================================================================
-- DIGITAL SHOWROOM — MIGRATION 005: PERMANENT PRODUCT DELETION RPC
-- =====================================================================
-- Provides an atomic, transaction-safe database procedure to delete
-- a product and all its dependent rows (media, finishes, 360 sequences)
-- while safely preserving customer enquiries (unlinking via SET NULL).
-- Strictly guarded by is_admin() authorization.
-- =====================================================================

CREATE OR REPLACE FUNCTION delete_product_permanent(target_product_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product RECORD;
  v_media_count INT := 0;
  v_finishes_count INT := 0;
  v_sequences_count INT := 0;
  v_enquiries_count INT := 0;
BEGIN
  -- 1. Authorization: Executing user must be an authorized admin in app_admins
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only authorized administrators can permanently delete products.';
  END IF;

  -- 2. Verify target product exists
  SELECT id, name, slug, sku INTO v_product
  FROM products
  WHERE id = target_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with ID % not found.', target_product_id;
  END IF;

  -- 3. Audit dependent records count prior to removal
  SELECT COUNT(*) INTO v_media_count FROM product_media WHERE product_id = target_product_id;
  SELECT COUNT(*) INTO v_finishes_count FROM product_finishes WHERE product_id = target_product_id;
  SELECT COUNT(*) INTO v_sequences_count FROM product_sequences_360 WHERE product_id = target_product_id;
  SELECT COUNT(*) INTO v_enquiries_count FROM enquiries WHERE product_id = target_product_id;

  -- 4. Preserve customer enquiries by nullifying foreign key references
  UPDATE enquiries
  SET product_id = NULL
  WHERE product_id = target_product_id;

  -- 5. Delete dependent media records in reverse dependency order
  DELETE FROM product_sequences_360 WHERE product_id = target_product_id;
  DELETE FROM product_finishes WHERE product_id = target_product_id;
  DELETE FROM product_media WHERE product_id = target_product_id;

  -- 6. Delete the core product record
  DELETE FROM products WHERE id = target_product_id;

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

-- Grant execution to authenticated users (is_admin() enforces admin check inside)
REVOKE ALL ON FUNCTION delete_product_permanent(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION delete_product_permanent(UUID) TO authenticated;
