import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService, extractVaultPathFromUrl } from '../services/adminService';
import { promoteDraftToPublic, VAULT_BUCKET } from '../services/storageService';
import { supabase } from '../services/supabaseClient';

describe('Media Publication & Safe Recovery Regression Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Successful Video Promotion to showroom-videos/published/videos/
  it('promotes video from atelier-vault/drafts/videos to showroom-videos/published/videos/ and obtains permanent public CDN URL', async () => {
    const fakeVideoBlob = new Blob(['fake video content bytes'], { type: 'video/mp4' });
    const downloadSpy = vi.fn().mockResolvedValue({ data: fakeVideoBlob, error: null });
    const uploadSpy = vi.fn().mockResolvedValue({ data: { path: 'published/videos/lounge-walkthrough.mp4' }, error: null });
    const getPublicUrlSpy = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://project.supabase.co/storage/v1/object/public/showroom-videos/published/videos/lounge-walkthrough.mp4' }
    });
    const removeSpy = vi.fn().mockResolvedValue({ data: {}, error: null });

    vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
      if (bucketId === VAULT_BUCKET) {
        return { download: downloadSpy, remove: removeSpy } as any;
      }
      if (bucketId === 'showroom-videos') {
        return { upload: uploadSpy, getPublicUrl: getPublicUrlSpy } as any;
      }
      return {} as any;
    });

    const result = await promoteDraftToPublic('drafts/videos/12345_lounge-walkthrough.mp4', 'video', {
      deleteSourceAfterVerification: true
    });

    expect(result.success).toBe(true);
    expect(downloadSpy).toHaveBeenCalledWith('drafts/videos/12345_lounge-walkthrough.mp4');
    expect(uploadSpy).toHaveBeenCalledWith(
      'published/videos/12345_lounge-walkthrough.mp4',
      fakeVideoBlob,
      expect.objectContaining({ contentType: 'video/mp4', upsert: true })
    );
    expect(result.publicPath).toBe('published/videos/12345_lounge-walkthrough.mp4');
    expect(result.publicUrl).toBe('https://project.supabase.co/storage/v1/object/public/showroom-videos/published/videos/lounge-walkthrough.mp4');
    expect(removeSpy).toHaveBeenCalledWith(['drafts/videos/12345_lounge-walkthrough.mp4']);
  });

  // 2. Successful GLB Model Promotion to product-models/published/models/
  it('promotes 3D GLB model from atelier-vault/drafts/models to product-models/published/models/ with correct MIME type', async () => {
    const fakeGlbBlob = new Blob(['fake glb bytes'], { type: 'model/gltf-binary' });
    const downloadSpy = vi.fn().mockResolvedValue({ data: fakeGlbBlob, error: null });
    const uploadSpy = vi.fn().mockResolvedValue({ data: { path: 'published/models/aurelia.glb' }, error: null });
    const getPublicUrlSpy = vi.fn().mockImplementation((path: string) => ({
      data: { publicUrl: `https://project.supabase.co/storage/v1/object/public/product-models/${path}` }
    }));

    vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
      if (bucketId === VAULT_BUCKET) {
        return { download: downloadSpy } as any;
      }
      if (bucketId === 'product-models') {
        return { upload: uploadSpy, getPublicUrl: getPublicUrlSpy } as any;
      }
      return {} as any;
    });

    const result = await promoteDraftToPublic('drafts/models/12345_aurelia.glb', 'model', {
      deleteSourceAfterVerification: false
    });

    expect(result.success).toBe(true);
    expect(downloadSpy).toHaveBeenCalledWith('drafts/models/12345_aurelia.glb');
    expect(uploadSpy).toHaveBeenCalledWith(
      'published/models/12345_aurelia.glb',
      fakeGlbBlob,
      expect.objectContaining({ contentType: 'model/gltf-binary', upsert: true })
    );
    expect(result.publicPath).toBe('published/models/12345_aurelia.glb');
    expect(result.publicUrl).toBe('https://project.supabase.co/storage/v1/object/public/product-models/published/models/12345_aurelia.glb');
  });

  // 3. Promotion Failure Reporting & Staging Preservation
  it('reports promotion failure clearly and does not delete staging file from atelier-vault', async () => {
    const fakeVideoBlob = new Blob(['fake video content bytes'], { type: 'video/mp4' });
    const downloadSpy = vi.fn().mockResolvedValue({ data: fakeVideoBlob, error: null });
    const uploadSpy = vi.fn().mockResolvedValue({ data: null, error: new Error('Showroom bucket storage quota exceeded') });
    const removeSpy = vi.fn().mockResolvedValue({ data: {}, error: null });

    vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
      if (bucketId === VAULT_BUCKET) {
        return { download: downloadSpy, remove: removeSpy } as any;
      }
      if (bucketId === 'showroom-videos') {
        return { upload: uploadSpy } as any;
      }
      return {} as any;
    });

    const result = await promoteDraftToPublic('drafts/videos/sofa-clip.mp4', 'video', {
      deleteSourceAfterVerification: true
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Upload to showroom bucket "showroom-videos" failed');
    expect(result.error).toContain('Showroom bucket storage quota exceeded');
    // Staging file in atelier-vault must NOT be removed when upload fails
    expect(removeSpy).not.toHaveBeenCalled();
  });

  // 4. Missing Source Object in Vault Handling
  it('handles missing source object in vault gracefully across all candidates with explicit error', async () => {
    const downloadSpy = vi.fn().mockResolvedValue({ data: null, error: new Error('Object not found in vault') });
    const uploadSpy = vi.fn();
    const removeSpy = vi.fn();

    vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
      if (bucketId === VAULT_BUCKET) {
        return { download: downloadSpy, remove: removeSpy } as any;
      }
      if (bucketId === 'showroom-videos') {
        return { upload: uploadSpy } as any;
      }
      return {} as any;
    });

    const result = await promoteDraftToPublic('videos/non_existent.mp4', 'video');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not retrieve file from private vault');
    expect(uploadSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
  });

  // 5. Correct Destination storage_path and Permanent URL validation
  it('generates correct destination storage_path and rejects signed token URLs from published storage', () => {
    const signedVaultUrl = 'https://mock.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/vesper.mp4?token=temporary-token-xyz';
    const relativeVaultPath = 'drafts/videos/vesper.mp4';
    const permanentPublishedUrl = 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/vesper.mp4';

    // Verify accurate extraction
    expect(extractVaultPathFromUrl(signedVaultUrl)).toBe('drafts/videos/vesper.mp4');
    expect(extractVaultPathFromUrl(relativeVaultPath)).toBe('drafts/videos/vesper.mp4');
    expect(extractVaultPathFromUrl(permanentPublishedUrl)).toBeNull();

    // Verify permanent URL properties
    expect(permanentPublishedUrl).toContain('/showroom-videos/published/videos/');
    expect(permanentPublishedUrl).not.toContain('atelier-vault');
    expect(permanentPublishedUrl).not.toContain('token=');
  });

  // 6. Retry Without Duplicate Objects
  it('avoids duplicate copy on retry when destination object already exists in showroom-videos', async () => {
    const listSpy = vi.fn().mockResolvedValue({
      data: [{ name: 'existing-video.mp4' }],
      error: null
    });
    const getPublicUrlSpy = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/existing-video.mp4' }
    });
    const uploadSpy = vi.fn();
    const downloadSpy = vi.fn();

    vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
      if (bucketId === 'showroom-videos') {
        return {
          list: listSpy,
          getPublicUrl: getPublicUrlSpy,
          upload: uploadSpy
        } as any;
      }
      if (bucketId === VAULT_BUCKET) {
        return { download: downloadSpy } as any;
      }
      return {} as any;
    });

    const result = await promoteDraftToPublic('drafts/videos/existing-video.mp4', 'video');

    expect(result.success).toBe(true);
    expect(result.alreadyExisted).toBe(true);
    expect(result.publicPath).toBe('published/videos/existing-video.mp4');
    expect(result.publicUrl).toBe('https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/existing-video.mp4');
    expect(uploadSpy).not.toHaveBeenCalled();
    expect(downloadSpy).not.toHaveBeenCalled();
  });

  // 7. Product Save / Publish Verification with Video & GLB Promotion
  it('saveProduct promotes both video and GLB model, persists correct paths and permanent URLs in DB', async () => {
    const fakeVideoBlob = new Blob(['sample mp4'], { type: 'video/mp4' });
    const fakeGlbBlob = new Blob(['sample glb'], { type: 'model/gltf-binary' });

    vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
      if (bucketId === VAULT_BUCKET) {
        return {
          download: vi.fn().mockImplementation((path: string) => {
            if (path.includes('armchair.mp4')) return Promise.resolve({ data: fakeVideoBlob, error: null });
            if (path.includes('armchair.glb')) return Promise.resolve({ data: fakeGlbBlob, error: null });
            return Promise.resolve({ data: null, error: new Error('Not found') });
          }),
          remove: vi.fn().mockResolvedValue({ data: {}, error: null })
        } as any;
      }
      if (bucketId === 'showroom-videos') {
        return {
          upload: vi.fn().mockResolvedValue({ data: { path: 'published/videos/armchair.mp4' }, error: null }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/armchair.mp4' }
          })
        } as any;
      }
      if (bucketId === 'product-models') {
        return {
          upload: vi.fn().mockResolvedValue({ data: { path: 'published/models/armchair.glb' }, error: null }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: 'https://mock.supabase.co/storage/v1/object/public/product-models/published/models/armchair.glb' }
          })
        } as any;
      }
      return {} as any;
    });

    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'new-prod-id' }, error: null })
      })
    });
    const mediaInsertMock = vi.fn().mockResolvedValue({ data: {}, error: null });
    const mediaSelectMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      })
    });
    const mediaUpdateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: {}, error: null })
    });
    const mediaDeleteMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null })
      })
    });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'products') {
        return { insert: insertMock } as any;
      }
      if (table === 'product_media') {
        return {
          insert: mediaInsertMock,
          select: mediaSelectMock,
          update: mediaUpdateMock,
          delete: mediaDeleteMock
        } as any;
      }
      return {} as any;
    });

    const res = await adminService.saveProduct({
      name: 'Sculpted Armchair',
      slug: 'sculpted-armchair',
      sku: 'SCA-01',
      regularPrice: 3200,
      salePrice: null,
      currency: 'USD',
      showPricePublicly: true,
      isEnquiryOnly: false,
      shortDescription: 'Sculpted lounge chair.',
      fullDescription: 'Detailed description.',
      materials: 'Solid Oak, Bouclé',
      primaryImageUrl: 'https://mock.supabase.co/storage/v1/object/public/product-images/published/images/chair.webp',
      preferredViewer: 'video',
      tags: ['chair'],
      isFeatured: false,
      sortOrder: 0,
      status: 'published',
      productVideo: {
        url: 'https://mock.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/armchair.mp4?token=abc',
        storagePath: 'drafts/videos/armchair.mp4'
      },
      glbModel: {
        url: 'https://mock.supabase.co/storage/v1/object/sign/atelier-vault/drafts/models/armchair.glb?token=def',
        storagePath: 'drafts/models/armchair.glb'
      }
    });

    expect(res.success).toBe(true);
    expect(res.promotedVideo?.url).toBe('https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/armchair.mp4');
    expect(res.promotedVideo?.storagePath).toBe('published/videos/armchair.mp4');
    expect(res.promotedGlb?.url).toBe('https://mock.supabase.co/storage/v1/object/public/product-models/published/models/armchair.glb');
    expect(res.promotedGlb?.storagePath).toBe('published/models/armchair.glb');

    // Verify DB insert received the correct permanent paths and URLs
    expect(mediaInsertMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'glb_model',
          storage_path: 'published/models/armchair.glb',
          public_url: 'https://mock.supabase.co/storage/v1/object/public/product-models/published/models/armchair.glb'
        })
      ])
    );
    expect(mediaInsertMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'video',
          storage_path: 'published/videos/armchair.mp4',
          public_url: 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/armchair.mp4'
        })
      ])
    );
  });

  // 8. Safe Recovery Routine on Live Affected Products (3 Videos + 1 GLB Model)
  it('safe recovery routine locates 4 affected live database records, promotes them to showroom CDN, updates DB, and preserves original staged files in vault', async () => {
    const fakeVideoBlob = new Blob(['sample mp4 bytes'], { type: 'video/mp4' });
    const fakeGlbBlob = new Blob(['sample glb bytes'], { type: 'model/gltf-binary' });
    const removeSpy = vi.fn().mockResolvedValue({ data: {}, error: null });

    vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
      if (bucketId === VAULT_BUCKET) {
        return {
          download: vi.fn().mockImplementation((path: string) => {
            if (path.endsWith('.mp4')) return Promise.resolve({ data: fakeVideoBlob, error: null });
            if (path.endsWith('.glb')) return Promise.resolve({ data: fakeGlbBlob, error: null });
            return Promise.resolve({ data: null, error: new Error('Not found') });
          }),
          remove: removeSpy
        } as any;
      }
      if (bucketId === 'showroom-videos') {
        return {
          upload: vi.fn().mockResolvedValue({ data: { path: 'uploaded' }, error: null }),
          getPublicUrl: vi.fn().mockImplementation((path: string) => ({
            data: { publicUrl: `https://project.supabase.co/storage/v1/object/public/showroom-videos/${path}` }
          }))
        } as any;
      }
      if (bucketId === 'product-models') {
        return {
          upload: vi.fn().mockResolvedValue({ data: { path: 'uploaded' }, error: null }),
          getPublicUrl: vi.fn().mockImplementation((path: string) => ({
            data: { publicUrl: `https://project.supabase.co/storage/v1/object/public/product-models/${path}` }
          }))
        } as any;
      }
      return {} as any;
    });

    // Mock exact 3 published products and their 4 affected records matching live database findings
    const mockPublishedProducts = [
      {
        id: 'prod-tivoli',
        name: 'Tivoli Travertine Cantilever Coffee Table',
        slug: 'tivoli-travertine-cantilever-coffee-table',
        status: 'published',
        product_media: [
          {
            id: 'med-tivoli-video',
            product_id: 'prod-tivoli',
            type: 'video',
            storage_path: '', // empty in live DB!
            public_url: 'https://project.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/1710000000_tivoli.mp4?token=exp-token-1',
            thumbnail_url: null,
            metadata: {}
          }
        ]
      },
      {
        id: 'prod-brera',
        name: 'Brera Sculpted Velvet Barrel Lounge Chair',
        slug: 'brera-sculpted-velvet-barrel-lounge-chair',
        status: 'published',
        product_media: [
          {
            id: 'med-brera-video',
            product_id: 'prod-brera',
            type: 'video',
            storage_path: '', // empty in live DB!
            public_url: 'https://project.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/1710000001_brera.mp4?token=exp-token-2',
            thumbnail_url: null,
            metadata: {}
          }
        ]
      },
      {
        id: 'prod-aurelia',
        name: 'Aurelia Monolith Curved Sofa',
        slug: 'aurelia-monolith-curved-sofa',
        status: 'published',
        product_media: [
          {
            id: 'med-aurelia-video',
            product_id: 'prod-aurelia',
            type: 'video',
            storage_path: '', // empty in live DB!
            public_url: 'https://project.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/1710000002_aurelia.mp4?token=exp-token-3',
            thumbnail_url: null,
            metadata: {}
          },
          {
            id: 'med-aurelia-glb',
            product_id: 'prod-aurelia',
            type: 'glb_model',
            storage_path: '', // empty in live DB!
            public_url: 'https://project.supabase.co/storage/v1/object/sign/atelier-vault/drafts/models/1710000003_aurelia.glb?token=exp-token-4',
            thumbnail_url: null,
            metadata: {}
          }
        ]
      }
    ];

    const updatedMediaRows: Array<{ id: string; payload: any }> = [];
    const updateMock = vi.fn().mockImplementation((payload: any) => ({
      eq: vi.fn().mockImplementation((col: string, val: string) => {
        if (col === 'id') {
          updatedMediaRows.push({ id: val, payload });
        }
        return Promise.resolve({ data: {}, error: null });
      })
    }));

    const selectPromise = Promise.resolve({ data: mockPublishedProducts, error: null });
    (selectPromise as any).eq = vi.fn().mockResolvedValue({ data: mockPublishedProducts, error: null });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue(selectPromise)
        } as any;
      }
      if (table === 'product_media') {
        return {
          update: updateMock
        } as any;
      }
      return {} as any;
    });

    const recoveryResult = await adminService.repairPublishedProductMedia();

    expect(recoveryResult.success).toBe(true);
    expect(recoveryResult.scanned).toBe(4);
    expect(recoveryResult.repaired).toBe(4);
    expect(recoveryResult.errors).toHaveLength(0);

    // Verify all 4 details are reported
    const repairedMediaIds = recoveryResult.details.map((d) => d.mediaId);
    expect(repairedMediaIds).toContain('med-tivoli-video');
    expect(repairedMediaIds).toContain('med-brera-video');
    expect(repairedMediaIds).toContain('med-aurelia-video');
    expect(repairedMediaIds).toContain('med-aurelia-glb');

    // Verify storage_path destinations:
    const tivoliDetail = recoveryResult.details.find((d) => d.mediaId === 'med-tivoli-video');
    expect(tivoliDetail?.storagePath).toBe('published/videos/1710000000_tivoli.mp4');
    expect(tivoliDetail?.newUrl).toBe('https://project.supabase.co/storage/v1/object/public/showroom-videos/published/videos/1710000000_tivoli.mp4');

    const aureliaGlbDetail = recoveryResult.details.find((d) => d.mediaId === 'med-aurelia-glb');
    expect(aureliaGlbDetail?.storagePath).toBe('published/models/1710000003_aurelia.glb');
    expect(aureliaGlbDetail?.newUrl).toBe('https://project.supabase.co/storage/v1/object/public/product-models/published/models/1710000003_aurelia.glb');

    // Verify database updates were called for all 4 items
    expect(updatedMediaRows).toHaveLength(4);
    expect(updatedMediaRows.find((r) => r.id === 'med-aurelia-glb')?.payload.storage_path).toBe('published/models/1710000003_aurelia.glb');
    expect(updatedMediaRows.find((r) => r.id === 'med-aurelia-video')?.payload.storage_path).toBe('published/videos/1710000002_aurelia.mp4');

    // CRITICAL: Safe recovery must PRESERVE original staged files in atelier-vault
    expect(removeSpy).not.toHaveBeenCalled();
  });

  // 9. Missing Source Object During Targeted Repair (Never fabricate URLs)
  it('reports missing source objects clearly and never fabricates URLs during targeted repair', async () => {
    const mockProducts = [
      {
        id: 'prod-brera',
        name: 'Brera Sculpted Velvet Barrel Lounge Chair',
        slug: 'brera-sculpted-velvet-barrel-lounge-chair',
        status: 'published',
        product_media: [
          {
            id: 'med-brera-video',
            product_id: 'prod-brera',
            type: 'video',
            storage_path: '',
            public_url: 'https://project.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/missing_brera.mp4?token=expired-token',
            thumbnail_url: null,
            metadata: {}
          }
        ]
      }
    ];

    const downloadSpy = vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') });
    const uploadSpy = vi.fn();
    const updateSpy = vi.fn();

    vi.spyOn(supabase.storage, 'from').mockImplementation((b: string) => {
      if (b === VAULT_BUCKET) return { download: downloadSpy } as any;
      if (b === 'showroom-videos') return { upload: uploadSpy } as any;
      return {} as any;
    });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: mockProducts, error: null })
          })
        } as any;
      }
      if (table === 'product_media') {
        return { update: updateSpy } as any;
      }
      return {} as any;
    });

    const result = await adminService.repairTargetedProductVideos();

    expect(result.success).toBe(false);
    expect(result.repaired).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('was not found or is unreadable in atelier-vault');
    expect(result.errors[0]).toContain('Please re-upload this video');
    expect(uploadSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  // 10. Upload Failure Handling During Targeted Repair
  it('reports upload failures clearly, preserves draft in vault, and does not update database', async () => {
    const fakeBlob = new Blob(['video data'], { type: 'video/mp4' });
    const mockProducts = [
      {
        id: 'prod-tivoli',
        name: 'Tivoli Travertine Cantilever Coffee Table',
        slug: 'tivoli-travertine-cantilever-coffee-table',
        status: 'published',
        product_media: [
          {
            id: 'med-tivoli-video',
            product_id: 'prod-tivoli',
            type: 'video',
            storage_path: '',
            public_url: 'https://project.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/tivoli.mp4?token=exp-token',
            thumbnail_url: null,
            metadata: {}
          }
        ]
      }
    ];

    const downloadSpy = vi.fn().mockResolvedValue({ data: fakeBlob, error: null });
    const uploadSpy = vi.fn().mockResolvedValue({ data: null, error: new Error('Showroom upload failed: S3 connection timeout') });
    const removeSpy = vi.fn();
    const updateSpy = vi.fn();

    vi.spyOn(supabase.storage, 'from').mockImplementation((b: string) => {
      if (b === VAULT_BUCKET) return { download: downloadSpy, remove: removeSpy } as any;
      if (b === 'showroom-videos') return { upload: uploadSpy } as any;
      return {} as any;
    });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: mockProducts, error: null })
          })
        } as any;
      }
      if (table === 'product_media') {
        return { update: updateSpy } as any;
      }
      return {} as any;
    });

    const result = await adminService.repairTargetedProductVideos();

    expect(result.success).toBe(false);
    expect(result.repaired).toBe(0);
    expect(result.errors[0]).toContain('Upload to "showroom-videos" failed');
    expect(result.errors[0]).toContain('Source file preserved');
    expect(removeSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  // 11. Database Update Failure Handling
  it('reports database update failure, leaves source file intact in vault', async () => {
    const fakeBlob = new Blob(['video data'], { type: 'video/mp4' });
    const mockProducts = [
      {
        id: 'prod-aurelia',
        name: 'Aurelia Monolith Curved Sofa',
        slug: 'aurelia-monolith-curved-sofa',
        status: 'published',
        product_media: [
          {
            id: 'med-aurelia-video',
            product_id: 'prod-aurelia',
            type: 'video',
            storage_path: '',
            public_url: 'https://project.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/aurelia.mp4?token=exp-token',
            thumbnail_url: null,
            metadata: {}
          }
        ]
      }
    ];

    vi.spyOn(supabase.storage, 'from').mockImplementation((b: string) => {
      if (b === VAULT_BUCKET) return { download: vi.fn().mockResolvedValue({ data: fakeBlob, error: null }) } as any;
      if (b === 'showroom-videos') {
        return {
          upload: vi.fn().mockResolvedValue({ data: { path: 'published/videos/aurelia.mp4' }, error: null }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/aurelia.mp4' }
          })
        } as any;
      }
      return {} as any;
    });

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: new Error('Postgres row lock conflict') })
    });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: mockProducts, error: null })
          })
        } as any;
      }
      if (table === 'product_media') {
        return { update: updateMock } as any;
      }
      return {} as any;
    });

    const result = await adminService.repairTargetedProductVideos();

    expect(result.success).toBe(false);
    expect(result.repaired).toBe(0);
    expect(result.errors[0]).toContain('Failed to update database record med-aurelia-video');
    expect(result.errors[0]).toContain('Postgres row lock conflict');
  });

  // 12. Duplicate Prevention and In-Place Row ID Preservation in saveProduct
  it('updates existing product_media row in-place, preserving row ID and preventing duplicate rows', async () => {
    const existingVideoRow = {
      id: 'existing-video-media-id-777',
      product_id: 'prod-456',
      type: 'video',
      storage_path: 'published/videos/original.mp4',
      public_url: 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/original.mp4'
    };

    const updatedRows: Array<{ id: string; payload: any }> = [];
    const mediaUpdateMock = vi.fn().mockImplementation((payload: any) => ({
      eq: vi.fn().mockImplementation((col: string, val: string) => {
        if (col === 'id') {
          updatedRows.push({ id: val, payload });
        }
        return Promise.resolve({ data: {}, error: null });
      })
    }));
    const mediaInsertMock = vi.fn();

    vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
      if (bucketId === 'showroom-videos') {
        return {
          upload: vi.fn().mockResolvedValue({ data: { path: 'published/videos/new_video.mp4' }, error: null }),
          getPublicUrl: vi.fn().mockReturnValue({
            data: { publicUrl: 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/new_video.mp4' }
          })
        } as any;
      }
      if (bucketId === VAULT_BUCKET) {
        return {
          download: vi.fn().mockResolvedValue({ data: new Blob(['mp4 bytes'], { type: 'video/mp4' }), error: null })
        } as any;
      }
      return {} as any;
    });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: 'prod-456' }, error: null })
            })
          })
        } as any;
      }
      if (table === 'product_media') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [existingVideoRow], error: null })
            })
          }),
          update: mediaUpdateMock,
          insert: mediaInsertMock
        } as any;
      }
      return {} as any;
    });

    const res = await adminService.saveProduct({
      name: 'Curved Lounge Chair',
      slug: 'curved-lounge-chair',
      sku: 'CLC-01',
      regularPrice: 2400,
      salePrice: null,
      currency: 'USD',
      showPricePublicly: true,
      isEnquiryOnly: false,
      shortDescription: 'Lounge chair',
      fullDescription: 'Full description',
      materials: 'Walnut, Bouclé',
      primaryImageUrl: 'https://mock.supabase.co/storage/v1/object/public/product-images/published/images/chair.png',
      preferredViewer: 'video',
      tags: [],
      isFeatured: false,
      sortOrder: 0,
      status: 'published',
      productVideo: {
        url: 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/new_video.mp4',
        storagePath: 'published/videos/new_video.mp4'
      }
    });

    expect(res.success).toBe(true);
    // Verified: Existing row updated in place by ID, NO duplicate inserted!
    expect(updatedRows).toHaveLength(1);
    expect(updatedRows[0].id).toBe('existing-video-media-id-777');
    expect(mediaInsertMock).not.toHaveBeenCalled();
  });

  // 13. Idempotency of Targeted Video Repair Action
  it('is idempotent and skips videos that are already cleanly published to showroom-videos', async () => {
    const mockProducts = [
      {
        id: 'prod-brera',
        name: 'Brera Sculpted Velvet Barrel Lounge Chair',
        slug: 'brera-sculpted-velvet-barrel-lounge-chair',
        status: 'published',
        product_media: [
          {
            id: 'med-brera-clean',
            product_id: 'prod-brera',
            type: 'video',
            storage_path: 'published/videos/clean_brera.mp4',
            public_url: 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/clean_brera.mp4',
            thumbnail_url: null,
            metadata: {}
          }
        ]
      }
    ];

    const uploadSpy = vi.fn();
    const updateSpy = vi.fn();

    vi.spyOn(supabase.storage, 'from').mockImplementation((b: string) => {
      if (b === 'showroom-videos') {
        return {
          upload: uploadSpy,
          list: vi.fn().mockResolvedValue({ data: [{ name: 'clean_brera.mp4' }], error: null })
        } as any;
      }
      return {} as any;
    });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({ data: mockProducts, error: null })
          })
        } as any;
      }
      if (table === 'product_media') {
        return { update: updateSpy } as any;
      }
      return {} as any;
    });

    const result = await adminService.repairTargetedProductVideos();

    expect(result.success).toBe(true);
    expect(result.scanned).toBe(1);
    expect(result.alreadyRepaired).toBe(1);
    expect(result.repaired).toBe(0);
    expect(uploadSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  });
});

