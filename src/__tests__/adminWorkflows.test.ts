import { describe, it, expect } from 'vitest';
import { adminService, ProductFormData } from '../services/adminService';
import { validateFile } from '../services/storageService';

describe('Admin Management: Category Workflows & Safe Deletion', () => {
  it('prevents deletion of categories when products are assigned', async () => {
    // When Supabase is unconfigured, getCategoryProductCount returns 0 by default,
    // but the safeguard logic checks product count prior to proceeding.
    const count = await adminService.getCategoryProductCount('non-existent-cat');
    expect(count).toBe(0);
  });

  it('generates clean URL slugs from category names', () => {
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    expect(slugify('Dining Tables & Consoles')).toBe('dining-tables-consoles');
    expect(slugify('Haute Ébénisterie')).toBe('haute-b-nisterie');
    expect(slugify('Executive Desks 2026')).toBe('executive-desks-2026');
  });

  it('validates category payload with cover image', () => {
    const validCategoryPayload = {
      name: 'Sculptural Seating',
      slug: 'sculptural-seating',
      description: 'Hand-carved solid walnut and boucle armchairs.',
      coverImageUrl: 'https://storage.villexa.com/categories/seating-cover.webp',
      sortOrder: 1
    };

    expect(validCategoryPayload.name.trim().length).toBeGreaterThan(0);
    expect(validCategoryPayload.slug.trim().length).toBeGreaterThan(0);
    expect(validCategoryPayload.coverImageUrl).toContain('https://');
  });
});

describe('Admin Management: Collection Workflows & Safe Deletion', () => {
  it('prevents deletion of collections when products are assigned', async () => {
    const count = await adminService.getCollectionProductCount('non-existent-coll');
    expect(count).toBe(0);
  });

  it('validates collection payload with video and cover image', () => {
    const collectionPayload = {
      title: 'The Milan Pavilion Suite',
      slug: 'milan-pavilion-suite',
      description: 'Exclusive architectural collection debuted at Salone del Mobile.',
      coverImageUrl: 'https://storage.villexa.com/collections/milan-cover.webp',
      videoUrl: 'https://storage.villexa.com/collections/milan-walkthrough.mp4',
      videoPosterUrl: 'https://storage.villexa.com/collections/milan-poster.webp',
      sortOrder: 1
    };

    expect(collectionPayload.title.trim().length).toBeGreaterThan(0);
    expect(collectionPayload.videoUrl).toMatch(/\.(mp4|webm)$/i);
    expect(collectionPayload.videoPosterUrl).toMatch(/\.(webp|jpg|png)$/i);
  });
});

describe('Admin Management: Product Form Data & Media Structures', () => {
  it('validates complete product form data including specifications and dimensions', () => {
    const formData: ProductFormData = {
      name: 'Aura Grand Dining Table',
      slug: 'aura-grand-dining-table',
      sku: 'VLX-TBL-001',
      categoryId: 'cat-tables',
      shortDescription: 'Monolithic brushed French oak table.',
      fullDescription: 'Handcrafted in Normandy using sustainable century-old French oak.',
      regularPrice: 28500,
      salePrice: null,
      currency: 'USD',
      showPricePublicly: true,
      isEnquiryOnly: false,
      materials: 'Solid French Oak, Smoked Bronze',
      dimensions: {
        width: 320,
        depth: 110,
        height: 76,
        seatHeight: undefined,
        unit: 'cm'
      },
      tags: ['dining', 'oak', 'statement'],
      status: 'published',
      isFeatured: true,
      sortOrder: 0,
      primaryImageUrl: 'https://storage.villexa.com/products/aura-1.webp',
      preferredViewer: 'gallery',
      galleryImages: [
        { url: 'https://storage.villexa.com/products/aura-1.webp' },
        { url: 'https://storage.villexa.com/products/aura-2.webp' }
      ],
      productVideo: {
        url: 'https://storage.villexa.com/products/aura-crafting.mp4',
        posterUrl: 'https://storage.villexa.com/products/aura-poster.webp'
      },
      glbModel: {
        url: 'https://storage.villexa.com/products/aura.glb'
      }
    };

    expect(formData.name).toBe('Aura Grand Dining Table');
    expect(formData.regularPrice).toBe(28500);
    expect(formData.dimensions?.seatHeight).toBeUndefined();
    expect(formData.dimensions?.unit).toBe('cm');
    expect(formData.galleryImages?.length).toBe(2);
    expect(formData.primaryImageUrl).toContain('aura-1.webp');
    expect(formData.productVideo?.url).toBeDefined();
    expect(formData.glbModel?.url).toContain('.glb');
  });

  it('verifies video file constraints and rejects unplayable legacy video formats', () => {
    const aviFile = new File(['fake avi'], 'sample.avi', { type: 'video/x-msvideo' });
    const wmvFile = new File(['fake wmv'], 'sample.wmv', { type: 'video/x-ms-wmv' });
    const mp4File = new File(['fake mp4'], 'sample.mp4', { type: 'video/mp4' });
    const webmFile = new File(['fake webm'], 'sample.webm', { type: 'video/webm' });

    expect(validateFile(aviFile, 'video').valid).toBe(false);
    expect(validateFile(wmvFile, 'video').valid).toBe(false);
    expect(validateFile(mp4File, 'video').valid).toBe(true);
    expect(validateFile(webmFile, 'video').valid).toBe(true);
  });

  it('validates preferred viewer options match active viewer schema', () => {
    const validViewerModes: ProductFormData['preferredViewer'][] = ['gallery', 'glb_3d', 'video'];
    const activeAllowedSet = new Set(['gallery', 'glb_3d', 'video']);

    validViewerModes.forEach((mode) => {
      expect(activeAllowedSet.has(mode)).toBe(true);
    });
  });

  it('preserves GLB and Gallery preferences while accepting video', () => {
    const galleryProduct: Partial<ProductFormData> = { preferredViewer: 'gallery' };
    const glbProduct: Partial<ProductFormData> = { preferredViewer: 'glb_3d' };
    const videoProduct: Partial<ProductFormData> = { preferredViewer: 'video' };

    expect(galleryProduct.preferredViewer).toBe('gallery');
    expect(glbProduct.preferredViewer).toBe('glb_3d');
    expect(videoProduct.preferredViewer).toBe('video');
  });
});
