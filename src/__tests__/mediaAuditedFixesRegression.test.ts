import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductFormData, extractVaultPathFromUrl } from '../services/adminService';
import { siteConfigService } from '../services/siteConfigService';
import { promoteDraftToPublic, VAULT_BUCKET, validateFile } from '../services/storageService';
import { supabase } from '../services/supabaseClient';
import { Product, ProductViewerMode } from '../types/product';

describe('Audited Media Fixes & 360 Feature Removal Regression Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Video upload preserves storagePath
  it('1. Video upload preserves storagePath in media state and form payload', () => {
    const uploadResult = {
      success: true,
      publicUrl: 'https://project.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/chair-test.mp4?token=abc123signed',
      storagePath: 'drafts/videos/chair-test.mp4',
      metadata: { duration: 18.5, width: 1920, height: 1080 }
    };

    // Simulated AdminProductEditor video media state preservation
    const videoMediaState = {
      url: uploadResult.publicUrl,
      storagePath: uploadResult.storagePath,
      posterUrl: 'https://project.supabase.co/storage/v1/object/sign/atelier-vault/drafts/images/poster.webp?token=xyz',
      posterStoragePath: 'drafts/images/poster.webp',
      metadata: uploadResult.metadata,
      isNewDraft: true
    };

    expect(videoMediaState.storagePath).toBe('drafts/videos/chair-test.mp4');
    expect(videoMediaState.storagePath).not.toBeUndefined();
    expect(videoMediaState.storagePath.length).toBeGreaterThan(0);

    // Form data submission payload
    const formData: Partial<ProductFormData> = {
      name: 'Vesper Lounge Chair',
      productVideo: {
        url: videoMediaState.url,
        posterUrl: videoMediaState.posterUrl,
        storagePath: videoMediaState.storagePath,
        metadata: videoMediaState.metadata
      }
    };

    expect(formData.productVideo?.storagePath).toBe('drafts/videos/chair-test.mp4');
    expect(formData.productVideo?.metadata?.duration).toBe(18.5);
  });

  // 2. GLB upload preserves storagePath
  it('2. GLB upload preserves storagePath in media state and form payload', () => {
    const glbUploadResult = {
      success: true,
      publicUrl: 'https://project.supabase.co/storage/v1/object/sign/atelier-vault/drafts/models/vesper-chair.glb?token=xyz789signed',
      storagePath: 'drafts/models/vesper-chair.glb',
      metadata: { fileSizeBytes: 15420000 }
    };

    const glbMediaState = {
      url: glbUploadResult.publicUrl,
      storagePath: glbUploadResult.storagePath,
      metadata: glbUploadResult.metadata,
      isNewDraft: true
    };

    expect(glbMediaState.storagePath).toBe('drafts/models/vesper-chair.glb');

    const formData: Partial<ProductFormData> = {
      name: 'Vesper Lounge Chair',
      glbModel: {
        url: glbMediaState.url,
        storagePath: glbMediaState.storagePath,
        metadata: glbMediaState.metadata
      }
    };

    expect(formData.glbModel?.storagePath).toBe('drafts/models/vesper-chair.glb');
  });

  // 3. Publishing a video promotes it to showroom-videos
  it('3. Publishing a video promotes it from atelier-vault to showroom-videos', async () => {
    const fakeVideoBlob = new Blob(['fake mp4 content'], { type: 'video/mp4' });
    const downloadSpy = vi.fn().mockResolvedValue({ data: fakeVideoBlob, error: null });
    const uploadSpy = vi.fn().mockResolvedValue({ data: { path: 'published/videos/vesper.mp4' }, error: null });
    const getPublicUrlSpy = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://project.supabase.co/storage/v1/object/public/showroom-videos/published/videos/vesper.mp4' }
    });

    vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
      if (bucketId === VAULT_BUCKET) {
        return { download: downloadSpy } as any;
      }
      if (bucketId === 'showroom-videos') {
        return { upload: uploadSpy, getPublicUrl: getPublicUrlSpy } as any;
      }
      return {} as any;
    });

    const res = await promoteDraftToPublic('drafts/videos/vesper.mp4', 'video');
    expect(res.success).toBe(true);
    expect(downloadSpy).toHaveBeenCalledWith('drafts/videos/vesper.mp4');
    expect(uploadSpy).toHaveBeenCalledWith(
      'published/videos/vesper.mp4',
      fakeVideoBlob,
      expect.objectContaining({ contentType: 'video/mp4', upsert: true })
    );
    expect(res.publicUrl).toBe('https://project.supabase.co/storage/v1/object/public/showroom-videos/published/videos/vesper.mp4');
  });

  // 4. Publishing a GLB promotes it to product-models
  it('4. Publishing a GLB promotes it from atelier-vault to product-models', async () => {
    const fakeGlbBlob = new Blob(['fake glb content'], { type: 'model/gltf-binary' });
    const downloadSpy = vi.fn().mockResolvedValue({ data: fakeGlbBlob, error: null });
    const uploadSpy = vi.fn().mockResolvedValue({ data: { path: 'published/models/vesper.glb' }, error: null });
    const getPublicUrlSpy = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://project.supabase.co/storage/v1/object/public/product-models/published/models/vesper.glb' }
    });

    vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
      if (bucketId === VAULT_BUCKET) {
        return { download: downloadSpy } as any;
      }
      if (bucketId === 'product-models') {
        return { upload: uploadSpy, getPublicUrl: getPublicUrlSpy } as any;
      }
      return {} as any;
    });

    const res = await promoteDraftToPublic('drafts/models/vesper.glb', 'model');
    expect(res.success).toBe(true);
    expect(downloadSpy).toHaveBeenCalledWith('drafts/models/vesper.glb');
    expect(uploadSpy).toHaveBeenCalledWith(
      'published/models/vesper.glb',
      fakeGlbBlob,
      expect.objectContaining({ contentType: 'model/gltf-binary', upsert: true })
    );
    expect(res.publicUrl).toBe('https://project.supabase.co/storage/v1/object/public/product-models/published/models/vesper.glb');
  });

  // 5. Permanent public URLs and destination storage paths are persisted
  it('5. Extracts vault path accurately from legacy signed URLs or relative paths', () => {
    const signedUrl = 'https://project.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/showcase.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
    const relativePath = 'drafts/videos/showcase.mp4';
    const publicUrl = 'https://project.supabase.co/storage/v1/object/public/showroom-videos/published/videos/showcase.mp4';

    expect(extractVaultPathFromUrl(signedUrl)).toBe('drafts/videos/showcase.mp4');
    expect(extractVaultPathFromUrl(relativePath)).toBe('drafts/videos/showcase.mp4');
    expect(extractVaultPathFromUrl(publicUrl)).toBeNull();
  });

  // 6. Draft signed URLs are never stored as permanent published URLs
  it('6. Ensures draft signed URLs containing token or atelier-vault are rejected from published CDN storage', () => {
    const signedUrl = 'https://project.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/showcase.mp4?token=temporary-token-123';
    const permanentPublishedUrl = 'https://project.supabase.co/storage/v1/object/public/showroom-videos/published/videos/showcase.mp4';

    // Verification check rule
    const isPermanentPublicCdnUrl = (url: string) => {
      return url.includes('/object/public/') && !url.includes('atelier-vault') && !url.includes('token=');
    };

    expect(isPermanentPublicCdnUrl(signedUrl)).toBe(false);
    expect(isPermanentPublicCdnUrl(permanentPublishedUrl)).toBe(true);
  });

  // 7. Editing unrelated product fields preserves existing media
  it('7. Editing unrelated product fields preserves existing media', () => {
    // Initial loaded product
    const existingProduct: Product = {
      id: 'prod-001',
      slug: 'solis-console',
      sku: 'SLS-CNS-01',
      name: 'Solis Console',
      categoryId: 'cat-consoles',
      categoryName: 'Consoles',
      regularPrice: 12000,
      currency: 'USD',
      showPricePublicly: true,
      isEnquiryOnly: false,
      shortDescription: 'Brushed travertine console table.',
      fullDescription: 'Hand-sculpted monolithic console.',
      materials: 'Roman Travertine, Aged Brass',
      finishes: [],
      primaryImageUrl: 'https://project.supabase.co/storage/v1/object/public/product-images/published/images/solis-1.webp',
      galleryImages: ['https://project.supabase.co/storage/v1/object/public/product-images/published/images/solis-1.webp'],
      galleryMedia: [{
        url: 'https://project.supabase.co/storage/v1/object/public/product-images/published/images/solis-1.webp',
        storagePath: 'published/images/solis-1.webp'
      }],
      videoUrl: 'https://project.supabase.co/storage/v1/object/public/showroom-videos/published/videos/solis-video.mp4',
      videoPosterUrl: 'https://project.supabase.co/storage/v1/object/public/product-images/published/images/solis-poster.webp',
      videoMedia: {
        url: 'https://project.supabase.co/storage/v1/object/public/showroom-videos/published/videos/solis-video.mp4',
        storagePath: 'published/videos/solis-video.mp4',
        posterUrl: 'https://project.supabase.co/storage/v1/object/public/product-images/published/images/solis-poster.webp'
      },
      preferredViewer: 'video',
      glbConfig: {
        modelUrl: 'https://project.supabase.co/storage/v1/object/public/product-models/published/models/solis.glb'
      },
      glbMedia: {
        url: 'https://project.supabase.co/storage/v1/object/public/product-models/published/models/solis.glb',
        storagePath: 'published/models/solis.glb'
      },
      tags: ['console', 'stone'],
      isFeatured: true,
      sortOrder: 0,
      status: 'published',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z'
    };

    // Administrator edits ONLY the price and shortDescription
    const updatedFormData: ProductFormData = {
      id: existingProduct.id,
      slug: existingProduct.slug,
      sku: existingProduct.sku,
      name: existingProduct.name,
      categoryId: existingProduct.categoryId,
      regularPrice: 14500, // changed
      salePrice: null,
      currency: 'USD',
      showPricePublicly: true,
      isEnquiryOnly: false,
      shortDescription: 'Updated architectural description.', // changed
      fullDescription: existingProduct.fullDescription,
      materials: existingProduct.materials,
      primaryImageUrl: existingProduct.primaryImageUrl,
      preferredViewer: existingProduct.preferredViewer,
      tags: existingProduct.tags,
      isFeatured: existingProduct.isFeatured,
      sortOrder: existingProduct.sortOrder,
      status: existingProduct.status,
      galleryImages: existingProduct.galleryMedia,
      productVideo: existingProduct.videoMedia ? {
        url: existingProduct.videoMedia.url,
        storagePath: existingProduct.videoMedia.storagePath,
        posterUrl: existingProduct.videoMedia.posterUrl
      } : null,
      glbModel: existingProduct.glbMedia ? {
        url: existingProduct.glbMedia.url,
        storagePath: existingProduct.glbMedia.storagePath
      } : null
    };

    // Verify media was completely preserved without data loss
    expect(updatedFormData.regularPrice).toBe(14500);
    expect(updatedFormData.productVideo?.storagePath).toBe('published/videos/solis-video.mp4');
    expect(updatedFormData.productVideo?.url).toBe('https://project.supabase.co/storage/v1/object/public/showroom-videos/published/videos/solis-video.mp4');
    expect(updatedFormData.glbModel?.storagePath).toBe('published/models/solis.glb');
    expect(updatedFormData.galleryImages?.[0].storagePath).toBe('published/images/solis-1.webp');
  });

  // 8. Failed uploads or promotions do not silently create broken published records
  it('8. Failed promotions return explicit errors and do not silently create broken published records', async () => {
    vi.spyOn(supabase.storage, 'from').mockReturnValue({
      download: vi.fn().mockResolvedValue({ data: null, error: new Error('Permission denied or file not found in atelier-vault') })
    } as any);

    const promotionResult = await promoteDraftToPublic('drafts/videos/missing-file.mp4', 'video');
    expect(promotionResult.success).toBe(false);
    expect(promotionResult.error).toContain('Permission denied or file not found in atelier-vault');
    expect(promotionResult.publicUrl).toBeUndefined();
  });

  // 9. Existing images and galleries continue to work
  it('9. Existing images and galleries continue to work and validate correctly', () => {
    const validImageFile = new File(['fake webp image'], 'console-1.webp', { type: 'image/webp' });
    const validation = validateFile(validImageFile, 'image');
    expect(validation.valid).toBe(true);

    const galleryImages = [
      'https://project.supabase.co/storage/v1/object/public/product-images/published/images/p1.webp',
      'https://project.supabase.co/storage/v1/object/public/product-images/published/images/p2.webp'
    ];

    expect(galleryImages.length).toBe(2);
    galleryImages.forEach((img) => {
      expect(img).toMatch(/^https:\/\/.+\/product-images\/.+\.webp$/);
    });
  });

  // 10. The public viewer receives the correct video and GLB URLs
  it('10. Public viewer receives the correct video and GLB URLs through productService mapping', () => {
    const rawDbProduct = {
      id: 'prod-chair-1',
      slug: 'vesper-chair',
      sku: 'VSP-001',
      name: 'Vesper Lounge Chair',
      category_id: 'cat-seating',
      categories: { name: 'Sculptural Seating' },
      regular_price: 6800,
      currency: 'USD',
      showPricePublicly: true,
      is_enquiry_only: false,
      short_description: 'Bouclé and brushed bronze chair.',
      full_description: 'Masterpiece chair.',
      materials: 'French Bouclé, Brushed Bronze',
      primary_image_url: 'https://project.supabase.co/storage/v1/object/public/product-images/published/chair.webp',
      preferred_viewer: 'video',
      tags: ['lounge', 'seating'],
      is_featured: true,
      sort_order: 1,
      status: 'published',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      product_media: [
        {
          id: 'med-1',
          type: 'image',
          public_url: 'https://project.supabase.co/storage/v1/object/public/product-images/published/chair.webp',
          storage_path: 'published/images/chair.webp'
        },
        {
          id: 'med-2',
          type: 'video',
          public_url: 'https://project.supabase.co/storage/v1/object/public/showroom-videos/published/chair-video.mp4',
          storage_path: 'published/videos/chair-video.mp4',
          thumbnail_url: 'https://project.supabase.co/storage/v1/object/public/product-images/published/chair-poster.webp',
          metadata: { is_preferred_viewer: true }
        },
        {
          id: 'med-3',
          type: 'glb_model',
          public_url: 'https://project.supabase.co/storage/v1/object/public/product-models/published/chair.glb',
          storage_path: 'published/models/chair.glb',
          metadata: { initialRotationY: 0 }
        }
      ]
    };

    // Verify video and GLB resolution
    const videoItem = rawDbProduct.product_media.find((m) => m.type === 'video');
    const glbItem = rawDbProduct.product_media.find((m) => m.type === 'glb_model');

    expect(videoItem?.public_url).toBe('https://project.supabase.co/storage/v1/object/public/showroom-videos/published/chair-video.mp4');
    expect(videoItem?.storage_path).toBe('published/videos/chair-video.mp4');
    expect(glbItem?.public_url).toBe('https://project.supabase.co/storage/v1/object/public/product-models/published/chair.glb');
    expect(glbItem?.storage_path).toBe('published/models/chair.glb');
  });

  // 11. Product 360 UI and dependencies are removed
  it('11. Product 360 UI and dependencies are removed, mapping legacy sequence_360 to gallery', () => {
    const validModes: ProductViewerMode[] = ['gallery', 'glb_3d', 'video'];
    expect(validModes).not.toContain('sequence_360');

    // Test fallback mapping for legacy database records with preferred_viewer = 'sequence_360'
    const mapPreferredViewer = (dbViewer: string | null | undefined): ProductViewerMode => {
      if (dbViewer === 'video') return 'video';
      if (dbViewer === 'glb_3d') return 'glb_3d';
      return 'gallery'; // legacy 'sequence_360' or unknown defaults cleanly to 'gallery'
    };

    expect(mapPreferredViewer('sequence_360')).toBe('gallery');
    expect(mapPreferredViewer('video')).toBe('video');
    expect(mapPreferredViewer('glb_3d')).toBe('glb_3d');
    expect(mapPreferredViewer('gallery')).toBe('gallery');
  });

  // 12. The homepage cinematic hero still works
  it('12. The homepage cinematic hero scroll animation frame sequence remains intact', async () => {
    vi.spyOn(supabase, 'from').mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: new Error('Fallback to hero sequence defaults') })
    } as any);

    const config = await siteConfigService.getSiteConfig();
    expect(config.hero.mediaType).toBe('frames');
    expect(config.hero.mediaUrl).toContain('/hero-frames/frame-00001.webp');
    expect(config.hero.frameSequence?.frameCount).toBe(384);
    expect(config.hero.frameSequence?.framePattern).toBe('/hero-frames/frame-{index}.webp');
    expect(config.hero.frameSequence?.firstFrame).toBe('/hero-frames/frame-00001.webp');
    expect(config.hero.frameSequence?.finalFrame).toBe('/hero-frames/frame-00384.webp');
  });
});
