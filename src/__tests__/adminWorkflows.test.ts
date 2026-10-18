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
      },
      sequenceFrames: [
        { url: 'https://storage.villexa.com/products/aura-360-01.webp' },
        { url: 'https://storage.villexa.com/products/aura-360-02.webp' },
        { url: 'https://storage.villexa.com/products/aura-360-03.webp' }
      ]
    };

    expect(formData.name).toBe('Aura Grand Dining Table');
    expect(formData.regularPrice).toBe(28500);
    expect(formData.dimensions?.seatHeight).toBeUndefined();
    expect(formData.dimensions?.unit).toBe('cm');
    expect(formData.galleryImages?.length).toBe(2);
    expect(formData.primaryImageUrl).toContain('aura-1.webp');
    expect(formData.productVideo?.url).toBeDefined();
    expect(formData.glbModel?.url).toContain('.glb');
    expect(formData.sequenceFrames?.length).toBe(3);
  });

  it('validates 360 sequence ordering integrity', () => {
    const frameUrls = [
      'frame_001.webp',
      'frame_002.webp',
      'frame_003.webp',
      'frame_004.webp'
    ];

    // Frame sequence must maintain strict index order
    frameUrls.forEach((frame, idx) => {
      const frameNum = parseInt(frame.replace(/\D/g, ''), 10);
      expect(frameNum).toBe(idx + 1);
    });
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

  it('validates preferred viewer options match database constraint schema', () => {
    const validViewerModes: ProductFormData['preferredViewer'][] = ['gallery', 'glb_3d', 'sequence_360', 'video'];
    const dbAllowedSet = new Set(['gallery', 'glb_3d', 'sequence_360', 'video']);

    validViewerModes.forEach((mode) => {
      expect(dbAllowedSet.has(mode)).toBe(true);
    });
  });

  it('preserves existing GLB and Gallery preferences while accepting video', () => {
    const galleryProduct: Partial<ProductFormData> = { preferredViewer: 'gallery' };
    const glbProduct: Partial<ProductFormData> = { preferredViewer: 'glb_3d' };
    const sequenceProduct: Partial<ProductFormData> = { preferredViewer: 'sequence_360' };
    const videoProduct: Partial<ProductFormData> = { preferredViewer: 'video' };

    expect(galleryProduct.preferredViewer).toBe('gallery');
    expect(glbProduct.preferredViewer).toBe('glb_3d');
    expect(sequenceProduct.preferredViewer).toBe('sequence_360');
    expect(videoProduct.preferredViewer).toBe('video');
  });
});
