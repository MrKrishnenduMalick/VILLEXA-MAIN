import { Product, ProductCategory } from '../types/product';
import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * PUBLIC PRODUCT SERVICE
 * Reads strictly published products via RLS policies.
 * When database is unconfigured or has no published items, returns empty array ([]),
 * triggering the deliberate luxury empty states.
 */

export const productService = {
  /**
   * Fetch all published products
   */
  async getPublishedProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*), collections(*), product_media(*), product_sequences_360(*)')
        .eq('status', 'published')
        .order('sort_order', { ascending: true });

      if (error || !data) return [];

      return data.map((item) => ({
        id: item.id,
        slug: item.slug,
        sku: item.sku,
        name: item.name,
        categoryId: item.category_id || '',
        categoryName: item.categories?.name || 'Unassigned',
        collectionId: item.collection_id || undefined,
        collectionName: item.collections?.name || undefined,
        regularPrice: item.regular_price ? Number(item.regular_price) : null,
        salePrice: item.sale_price ? Number(item.sale_price) : null,
        currency: item.currency || 'USD',
        showPricePublicly: item.show_price_publicly ?? true,
        isEnquiryOnly: item.is_enquiry_only ?? false,
        shortDescription: item.short_description,
        fullDescription: item.full_description,
        materials: item.materials,
        careInstructions: item.care_instructions || undefined,
        dimensions: item.dimensions || undefined,
        finishes: [],
        primaryImageUrl: item.primary_image_url || null,
        galleryImages: item.product_media?.filter((m: { type: string }) => m.type === 'image').map((m: { public_url: string }) => m.public_url) || [],
        galleryMedia: item.product_media?.filter((m: { type: string }) => m.type === 'image').map((m: { public_url: string; storage_path?: string; metadata?: any }) => ({ url: m.public_url, storagePath: m.storage_path, metadata: m.metadata })) || [],
        videoUrl: item.product_media?.find((m: { type: string }) => m.type === 'video')?.public_url || null,
        videoPosterUrl: (item.product_media?.find((m: { type: string }) => m.type === 'video')?.metadata as any)?.posterUrl || item.product_media?.find((m: { type: string }) => m.type === 'video')?.thumbnail_url || null,
        preferredViewer: (item.preferred_viewer === 'video' || item.product_media?.some((m: { type: string; metadata?: any }) => m.type === 'video' && m.metadata?.is_preferred_viewer)) ? 'video' : (item.preferred_viewer || 'gallery'),
        glbConfig: item.product_media?.find((m: { type: string }) => m.type === 'glb_model') ? {
          modelUrl: item.product_media.find((m: { type: string }) => m.type === 'glb_model').public_url,
          autoRotate: true
        } : undefined,
        sequence360Config: item.product_sequences_360?.length > 0 ? {
          frameCount: item.product_sequences_360.length,
          initialFrame: 0,
          rotationDirection: 'clockwise',
          frameUrls: [...item.product_sequences_360]
            .sort((a: { frame_index: number }, b: { frame_index: number }) => a.frame_index - b.frame_index)
            .map((f: { public_url: string }) => f.public_url)
        } : undefined,
        tags: item.tags || [],
        isFeatured: item.is_featured ?? false,
        sortOrder: item.sort_order ?? 0,
        seoTitle: item.seo_title || undefined,
        seoDescription: item.seo_description || undefined,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (err) {
      console.error('Error fetching published products:', err);
      return [];
    }
  },

  /**
   * Fetch single product by slug (only where published)
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(*), collections(*), product_media(*), product_sequences_360(*)')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        slug: data.slug,
        sku: data.sku,
        name: data.name,
        categoryId: data.category_id || '',
        categoryName: data.categories?.name || 'Unassigned',
        collectionId: data.collection_id || undefined,
        collectionName: data.collections?.name || undefined,
        regularPrice: data.regular_price ? Number(data.regular_price) : null,
        salePrice: data.sale_price ? Number(data.sale_price) : null,
        currency: data.currency || 'USD',
        showPricePublicly: data.show_price_publicly ?? true,
        isEnquiryOnly: data.is_enquiry_only ?? false,
        shortDescription: data.short_description,
        fullDescription: data.full_description,
        materials: data.materials,
        careInstructions: data.care_instructions || undefined,
        dimensions: data.dimensions || undefined,
        finishes: [],
        primaryImageUrl: data.primary_image_url || null,
        galleryImages: data.product_media?.filter((m: { type: string }) => m.type === 'image').map((m: { public_url: string }) => m.public_url) || [],
        galleryMedia: data.product_media?.filter((m: { type: string }) => m.type === 'image').map((m: { public_url: string; storage_path?: string; metadata?: any }) => ({ url: m.public_url, storagePath: m.storage_path, metadata: m.metadata })) || [],
        videoUrl: data.product_media?.find((m: { type: string }) => m.type === 'video')?.public_url || null,
        videoPosterUrl: (data.product_media?.find((m: { type: string }) => m.type === 'video')?.metadata as any)?.posterUrl || data.product_media?.find((m: { type: string }) => m.type === 'video')?.thumbnail_url || null,
        preferredViewer: (data.preferred_viewer === 'video' || data.product_media?.some((m: { type: string; metadata?: any }) => m.type === 'video' && m.metadata?.is_preferred_viewer)) ? 'video' : (data.preferred_viewer || 'gallery'),
        glbConfig: data.product_media?.find((m: { type: string }) => m.type === 'glb_model') ? {
          modelUrl: data.product_media.find((m: { type: string }) => m.type === 'glb_model').public_url,
          autoRotate: true
        } : undefined,
        sequence360Config: data.product_sequences_360?.length > 0 ? {
          frameCount: data.product_sequences_360.length,
          initialFrame: 0,
          rotationDirection: 'clockwise',
          frameUrls: [...data.product_sequences_360]
            .sort((a: { frame_index: number }, b: { frame_index: number }) => a.frame_index - b.frame_index)
            .map((f: { public_url: string }) => f.public_url)
        } : undefined,
        tags: data.tags || [],
        isFeatured: data.is_featured ?? false,
        sortOrder: data.sort_order ?? 0,
        seoTitle: data.seo_title || undefined,
        seoDescription: data.seo_description || undefined,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (err) {
      console.error('Error fetching product by slug:', err);
      return null;
    }
  },

  /**
   * Fetch active categories
   */
  async getCategories(): Promise<ProductCategory[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error || !data) return [];

      return data.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: c.description || undefined,
        sortOrder: c.sort_order,
        productCount: 0
      }));
    } catch {
      return [];
    }
  },

  /**
   * Fetch featured products for homepage
   */
  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.getPublishedProducts();
    return products.filter((p) => p.isFeatured);
  },

  /**
   * Formatter utility for price display respecting public visibility and currency
   */
  formatPrice(product: Product): string {
    if (product.isEnquiryOnly || !product.showPricePublicly || product.regularPrice === null) {
      return 'Price Upon Request';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'USD',
      maximumFractionDigits: 0
    }).format(product.regularPrice);
  }
};
