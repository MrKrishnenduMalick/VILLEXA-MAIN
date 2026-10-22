import { describe, it, expect, vi } from 'vitest';
import { productService } from '../services/productService';
import { siteConfigService } from '../services/siteConfigService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Product } from '../types/product';

describe('Villexa Product Service Foundation', () => {
  it('retrieves published product catalogue', async () => {
    const products = await productService.getPublishedProducts();
    expect(Array.isArray(products)).toBe(true);
    products.forEach((p) => {
      expect(p.status).toBe('published');
    });
  });

  it('retrieves categories successfully', async () => {
    const categories = await productService.getCategories();
    expect(Array.isArray(categories)).toBe(true);
  });

  it('returns null for non-existent product slug', async () => {
    const product = await productService.getProductBySlug('non-existent-chair');
    expect(product).toBeNull();
  });

  it('formats public price correctly', () => {
    const testProduct: Product = {
      id: 'test-1',
      slug: 'test-table',
      sku: 'SKU-001',
      name: 'Test Table',
      categoryId: 'tables',
      categoryName: 'Dining Tables',
      regularPrice: 12500,
      currency: 'USD',
      showPricePublicly: true,
      isEnquiryOnly: false,
      shortDescription: 'Test',
      fullDescription: 'Full Test',
      materials: 'Walnut',
      finishes: [],
      primaryImageUrl: null,
      galleryImages: [],
      preferredViewer: 'gallery',
      tags: [],
      isFeatured: false,
      sortOrder: 1,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const formatted = productService.formatPrice(testProduct);
    expect(formatted).toBe('$12,500');
  });

  it('returns "Price Upon Request" when price is hidden or enquiry only', () => {
    const hiddenPriceProduct: Product = {
      id: 'test-2',
      slug: 'bespoke-console',
      sku: 'SKU-002',
      name: 'Bespoke Console',
      categoryId: 'consoles',
      categoryName: 'Consoles',
      regularPrice: 15000,
      currency: 'USD',
      showPricePublicly: false, // hidden
      isEnquiryOnly: false,
      shortDescription: 'Test',
      fullDescription: 'Test',
      materials: 'Travertine',
      finishes: [],
      primaryImageUrl: null,
      galleryImages: [],
      preferredViewer: 'gallery',
      tags: [],
      isFeatured: false,
      sortOrder: 1,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    expect(productService.formatPrice(hiddenPriceProduct)).toBe('Price Upon Request');
  });
});

describe('Villexa Site Config Service Foundation', () => {
  it('returns fallback hero and disabled showroom video when offline or unconfigured', async () => {
    const fromSpy = vi.spyOn(supabase, 'from').mockReturnValueOnce({
      select: vi.fn().mockResolvedValue({ data: null, error: new Error('Offline fallback') })
    } as any);

    const config = await siteConfigService.getSiteConfig();
    expect(config.hero.mediaType).toBe('frames');
    expect(config.hero.mediaUrl).toBe('/hero-frames/frame-00001.webp');
    expect(config.hero.frameSequence?.frameCount).toBe(384);
    expect(config.showroomMedia.enabled).toBe(false);
    expect(config.showroomMedia.videoUrl).toBeNull();
    expect(config.brand.brandName).toBe('VILLEXA');

    fromSpy.mockRestore();
  });

  it('retrieves live hero and showroom media configuration when Supabase is configured', async () => {
    if (!isSupabaseConfigured) return;
    const config = await siteConfigService.getSiteConfig();
    expect(config.brand.brandName).toBe('VILLEXA');
    expect(config.hero.mediaType).toBe('video');
    expect(config.showroomMedia.enabled).toBe(true);
  });
});

describe('Villexa Master Inaugural Catalogue', () => {
  it('provides all 6 inaugural pieces with complete metadata and dimensions', async () => {
    const { INAUGURAL_CATALOGUE, INAUGURAL_CATALOGUE_BY_SLUG } = await import('../config/inauguralCatalogue');
    expect(INAUGURAL_CATALOGUE.length).toBe(6);

    const expectedSlugs = [
      'emerald-velvet-armchair',
      'marble-dining-table',
      'italian-upholstered-bed',
      'travertine-coffee-table',
      'fluted-walnut-credenza',
      'monolithic-lounge-chair'
    ];

    expectedSlugs.forEach((slug) => {
      const piece = INAUGURAL_CATALOGUE_BY_SLUG[slug];
      expect(piece).toBeDefined();
      expect(piece.slug).toBe(slug);
      expect(piece.name.length).toBeGreaterThan(3);
      expect(piece.sku.startsWith('VLX-')).toBe(true);
      expect(piece.regularPrice).toBeGreaterThan(0);
      expect(piece.materials.length).toBeGreaterThan(5);
      expect(piece.dimensions).toBeDefined();
      expect(piece.dimensions?.width).toBeGreaterThan(0);
      expect(piece.primaryImageUrl).toContain('https://images.unsplash.com/');
      expect(piece.status).toBe('published');
    });
  });
});
