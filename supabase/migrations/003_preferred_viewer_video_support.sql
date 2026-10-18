-- =====================================================================
-- DIGITAL SHOWROOM — MIGRATION 003: PREFERRED VIEWER VIDEO SUPPORT
-- =====================================================================
-- Updates the products table's preferred_viewer check constraint to support
-- 'video' (Showcase Video) alongside 'gallery', 'glb_3d', and 'sequence_360'.
--
-- Safe & idempotent:
-- 1. Drops the existing products_preferred_viewer_check constraint if present.
-- 2. Adds the updated check constraint allowing ('gallery', 'glb_3d', 'sequence_360', 'video').
-- 3. Retains DEFAULT 'gallery' for backward compatibility.
-- 4. Preserves all existing table data, columns, and Row-Level Security (RLS) policies.
-- =====================================================================

-- 1. DROP EXISTING CHECK CONSTRAINT IF IT EXISTS
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_preferred_viewer_check;

-- 2. ADD UPDATED CHECK CONSTRAINT WITH 'video' SUPPORT
ALTER TABLE products
ADD CONSTRAINT products_preferred_viewer_check
CHECK (preferred_viewer IN ('gallery', 'glb_3d', 'sequence_360', 'video'));

-- 3. ENSURE DEFAULT REMAINS 'gallery'
ALTER TABLE products
ALTER COLUMN preferred_viewer SET DEFAULT 'gallery';
