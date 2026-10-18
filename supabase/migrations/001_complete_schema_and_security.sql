-- =====================================================================
-- VILLEXA HAUTE FURNITURE SHOWROOM — MASTER DATABASE & SECURITY MIGRATION
-- Migration: 001_complete_schema_and_security.sql
-- =====================================================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- 1. EXPLICIT ADMINISTRATOR AUTHORIZATION TABLE & FUNCTION
-- =====================================================================
-- A normal authenticated account will NEVER automatically become an admin.
-- Only accounts explicitly recorded in app_admins have administrative rights.

CREATE TABLE IF NOT EXISTS app_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE app_admins ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the executing user is an authorized admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM app_admins WHERE user_id = auth.uid()
  );
END;
$$;

-- Function permissions: Explicitly grant execution to anon and authenticated
REVOKE ALL ON FUNCTION is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin() TO anon, authenticated;

-- RLS on app_admins:
-- Authenticated users can ONLY SELECT their own row to verify admin status.
-- INSERT/UPDATE/DELETE on app_admins is completely blocked from client API;
-- administrator provisioning is performed strictly via Supabase Dashboard SQL Editor or service_role.
CREATE POLICY "Admins can view their own admin record"
ON app_admins FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- =====================================================================
-- 2. CATEGORIES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view all categories"
ON categories FOR SELECT
TO anon, authenticated
USING (TRUE);

CREATE POLICY "Admins can manage categories"
ON categories FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================================
-- 3. COLLECTIONS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  headline TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_published ON collections(is_published);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can only view published collections"
ON collections FOR SELECT
TO anon, authenticated
USING (is_published = TRUE);

CREATE POLICY "Admins can view and manage all collections"
ON collections FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================================
-- 4. PRODUCTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  
  -- Strict monetary fields
  regular_price NUMERIC(12, 2),
  sale_price NUMERIC(12, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  show_price_publicly BOOLEAN NOT NULL DEFAULT TRUE,
  is_enquiry_only BOOLEAN NOT NULL DEFAULT FALSE,

  -- Editorial content
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  materials TEXT NOT NULL,
  care_instructions TEXT,
  
  -- Dimensions JSONB: { width, depth, height, seatHeight, unit }
  dimensions JSONB,

  -- Primary media & viewer preference
  primary_image_url TEXT,
  preferred_viewer TEXT NOT NULL DEFAULT 'gallery' CHECK (preferred_viewer IN ('gallery', 'glb_3d', 'sequence_360')),

  -- Organization & SEO
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,

  -- Publication status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can only read published products"
ON products FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Admins have full access to products"
ON products FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================================
-- 5. PRODUCT MEDIA TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'thumbnail', 'video', 'glb_model', 'sequence_frame')),
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  alt_text TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_media_product ON product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_type ON product_media(type);

ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view media for published products"
ON product_media FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_media.product_id
      AND products.status = 'published'
  )
);

CREATE POLICY "Admins can manage all product media"
ON product_media FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================================
-- 6. PRODUCT FINISHES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS product_finishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  material_name TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_finishes_product ON product_finishes(product_id);

ALTER TABLE product_finishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view finishes for published products"
ON product_finishes FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_finishes.product_id
      AND products.status = 'published'
  )
);

CREATE POLICY "Admins can manage product finishes"
ON product_finishes FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================================
-- 7. 360-DEGREE IMAGE SEQUENCES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS product_sequences_360 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sequence_identifier TEXT NOT NULL DEFAULT 'primary',
  frame_index INT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_sequence_frame UNIQUE (product_id, sequence_identifier, frame_index)
);

CREATE INDEX IF NOT EXISTS idx_sequences_product ON product_sequences_360(product_id);

ALTER TABLE product_sequences_360 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view 360 sequences for published products"
ON product_sequences_360 FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = product_sequences_360.product_id
      AND products.status = 'published'
  )
);

CREATE POLICY "Admins can manage 360 sequences"
ON product_sequences_360 FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- =====================================================================
-- 8. SITE SETTINGS & SHOWROOM MEDIA CONFIGURATION
-- =====================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
ON site_settings FOR SELECT
TO anon, authenticated
USING (TRUE);

