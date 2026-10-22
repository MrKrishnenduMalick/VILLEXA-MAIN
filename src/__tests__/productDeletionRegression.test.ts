import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  adminService,
  parseStorageBucketAndPath,
  isForbiddenStorageTarget
} from '../services/adminService';
import { supabase } from '../services/supabaseClient';
import * as supabaseClientModule from '../services/supabaseClient';

describe('Permanent Product Deletion and Storage Cleanup Regression Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. Path Parsing & System Folder Protection
  // =========================================================================
  describe('Storage Path Parsing and Safety Protections', () => {
    it('parses standard Supabase public storage URLs accurately', () => {
      const url = 'https://xyz.supabase.co/storage/v1/object/public/showroom-videos/published/videos/velvet-walkthrough.mp4';
      const parsed = parseStorageBucketAndPath(url);
      expect(parsed).toEqual({
        bucket: 'showroom-videos',
        path: 'published/videos/velvet-walkthrough.mp4'
      });
    });

    it('parses Supabase signed storage URLs and strips query tokens', () => {
      const url = 'https://xyz.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/1234_raw.mp4?token=secret123';
      const parsed = parseStorageBucketAndPath(url);
      expect(parsed).toEqual({
        bucket: 'atelier-vault',
        path: 'drafts/videos/1234_raw.mp4'
      });
    });

    it('parses relative published and draft paths', () => {
      expect(parseStorageBucketAndPath('published/videos/promo.mp4')).toEqual({
        bucket: 'showroom-videos',
        path: 'published/videos/promo.mp4'
      });
      expect(parseStorageBucketAndPath('published/models/chair.glb')).toEqual({
        bucket: 'product-models',
        path: 'published/models/chair.glb'
      });
      expect(parseStorageBucketAndPath('drafts/videos/chair-test.mp4')).toEqual({
        bucket: 'atelier-vault',
        path: 'drafts/videos/chair-test.mp4'
      });
    });

    it('safely ignores external non-Supabase URLs (e.g. Unsplash, external CDNs)', () => {
      expect(parseStorageBucketAndPath('https://images.unsplash.com/photo-12345')).toBeNull();
      expect(parseStorageBucketAndPath('https://cdn.luxuryliving.com/assets/img.jpg')).toBeNull();
      expect(parseStorageBucketAndPath(null)).toBeNull();
      expect(parseStorageBucketAndPath('')).toBeNull();
    });

    it('prevents accidental deletion of reserved staging folders and root directories', () => {
      expect(isForbiddenStorageTarget('')).toBe(true);
      expect(isForbiddenStorageTarget('/')).toBe(true);
      expect(isForbiddenStorageTarget('.')).toBe(true);
      expect(isForbiddenStorageTarget('hero')).toBe(true);
      expect(isForbiddenStorageTarget('hero/')).toBe(true);
      expect(isForbiddenStorageTarget('drafts')).toBe(true);
      expect(isForbiddenStorageTarget('drafts/videos')).toBe(true);
      expect(isForbiddenStorageTarget('published')).toBe(true);
      expect(isForbiddenStorageTarget('published/videos')).toBe(true);
      // Valid asset file paths must be allowed
      expect(isForbiddenStorageTarget('published/videos/specific_file.mp4')).toBe(false);
      expect(isForbiddenStorageTarget('drafts/videos/prod_sample.mp4')).toBe(false);
    });
  });

  // =========================================================================
  // 2. Authorization Security Gate
  // =========================================================================
  describe('Authorization Enforcement', () => {
    it('blocks deletion and returns unauthorized error when user is not an admin', async () => {
      vi.spyOn(supabaseClientModule, 'checkIsAdmin').mockResolvedValue(false);

      const rpcSpy = vi.spyOn(supabase, 'rpc');
      const storageRemoveSpy = vi.fn();
      vi.spyOn(supabase.storage, 'from').mockReturnValue({ remove: storageRemoveSpy } as any);

      const result = await adminService.deleteProductPermanent('prod-123');

      expect(result.success).toBe(false);
      expect(result.databaseDeleted).toBe(false);
      expect(result.error).toContain('Unauthorized');
      expect(rpcSpy).not.toHaveBeenCalled();
      expect(storageRemoveSpy).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 3. Successful Permanent Deletion & Unshared Storage Cleanup
  // =========================================================================
  describe('Successful Permanent Deletion Workflow', () => {
    it('deletes database records and purges exclusively unshared storage files', async () => {
      vi.spyOn(supabaseClientModule, 'checkIsAdmin').mockResolvedValue(true);

      const targetProduct = {
        id: 'prod-chair-001',
        name: 'Monolith Velvet Lounge Chair',
        sku: 'VLX-CHR-001',
        primary_image_url: 'https://xyz.supabase.co/storage/v1/object/public/product-images/published/images/chair-primary.webp'
      };

      const targetMedia = [
        {
          id: 'media-1',
          product_id: 'prod-chair-001',
          type: 'video',
          storage_path: 'published/videos/chair-walkthrough.mp4',
          public_url: 'https://xyz.supabase.co/storage/v1/object/public/showroom-videos/published/videos/chair-walkthrough.mp4'
        },
        {
          id: 'media-2',
          product_id: 'prod-chair-001',
          type: 'glb_model',
          storage_path: 'published/models/chair-3d.glb',
          public_url: 'https://xyz.supabase.co/storage/v1/object/public/product-models/published/models/chair-3d.glb'
        }
      ];

      // Mock database queries
      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'products') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: targetProduct, error: null })
              }),
              neq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        if (table === 'product_media') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: targetMedia, error: null }),
              neq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        if (table === 'product_sequences_360') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              neq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        if (table === 'product_finishes' || table === 'enquiries') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        if (table === 'categories' || table === 'collections' || table === 'site_settings') {
          return {
            select: vi.fn().mockResolvedValue({ data: [], error: null })
          } as any;
        }
        return { select: vi.fn().mockReturnThis() } as any;
      });

      // Mock RPC call
      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: {
          success: true,
          deleted_media_count: 2,
          deleted_finishes_count: 0,
          deleted_sequences_count: 0,
          unlinked_enquiries_count: 0
        },
        error: null
      } as any);

      // Mock storage removal
      const removedFiles: Array<{ bucket: string; paths: string[] }> = [];
      vi.spyOn(supabase.storage, 'from').mockImplementation((bucketId: string) => {
        return {
          remove: vi.fn().mockImplementation((paths: string[]) => {
            removedFiles.push({ bucket: bucketId, paths });
            return Promise.resolve({ data: paths, error: null });
          })
        } as any;
      });

      const result = await adminService.deleteProductPermanent('prod-chair-001');

      expect(result.success).toBe(true);
      expect(result.databaseDeleted).toBe(true);
      expect(result.productName).toBe('Monolith Velvet Lounge Chair');
      expect(result.deletedMediaCount).toBe(2);
      expect(result.storageFailedCount).toBe(0);

      // Verify that all 3 unshared candidate assets were removed from storage
      const removedPaths = removedFiles.flatMap((r) => r.paths);
      expect(removedPaths).toContain('published/images/chair-primary.webp');
      expect(removedPaths).toContain('published/videos/chair-walkthrough.mp4');
      expect(removedPaths).toContain('published/models/chair-3d.glb');
    });
  });

  // =========================================================================
  // 4. Shared Asset Protection
  // =========================================================================
  describe('Shared Asset Protection', () => {
    it('preserves files shared with categories, collections, other products, or site settings', async () => {
      vi.spyOn(supabaseClientModule, 'checkIsAdmin').mockResolvedValue(true);

      const targetProduct = {
        id: 'prod-shared-001',
        name: 'Shared Table',
        sku: 'VLX-TBL-001',
        // This image is also used as category cover!
        primary_image_url: 'https://xyz.supabase.co/storage/v1/object/public/product-images/published/images/shared-table-cover.webp'
      };

      const targetMedia = [
        {
          id: 'media-video-1',
          product_id: 'prod-shared-001',
          type: 'video',
          // This video is uniquely owned by this product
          storage_path: 'published/videos/unique-table-video.mp4',
          public_url: 'https://xyz.supabase.co/storage/v1/object/public/showroom-videos/published/videos/unique-table-video.mp4'
        },
        {
          id: 'media-hero-1',
          product_id: 'prod-shared-001',
          type: 'video',
          // This file is also referenced in site_settings (homepage hero)!
          storage_path: 'showroom-videos/hero/cinematic-master.mp4',
          public_url: 'https://xyz.supabase.co/storage/v1/object/public/showroom-videos/hero/cinematic-master.mp4'
        }
      ];

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'products') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: targetProduct, error: null })
              }),
              neq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        if (table === 'product_media') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: targetMedia, error: null }),
              neq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        if (table === 'product_sequences_360' || table === 'product_finishes' || table === 'enquiries') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
              neq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        if (table === 'categories') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                {
                  name: 'Dining Tables',
                  cover_image_url: 'https://xyz.supabase.co/storage/v1/object/public/product-images/published/images/shared-table-cover.webp'
                }
              ],
              error: null
            })
          } as any;
        }
        if (table === 'collections') {
          return {
            select: vi.fn().mockResolvedValue({ data: [], error: null })
          } as any;
        }
        if (table === 'site_settings') {
          return {
            select: vi.fn().mockResolvedValue({
              data: [
                {
                  key: 'hero',
                  value: { mediaUrl: 'https://xyz.supabase.co/storage/v1/object/public/showroom-videos/hero/cinematic-master.mp4' }
                }
              ],
              error: null
            })
          } as any;
        }
        return { select: vi.fn().mockReturnThis() } as any;
      });

      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: { success: true },
        error: null
      } as any);

      const removedFiles: string[] = [];
      vi.spyOn(supabase.storage, 'from').mockImplementation(() => {
        return {
          remove: vi.fn().mockImplementation((paths: string[]) => {
            removedFiles.push(...paths);
            return Promise.resolve({ data: paths, error: null });
          })
        } as any;
      });

      const result = await adminService.deleteProductPermanent('prod-shared-001');

      expect(result.success).toBe(true);
      expect(result.databaseDeleted).toBe(true);

      // Verify audit statuses:
      const sharedCover = result.storageCleanup.find((i) => i.path.includes('shared-table-cover.webp'));
      expect(sharedCover?.status).toBe('skipped_shared');
      expect(sharedCover?.reason).toContain('Dining Tables');

      const sharedHero = result.storageCleanup.find((i) => i.path.includes('cinematic-master.mp4'));
      expect(sharedHero?.status).toBe('skipped_shared');
      expect(sharedHero?.reason).toContain('site settings');

      const uniqueVideo = result.storageCleanup.find((i) => i.path.includes('unique-table-video.mp4'));
      expect(uniqueVideo?.status).toBe('deleted');

      // Crucial verification: shared files were NEVER removed from storage
      expect(removedFiles).not.toContain('published/images/shared-table-cover.webp');
      expect(removedFiles).not.toContain('hero/cinematic-master.mp4');
      expect(removedFiles).toContain('published/videos/unique-table-video.mp4');
    });
  });

  // =========================================================================
  // 5. Database Failure Abort Safety
  // =========================================================================
  describe('Database Deletion Failure Protection', () => {
    it('aborts storage cleanup if database deletion fails', async () => {
      vi.spyOn(supabaseClientModule, 'checkIsAdmin').mockResolvedValue(true);

      const targetProduct = {
        id: 'prod-fail-001',
        name: 'Fail Safe Product',
        sku: 'VLX-FAIL-001'
      };

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'products') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: targetProduct, error: null })
              }),
              neq: vi.fn().mockResolvedValue({ data: [], error: null })
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: { message: 'Database lock timeout' } })
            })
          } as any;
        }
        if (table === 'enquiries') {
          return {
            select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ data: [], error: null }) }),
            update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
          } as any;
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            neq: vi.fn().mockResolvedValue({ data: [], error: null })
          }),
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        } as any;
      });

      // RPC fails
      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: null,
        error: { message: 'RPC function error' }
      } as any);

      const storageRemoveSpy = vi.fn();
      vi.spyOn(supabase.storage, 'from').mockReturnValue({ remove: storageRemoveSpy } as any);

      const result = await adminService.deleteProductPermanent('prod-fail-001');

      expect(result.success).toBe(false);
      expect(result.databaseDeleted).toBe(false);
      expect(result.error).toContain('Database deletion failed');
      // Storage cleanup MUST be aborted to avoid orphaned database records without media
      expect(storageRemoveSpy).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 6. Partial Storage Failure & Retryable Recovery
  // =========================================================================
  describe('Partial Storage Failure and Cleanup Retry', () => {
    it('reports partial failure when storage delete fails, and succeeds upon retry', async () => {
      vi.spyOn(supabaseClientModule, 'checkIsAdmin').mockResolvedValue(true);

      const targetProduct = {
        id: 'prod-partial-001',
        name: 'Partial Product',
        sku: 'VLX-PART-001'
      };

      const targetMedia = [
        {
          id: 'media-1',
          product_id: 'prod-partial-001',
          type: 'video',
          storage_path: 'published/videos/video-fail.mp4',
          public_url: 'https://xyz.supabase.co/storage/v1/object/public/showroom-videos/published/videos/video-fail.mp4'
        }
      ];

      vi.spyOn(supabase, 'from').mockImplementation((table: string) => {
        if (table === 'products') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: targetProduct, error: null })
              }),
              neq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        if (table === 'product_media') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: targetMedia, error: null }),
              neq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            neq: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        } as any;
      });

      vi.spyOn(supabase, 'rpc').mockResolvedValue({
        data: { success: true },
        error: null
      } as any);

      // Simulate storage remove failure on first attempt
      vi.spyOn(supabase.storage, 'from').mockImplementation(() => {
        return {
          remove: vi.fn().mockResolvedValue({ data: null, error: { message: 'Storage connection timeout' } })
        } as any;
      });

      const initialResult = await adminService.deleteProductPermanent('prod-partial-001');

      // Database was deleted, but storage failed: complete success MUST NOT be reported
      expect(initialResult.databaseDeleted).toBe(true);
      expect(initialResult.success).toBe(false);
      expect(initialResult.storageFailedCount).toBe(1);
      expect(initialResult.storageCleanup[0].status).toBe('failed');
      expect(initialResult.storageCleanup[0].error).toContain('Storage connection timeout');

      // Now retry the cleanup using retryStorageCleanup
      vi.spyOn(supabase.storage, 'from').mockImplementation(() => {
        return {
          remove: vi.fn().mockResolvedValue({ data: ['published/videos/video-fail.mp4'], error: null })
        } as any;
      });

      const retryResult = await adminService.retryStorageCleanup(initialResult.storageCleanup);

      expect(retryResult.success).toBe(true);
      expect(retryResult.remainingFailedCount).toBe(0);
      expect(retryResult.results[0].status).toBe('deleted');
    });
  });
});
