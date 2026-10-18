-- =====================================================================
-- DIGITAL SHOWROOM — MIGRATION 002: MEDIA & TAXONOMY ENHANCEMENTS
-- =====================================================================
-- Extends the core database schema to support:
-- 1. Category cover imagery (taxonomy visual banners)
-- 2. Collection video walkthroughs and poster thumbnails
-- 
-- Safe & idempotent: Uses ADD COLUMN IF NOT EXISTS without altering security rules.
-- Product videos continue to be stored in the existing product_media table (type = 'video').
-- =====================================================================

-- 1. CATEGORY COVER IMAGES
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- 2. COLLECTION VIDEOS & POSTERS
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS video_poster_url TEXT;

-- 3. PRODUCT MEDIA THUMBNAIL / POSTER SUPPORT
ALTER TABLE product_media
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Verify RLS:
-- The existing RLS policies on categories, collections, and product_media automatically cover these new columns:
-- - Categories: Public can SELECT (true), Admins can ALL (is_admin()).
-- - Collections: Public can SELECT (is_published = true), Admins can ALL (is_admin()).
-- - Product Media: Public can SELECT (parent product is published), Admins can ALL (is_admin()).

