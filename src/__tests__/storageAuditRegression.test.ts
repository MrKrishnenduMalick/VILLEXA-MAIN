import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  storageAuditService,
  listBucketObjectsRecursive,
  extractReferencesFromJson
} from '../services/storageAuditService';
import { supabase } from '../services/supabaseClient';
import * as supabaseClientModule from '../services/supabaseClient';

describe('Storage Audit & Cleanup Observability Regression Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. Recursive Storage Pagination
  // =========================================================================
  describe('Recursive Storage Pagination', () => {
    it('handles multiple pages and traverses subdirectories accurately', async () => {
      // Mock page 1 returning 2 files and 1 directory
      const page1 = [
        { id: '1', name: 'photo-1.jpg', metadata: { size: 1024, mimetype: 'image/jpeg' }, updated_at: '2026-10-20' },
        { id: '2', name: 'photo-2.jpg', metadata: { size: 2048, mimetype: 'image/jpeg' }, updated_at: '2026-10-20' },
        { id: null, name: 'subfolder', metadata: null } // Directory entry
      ];
      // Mock subfolder contents
      const subfolderContents = [
        { id: '3', name: 'nested.jpg', metadata: { size: 4096, mimetype: 'image/jpeg' }, updated_at: '2026-10-20' }
      ];

      vi.spyOn(supabase.storage, 'from').mockImplementation(() => ({
        list: vi.fn().mockImplementation((folder: string, options?: any) => {
          if (folder === '') {
            if (options?.offset === 0) {
              return Promise.resolve({ data: page1, error: null });
            }
            return Promise.resolve({ data: [], error: null });
          }
          if (folder === 'subfolder') {
            return Promise.resolve({ data: subfolderContents, error: null });
          }
          return Promise.resolve({ data: [], error: null });
        })
      } as any));

      const result = await listBucketObjectsRecursive('product-images', '', 2);

      expect(result.error).toBeUndefined();
      expect(result.objects.length).toBe(3);
      expect(result.objects.map(o => o.path)).toContain('photo-1.jpg');
      expect(result.objects.map(o => o.path)).toContain('photo-2.jpg');
      expect(result.objects.map(o => o.path)).toContain('subfolder/nested.jpg');
    });
  });

  // =========================================================================
  // 2. Reference Extraction & Normalization
  // =========================================================================
  describe('Reference Extraction from JSON and URLs', () => {
    it('extracts nested storage URLs from arbitrary settings objects', () => {
      const complexSetting = {
        title: 'Atelier Hero',
        heroVideo: 'https://xyz.supabase.co/storage/v1/object/public/showroom-videos/hero/videos/hero-2026.mp4',
        details: {
          poster: 'https://xyz.supabase.co/storage/v1/object/public/product-images/published/images/poster.webp',
          draft: 'https://xyz.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/temp.mp4?token=abc123token'
        }
      };

      const extracted: string[] = [];
      extractReferencesFromJson(complexSetting, (url) => extracted.push(url));

      expect(extracted).toContain('https://xyz.supabase.co/storage/v1/object/public/showroom-videos/hero/videos/hero-2026.mp4');
      expect(extracted).toContain('https://xyz.supabase.co/storage/v1/object/public/product-images/published/images/poster.webp');
      expect(extracted).toContain('https://xyz.supabase.co/storage/v1/object/sign/atelier-vault/drafts/videos/temp.mp4?token=abc123token');
    });
  });

  // =========================================================================
  // 3. Known Assets Protection (Hero Video & Showroom Atmosphere)
  // =========================================================================
  describe('Known Website Assets Protection', () => {
    it('preserves hero video and marks it as REFERENCED_KEEP', async () => {
      vi.spyOn(supabaseClientModule, 'checkIsAdmin').mockResolvedValue(true);

      const heroObject = {
        id: 'hero-1',
        name: '1792270227821_5nt5cz_villexa-hero.mp4',
        metadata: { size: 42273360, mimetype: 'video/mp4' },
        updated_at: '2026-10-17T20:50:41Z'
      };

      // Mock DB: site_settings hero contains hero video
      vi.spyOn(supabase, 'from').mockImplementation((table: string) => ({
        select: vi.fn().mockImplementation(() => {
          if (table === 'site_settings') {
            return Promise.resolve({
              data: [
                {
                  key: 'hero',
                  value: { mediaUrl: 'https://xyz.supabase.co/storage/v1/object/public/showroom-videos/hero/videos/1792270227821_5nt5cz_villexa-hero.mp4' }
                }
              ],
              error: null
            });
          }
          return Promise.resolve({ data: [], error: null });
        })
      } as any));

      // Mock storage
      vi.spyOn(supabase.storage, 'from').mockImplementation((bucket: string) => ({
        list: vi.fn().mockImplementation((folder: string) => {
          if (bucket === 'showroom-videos') {
            if (folder === '') {
              return Promise.resolve({ data: [{ id: null, name: 'hero', metadata: null }], error: null });
            }
            if (folder === 'hero') {
              return Promise.resolve({ data: [{ id: null, name: 'videos', metadata: null }], error: null });
            }
            if (folder === 'hero/videos') {
              return Promise.resolve({ data: [heroObject], error: null });
            }
          }
          return Promise.resolve({ data: [], error: null });
        })
      } as any));

      const report = await storageAuditService.runAudit();

      const heroAudited = report.items.find(i => i.path === 'hero/videos/1792270227821_5nt5cz_villexa-hero.mp4');
      expect(heroAudited).toBeDefined();
      expect(heroAudited?.classification).toBe('REFERENCED_KEEP');
      expect(heroAudited?.bucket).toBe('showroom-videos');
      expect(heroAudited?.size).toBe(42273360);
    });

    it('identifies missing protected showroom asset without error and flags it in report', async () => {
      vi.spyOn(supabaseClientModule, 'checkIsAdmin').mockResolvedValue(true);

      // site_settings has showroom_media pointing to vault
      vi.spyOn(supabase, 'from').mockImplementation((table: string) => ({
        select: vi.fn().mockImplementation(() => {
          if (table === 'site_settings') {
            return Promise.resolve({
              data: [
                {
                  key: 'showroom_media',
                  value: {
                    videoUrl: 'https://xyz.supabase.co/storage/v1/object/sign/atelier-vault/showroom/videos/videos/1791981350785_9964ft_villexa-hero.mp4?token=secret'
                  }
                }
              ],
              error: null
            });
          }
          return Promise.resolve({ data: [], error: null });
        })
      } as any));

      // Storage is empty
      vi.spyOn(supabase.storage, 'from').mockImplementation(() => ({
        list: vi.fn().mockResolvedValue({ data: [], error: null })
      } as any));

      const report = await storageAuditService.runAudit();

      const missing = report.missingProtectedAssets.find(m => m.path.includes('1791981350785_9964ft_villexa-hero.mp4'));
      expect(missing).toBeDefined();
      expect(missing?.bucket).toBe('atelier-vault');
      expect(missing?.referencedBy).toContain('site_settings');
    });
  });

  // =========================================================================
  // 4. Incomplete Database Reference Fail-Safe
  // =========================================================================
  describe('Conservative Fail-Safe When Reference Check Fails', () => {
    it('classifies unreferenced objects as NEEDS_REVIEW if a database reference check fails', async () => {
      vi.spyOn(supabaseClientModule, 'checkIsAdmin').mockResolvedValue(true);

      // Simulate failure in products table query
      vi.spyOn(supabase, 'from').mockImplementation((table: string) => ({
        select: vi.fn().mockImplementation(() => {
          if (table === 'products') {
            return Promise.resolve({ data: null, error: { message: 'Database query timeout' } });
          }
          return Promise.resolve({ data: [], error: null });
        })
      } as any));

      // Storage returns an object
      vi.spyOn(supabase.storage, 'from').mockImplementation((bucket: string) => ({
        list: vi.fn().mockImplementation((folder: string) => {
          if (bucket === 'product-images' && folder === '') {
            return Promise.resolve({
              data: [
                {
                  id: 'orph-1',
                  name: 'chair.png',
                  metadata: { size: 5000, mimetype: 'image/png' },
                  updated_at: '2026-10-18'
                }
              ],
              error: null
            });
          }
          return Promise.resolve({ data: [], error: null });
        })
      } as any));

      const report = await storageAuditService.runAudit();

      expect(report.isComplete).toBe(false);
      expect(report.referenceChecks.products.success).toBe(false);

      const item = report.items.find(i => i.path === 'chair.png');
      expect(item).toBeDefined();
      // Crucial: Must be classified as NEEDS_REVIEW, NOT UNREFERENCED_CANDIDATE, because reference check failed
      expect(item?.classification).toBe('NEEDS_REVIEW');
      expect(item?.reason).toContain('partial failure');
    });
  });

  // =========================================================================
  // 5. Safe Batch Deletion of Candidates
  // =========================================================================
  describe('Batch Deletion Security & Execution', () => {
    it('deletes selected candidates in batches and rejects protected system paths', async () => {
      vi.spyOn(supabaseClientModule, 'checkIsAdmin').mockResolvedValue(true);

      const removeSpy = vi.fn().mockResolvedValue({ data: {}, error: null });
      vi.spyOn(supabase.storage, 'from').mockReturnValue({ remove: removeSpy } as any);

      const candidates = [
        { bucket: 'product-images', path: 'published/orphan1.png', size: 1000 },
        { bucket: 'product-images', path: 'published/orphan2.png', size: 2000 },
        // Attempt to pass a protected system path
        { bucket: 'showroom-videos', path: 'hero', size: 0 }
      ];

      const result = await storageAuditService.deleteSelectedCandidates(candidates);

      expect(result.totalRequested).toBe(3);
      expect(result.successCount).toBe(2);
      expect(result.failedCount).toBe(1);
      expect(result.reclaimedBytes).toBe(3000);

      // Verify that 'hero' was rejected
      const heroResult = result.results.find(r => r.path === 'hero');
      expect(heroResult?.success).toBe(false);
      expect(heroResult?.error).toContain('Protected system path');

      // Verify that the 2 valid candidates were removed
      expect(removeSpy).toHaveBeenCalledWith(['published/orphan1.png']);
      expect(removeSpy).toHaveBeenCalledWith(['published/orphan2.png']);
    });

    it('rejects deletion attempt when unauthorized', async () => {
      vi.spyOn(supabaseClientModule, 'checkIsAdmin').mockResolvedValue(false);

      await expect(
        storageAuditService.deleteSelectedCandidates([
          { bucket: 'product-images', path: 'orphan.png', size: 100 }
        ])
      ).rejects.toThrow('Unauthorized');
    });
  });
});