CREATE POLICY "Only admins can modify site settings"
ON site_settings FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Seed default site settings
INSERT INTO site_settings (key, value) VALUES
('hero', '{
  "kicker": "HAUTE ÉBÉNISTERIE & ARCHITECTURE",
  "title": "Pure Architectural Form Meets Bespoke Craftsmanship",
  "subtitle": "Villexa curates timeless interior masterworks. Sculptural silhouettes, organic materials, and deliberate proportions crafted for refined living spaces.",
  "primaryCtaLabel": "Explore Catalogue",
  "primaryCtaLink": "/catalogue",
  "secondaryCtaLabel": "Request Commission",
  "secondaryCtaLink": "/contact",
  "mediaType": "none",
  "mediaUrl": null,
  "posterUrl": null
}'::jsonb),
('showroom_media', '{
  "enabled": false,
  "sectionTitle": "The Atelier Atmosphere",
  "sectionSubtitle": "An intimate glimpse into our material joinery and spatial compositions.",
  "videoUrl": null,
  "posterUrl": null,
  "autoPlay": false,
  "loop": false
}'::jsonb),
('brand', '{
  "brandName": "VILLEXA",
  "tagline": "Haute Ébénisterie & Architecture",
  "contactEmail": "concierge@villexa.com",
  "contactPhone": "+1 (800) 482-1980",
  "whatsappNumber": "+18004821980",
  "showroomAddress": "Via della Spiga 28, 20121 Milano, Italy",
  "visitingHours": "Monday – Saturday: 10:00 to 19:00 (By Appointment Only)",
  "socialInstagram": "https://instagram.com/villexaofficial",
  "socialPinterest": "https://pinterest.com/villexaofficial"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- =====================================================================
-- 9. CUSTOMER ENQUIRIES TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('general', 'product_quotation', 'private_viewing', 'bespoke_commission')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_contact TEXT NOT NULL DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'whatsapp')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'contacted', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Public visitors can submit (INSERT) enquiries with strict anti-spam & syntax validation
CREATE POLICY "Public can submit an enquiry"
ON enquiries FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(full_name)) BETWEEN 2 AND 100 AND
  length(trim(email)) BETWEEN 5 AND 255 AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(trim(message)) BETWEEN 5 AND 5000 AND
  status = 'new'
);

-- STRICT PRIVACY: Public visitors can NEVER select, update, or delete existing enquiries
CREATE POLICY "Only authorized admins can view enquiries"
ON enquiries FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Only authorized admins can update or delete enquiries"
ON enquiries FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only authorized admins can delete enquiries"
ON enquiries FOR DELETE
TO authenticated
USING (is_admin());

-- =====================================================================
-- 10. STORAGE BUCKETS & DUAL-TIER STORAGE SECURITY
-- =====================================================================
-- Storage Architecture:
-- 1. `atelier-vault`: STRICTLY PRIVATE bucket (public = false).
--    All draft assets, private previews, and unverified staging files are stored here.
--    Direct public CDN GET requests return 404/403. Access requires short-lived signed URLs generated by an authorized admin.
-- 2. Showroom Buckets (`product-images`, `product-models`, `showroom-videos`, `360-sequences`):
--    Buckets for PUBLISHED showroom assets (public = true for fast CDN delivery).
--    Files are ONLY promoted to these buckets when a product is explicitly published.
--    When a product is unpublished, its public copies are removed from these buckets, revoking public access.
--    Writes and deletes strictly require is_admin().

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('atelier-vault', 'atelier-vault', false, 104857600, ARRAY['image/jpeg', 'image/png', 'image/webp', 'model/gltf-binary', 'application/octet-stream', 'video/mp4', 'video/webm']),
  ('product-images', 'product-images', true, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('product-models', 'product-models', true, 52428800, ARRAY['model/gltf-binary', 'application/octet-stream']),
  ('showroom-videos', 'showroom-videos', true, 104857600, ARRAY['video/mp4', 'video/webm']),
  ('360-sequences', '360-sequences', true, 15728640, ARRAY['image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS ON ATELIER-VAULT (Strictly Private: Admins only)
CREATE POLICY "Admins can access private vault files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'atelier-vault' AND is_admin());

CREATE POLICY "Admins can upload to private vault"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'atelier-vault' AND is_admin());

CREATE POLICY "Admins can update private vault"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'atelier-vault' AND is_admin())
WITH CHECK (bucket_id = 'atelier-vault' AND is_admin());

CREATE POLICY "Admins can delete from private vault"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'atelier-vault' AND is_admin());

-- RLS ON SHOWROOM PUBLIC BUCKETS
-- Public can read files in published showroom buckets
CREATE POLICY "Public can view published showroom assets"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id IN ('product-images', 'product-models', 'showroom-videos', '360-sequences'));

-- Storage Policies: Only authorized admins can upload, update, or delete showroom files
CREATE POLICY "Only admins can upload showroom files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('product-images', 'product-models', 'showroom-videos', '360-sequences') AND
  is_admin()
);

CREATE POLICY "Only admins can update showroom files"
ON storage.objects FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete showroom files"
ON storage.objects FOR DELETE
TO authenticated
USING (is_admin());

-- =====================================================================
-- 11. INITIAL ADMIN PROVISIONING INSTRUCTIONS
-- =====================================================================
-- To grant an initial user administrative rights, run:
--
-- INSERT INTO app_admins (user_id, email, role)
-- VALUES ('<supabase-auth-user-id>', 'admin@villexa.com', 'admin');
--
-- This is executed manually in the Supabase SQL editor or CLI.
-- There is NO public admin registration endpoint.
