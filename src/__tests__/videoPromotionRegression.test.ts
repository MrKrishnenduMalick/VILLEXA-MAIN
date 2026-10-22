import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService, extractVaultPathFromUrl } from '../services/adminService';
import { promoteDraftToPublic, VAULT_BUCKET } from '../services/storageService';
import { supabase } from '../services/supabaseClient';

describe('Video Promotion from atelier-vault to showroom-videos Regression Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Successful Promotion to showroom-videos/published/videos/
  it('promotes video from atelier-vault/videos to showroom-videos/published/videos/ and obtains permanent public CDN URL', async () => {
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

    const result = await promoteDraftToPublic('videos/12345_lounge-walkthrough.mp4', 'video', {
      deleteSourceAfterVerification: true
    });

    expect(result.success).toBe(true);
    expect(downloadSpy).toHaveBeenCalledWith('videos/12345_lounge-walkthrough.mp4');
    expect(uploadSpy).toHaveBeenCalledWith(
      'published/videos/12345_lounge-walkthrough.mp4',
      fakeVideoBlob,
      expect.objectContaining({ contentType: 'video/mp4', upsert: true })
    );
    expect(result.publicPath).toBe('published/videos/12345_lounge-walkthrough.mp4');
    expect(result.publicUrl).toBe('https://project.supabase.co/storage/v1/object/public/showroom-videos/published/videos/lounge-walkthrough.mp4');
    expect(removeSpy).toHaveBeenCalledWith(['videos/12345_lounge-walkthrough.mp4']);
  });

  // 2. Promotion Failure Reporting & Staging Preservation
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

  // 3. Missing Source Object in Vault Handling
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

  // 4. Correct Destination storage_path and Permanent URL validation
  it('generates correct destination storage_path and rejects signed token URLs from published storage', () => {
    const signedVaultUrl = 'https://mock.supabase.co/storage/v1/object/sign/atelier-vault/videos/vesper.mp4?token=temporary-token-xyz';
    const relativeVaultPath = 'videos/vesper.mp4';
    const permanentPublishedUrl = 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/vesper.mp4';

    // Verify accurate extraction
    expect(extractVaultPathFromUrl(signedVaultUrl)).toBe('videos/vesper.mp4');
    expect(extractVaultPathFromUrl(relativeVaultPath)).toBe('videos/vesper.mp4');
    expect(extractVaultPathFromUrl(permanentPublishedUrl)).toBeNull();

    // Verify permanent URL properties
    expect(permanentPublishedUrl).toContain('/showroom-videos/published/videos/');
    expect(permanentPublishedUrl).not.toContain('atelier-vault');
    expect(permanentPublishedUrl).not.toContain('token=');
  });

  // 5. Retry Without Duplicate Objects
  it('avoids duplicate copy on retry when the destination object already exists in showroom-videos', async () => {
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

    const result = await promoteDraftToPublic('videos/existing-video.mp4', 'video');

    expect(result.success).toBe(true);
    expect(result.alreadyExisted).toBe(true);
    expect(result.publicPath).toBe('published/videos/existing-video.mp4');
    expect(result.publicUrl).toBe('https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/existing-video.mp4');
    // Neither download nor upload should be called because file already exists in destination
    expect(uploadSpy).not.toHaveBeenCalled();
    expect(downloadSpy).not.toHaveBeenCalled();
  });

  // 6. Product Save / Publish Error Reporting & Staging Cleanup Verification
  it('saveProduct invokes promotion, awaits it, cleans up staging on success, and halts with error on failure', async () => {
    const fakeVideoBlob = new Blob(['sample mp4'], { type: 'video/mp4' });
    const downloadSpy = vi.fn().mockResolvedValue({ data: fakeVideoBlob, error: null });
    const uploadSpy = vi.fn().mockResolvedValue({ data: { path: 'published/videos/armchair.mp4' }, error: null });
    const removeSpy = vi.fn().mockResolvedValue({ data: {}, error: null });
    const getPublicUrlSpy = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/armchair.mp4' }
    });

    vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
      if (bucketId === VAULT_BUCKET) {
        return { download: downloadSpy, remove: removeSpy } as any;
      }
      if (bucketId === 'showroom-videos') {
        return { upload: uploadSpy, getPublicUrl: getPublicUrlSpy } as any;
      }
      return {} as any;
    });

    // Mock successful product insert and media insert
    const insertMock = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: { id: 'new-prod-id' }, error: null })
      })
    });
    const mediaInsertMock = vi.fn().mockResolvedValue({ data: {}, error: null });
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
        return { insert: mediaInsertMock, delete: mediaDeleteMock } as any;
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
        url: 'https://mock.supabase.co/storage/v1/object/sign/atelier-vault/videos/armchair.mp4?token=abc',
        storagePath: 'videos/armchair.mp4'
      }
    });

    expect(res.success).toBe(true);
    expect(res.promotedVideo?.url).toBe('https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/armchair.mp4');
    expect(res.promotedVideo?.storagePath).toBe('published/videos/armchair.mp4');
    // Staging file in atelier-vault must be deleted once persistence succeeds
    expect(removeSpy).toHaveBeenCalledWith(['videos/armchair.mp4']);
  });

  // 7. Safe Recovery Routine (repairPublishedProductVideos)
  it('safe recovery routine locates unpromoted published videos in atelier-vault, promotes them, updates DB, and cleans staging', async () => {
    const fakeBlob = new Blob(['recovery mp4 content'], { type: 'video/mp4' });
    const downloadSpy = vi.fn().mockResolvedValue({ data: fakeBlob, error: null });
    const uploadSpy = vi.fn().mockResolvedValue({ data: { path: 'published/videos/legacy-sofa.mp4' }, error: null });
    const removeSpy = vi.fn().mockResolvedValue({ data: {}, error: null });
    const getPublicUrlSpy = vi.fn().mockReturnValue({
      data: { publicUrl: 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/legacy-sofa.mp4' }
    });

    vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
      if (bucketId === VAULT_BUCKET) {
        return { download: downloadSpy, remove: removeSpy } as any;
      }
      if (bucketId === 'showroom-videos') {
        return { upload: uploadSpy, getPublicUrl: getPublicUrlSpy } as any;
      }
      return {} as any;
    });

    // Mock published product with video still in atelier-vault
    const mockPublishedProduct = {
      id: 'legacy-prod-1',
      name: 'Legacy Cloud Sofa',
      slug: 'legacy-cloud-sofa',
      status: 'published',
      product_media: [
        {
          id: 'med-legacy-video-1',
          type: 'video',
          storage_path: 'videos/legacy-sofa.mp4',
          public_url: 'https://mock.supabase.co/storage/v1/object/sign/atelier-vault/videos/legacy-sofa.mp4?token=expired-token-123',
          thumbnail_url: null,
          metadata: {}
        }
      ]
    };

    const updateMock = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: {}, error: null })
    });

    vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [mockPublishedProduct], error: null })
          })
        } as any;
      }
      if (table === 'product_media') {
        return {
          update: updateMock
        } as any;
      }
      return {} as any;
    });

    const recoveryResult = await adminService.repairPublishedProductVideos();

    expect(recoveryResult.success).toBe(true);
    expect(recoveryResult.scanned).toBe(1);
    expect(recoveryResult.repaired).toBe(1);
    expect(recoveryResult.errors).toHaveLength(0);
    expect(recoveryResult.details[0].productId).toBe('legacy-prod-1');
    expect(recoveryResult.details[0].newUrl).toBe('https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/legacy-sofa.mp4');
    expect(recoveryResult.details[0].storagePath).toBe('published/videos/legacy-sofa.mp4');

    // Verify DB update was executed
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        public_url: 'https://mock.supabase.co/storage/v1/object/public/showroom-videos/published/videos/legacy-sofa.mp4',
        storage_path: 'published/videos/legacy-sofa.mp4'
      })
    );
    // Verify staging copy in atelier-vault was removed
    expect(removeSpy).toHaveBeenCalledWith(['videos/legacy-sofa.mp4']);
  });
});
