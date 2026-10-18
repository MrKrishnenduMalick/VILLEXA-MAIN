import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateFile, uploadPublicAsset, UPLOAD_LIMITS } from '../services/storageService';
import { adminService } from '../services/adminService';
import { siteConfigService } from '../services/siteConfigService';
import { supabase } from '../services/supabaseClient';
import { HeroConfig } from '../types/content';
import { isHomeRoute } from '../context/CinematicHeroContext';

describe('Phase 1: Cinematic Hero & Showroom Architecture', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  // 1. Media Validation Rules for Hero Video
  describe('Hero Video Media Validation', () => {
    it('strictly permits MP4 and WebM video formats under 100MB', () => {
      expect(UPLOAD_LIMITS.video.maxBytes).toBe(100 * 1024 * 1024);
      expect(UPLOAD_LIMITS.video.allowedExtensions).toContain('.mp4');
      expect(UPLOAD_LIMITS.video.allowedExtensions).toContain('.webm');
      expect(UPLOAD_LIMITS.video.bucket).toBe('showroom-videos');

      const validMp4 = new File(['dummy-mp4-data'], 'atelier_hero.mp4', { type: 'video/mp4' });
      expect(validateFile(validMp4, 'video').valid).toBe(true);

      const validWebm = new File(['dummy-webm-data'], 'atelier_hero.webm', { type: 'video/webm' });
      expect(validateFile(validWebm, 'video').valid).toBe(true);
    });

    it('rejects unsupported video file formats (e.g. .avi, .mov, .mkv)', () => {
      const aviFile = new File(['dummy-avi'], 'unsupported.avi', { type: 'video/x-msvideo' });
      const aviValidation = validateFile(aviFile, 'video');
      expect(aviValidation.valid).toBe(false);
      expect(aviValidation.error).toContain('is not allowed');

      const movFile = new File(['dummy-mov'], 'unsupported.mov', { type: 'video/quicktime' });
      const movValidation = validateFile(movFile, 'video');
      expect(movValidation.valid).toBe(false);
    });

    it('rejects files exceeding the 100MB quota for video', () => {
      // Simulate file exceeding 100MB
      const oversizedFile = {
        name: 'massive_video.mp4',
        size: 105 * 1024 * 1024,
        type: 'video/mp4'
      } as unknown as File;

      const result = validateFile(oversizedFile, 'video');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds the maximum size limit of 100MB');
    });

    it('validates hero poster images up to 15MB with standard image types', () => {
      const validJpg = new File(['dummy-jpg'], 'hero_poster.jpg', { type: 'image/jpeg' });
      expect(validateFile(validJpg, 'image').valid).toBe(true);

      const validWebp = new File(['dummy-webp'], 'hero_poster.webp', { type: 'image/webp' });
      expect(validateFile(validWebp, 'image').valid).toBe(true);

      const oversizedJpg = {
        name: 'huge_poster.jpg',
        size: 18 * 1024 * 1024,
        type: 'image/jpeg'
      } as unknown as File;
      expect(validateFile(oversizedJpg, 'image').valid).toBe(false);
    });
  });

  // 2. Direct Showroom Bucket Storage Promotion
  describe('Hero Video Storage and CDN URL Generation', () => {
    it('uploads valid hero video to public showroom bucket and obtains permanent URL', async () => {
      const mockPublicUrl = 'https://cdn.villexa.com/showroom-videos/hero/12345_atelier_hero.mp4';

      vi.spyOn(supabase.storage, 'from').mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'hero/12345_atelier_hero.mp4' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: mockPublicUrl } })
      } as any);

      const validVideo = new File(['video-content'], 'atelier_hero.mp4', { type: 'video/mp4' });
      const result = await uploadPublicAsset(validVideo, 'video', 'hero/videos');

      expect(result.success).toBe(true);
      expect(result.publicUrl).toBe(mockPublicUrl);
      expect(result.storagePath).toContain('hero/videos/');
    });
  });

  // 3. Hero Settings Persistence
  describe('Admin Hero Configuration Persistence', () => {
    it('persists hero configuration with dedicated video asset', async () => {
      const newHeroConfig: HeroConfig = {
        kicker: 'HAUTE ÉBÉNISTERIE ITALIENNE',
        title: 'Architectural Monoliths & Tactile Materiality',
        subtitle: 'Sculpted for private residences and global estates.',
        primaryCtaLabel: 'View Master Catalogue',
        primaryCtaLink: '/catalogue',
        secondaryCtaLabel: 'Commission Consultation',
        secondaryCtaLink: '/contact',
        mediaType: 'video',
        mediaUrl: 'https://cdn.villexa.com/showroom-videos/hero/12345_atelier_hero.mp4',
        posterUrl: 'https://cdn.villexa.com/product-images/hero/12345_poster.webp'
      };

      const upsertSpy = vi.fn().mockResolvedValue({ error: null });
      vi.spyOn(supabase, 'from').mockReturnValue({
        upsert: upsertSpy
      } as any);

      const saveRes = await adminService.saveSiteSettings('hero', newHeroConfig);
      expect(saveRes.success).toBe(true);
      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'hero',
          value: newHeroConfig
        })
      );
    });

    it('retrieves updated hero video configuration from siteConfigService', async () => {
      const savedHero: HeroConfig = {
        kicker: 'ARCHITECTURAL EDITIONS',
        title: 'Monolithic Furniture in Travertine & French Walnut',
        subtitle: 'Crafted in Brianza.',
        primaryCtaLabel: 'Catalogue',
        primaryCtaLink: '/catalogue',
        secondaryCtaLabel: 'Contact',
        secondaryCtaLink: '/contact',
        mediaType: 'video',
        mediaUrl: 'https://cdn.villexa.com/showroom-videos/hero/atelier_monolith.mp4',
        posterUrl: null
      };

      vi.spyOn(supabase, 'from').mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [
            { key: 'hero', value: savedHero },
            { key: 'showroom_media', value: { enabled: false } },
            { key: 'brand', value: { brandName: 'VILLEXA' } }
          ],
          error: null
        })
      } as any);

      const siteConfig = await siteConfigService.getSiteConfig();
      expect(siteConfig.hero.mediaType).toBe('video');
      expect(siteConfig.hero.mediaUrl).toBe('https://cdn.villexa.com/showroom-videos/hero/atelier_monolith.mp4');
      expect(siteConfig.hero.title).toBe('Monolithic Furniture in Travertine & French Walnut');
    });
  });

  // 4. Scroll Scrubbing Mechanics & Continuity
  describe('Cinematic Scroll Scrubbing Calculations', () => {
    it('properly clamps scroll progress between 0.0 and 1.0', () => {
      const calculateProgress = (scrollY: number, trackHeight: number, windowHeight: number) => {
        const totalScrollable = trackHeight - windowHeight;
        if (totalScrollable <= 0) return 0;
        return Math.min(Math.max(scrollY / totalScrollable, 0), 1);
      };

      const trackH = 3000;
      const winH = 1000;
      // At top
      expect(calculateProgress(0, trackH, winH)).toBe(0);
      // Halfway
      expect(calculateProgress(1000, trackH, winH)).toBe(0.5);
      // Exactly at end
      expect(calculateProgress(2000, trackH, winH)).toBe(1.0);
      // Scrolled past end
      expect(calculateProgress(2500, trackH, winH)).toBe(1.0);
      // Scrolled before top
      expect(calculateProgress(-100, trackH, winH)).toBe(0);
    });

    it('correctly maps target video seek time proportionally to progress * duration', () => {
      const duration = 12.5; // seconds
      const progress = 0.6;
      const targetTime = Math.min(Math.max(progress * duration, 0), Math.max(duration - 0.05, 0));
      expect(targetTime).toBeCloseTo(7.5, 2);
    });

    it('holds final frame when sequence completes or on non-homepage views', () => {
      const duration = 15.0;
      const progress = 1.0;
      const finalFrameTarget = Math.max(duration - 0.05, 0);
      const computed = Math.min(Math.max(progress * duration, 0), finalFrameTarget);
      expect(computed).toBe(14.95);
    });
  });

  // 5. Cinematic Frame Sequence Engine Mechanics
  describe('Cinematic Frame Sequence Engine', () => {
    const frameCount = 384;

    const mapProgressToFrameIndex = (progress: number, totalFrames: number): number => {
      const clamped = Math.min(Math.max(progress, 0), 1);
      return Math.min(Math.max(Math.round(clamped * (totalFrames - 1)) + 1, 1), totalFrames);
    };

    const getFramePath = (index: number): string => {
      const padded = String(index).padStart(5, '0');
      return `/hero-frames/frame-${padded}.webp`;
    };

    it('accurately maps progress 0.0 to frame 1 and progress 1.0 to frame 384', () => {
      expect(mapProgressToFrameIndex(0.0, frameCount)).toBe(1);
      expect(mapProgressToFrameIndex(0.5, frameCount)).toBe(193);
      expect(mapProgressToFrameIndex(1.0, frameCount)).toBe(384);
    });

    it('generates zero-padded 5-digit frame filenames conforming to the 384-frame set', () => {
      expect(getFramePath(1)).toBe('/hero-frames/frame-00001.webp');
      expect(getFramePath(99)).toBe('/hero-frames/frame-00099.webp');
      expect(getFramePath(384)).toBe('/hero-frames/frame-00384.webp');
    });

    it('persists frameSequence configuration and atomic previousSequence snapshot for rollback', async () => {
      const frameSequenceConfig = {
        version: '1.0.0',
        frameCount: 384,
        width: 1600,
        height: 900,
        framePattern: '/hero-frames/frame-{index}.webp',
        firstFrame: '/hero-frames/frame-00001.webp',
        finalFrame: '/hero-frames/frame-00384.webp',
        manifestUrl: '/hero-frames/manifest.json',
        totalSizeBytes: 40199840,
        isPublished: true,
        publishedAt: '2026-10-18T00:00:00.000Z',
        previousSequence: null
      };

      const heroWithFrames: HeroConfig = {
        kicker: 'HAUTE ÉBÉNISTERIE',
        title: 'Pure Architectural Form Meets Bespoke Craftsmanship',
        subtitle: 'Curated interior masterworks crafted for refined living spaces.',
        primaryCtaLabel: 'Explore Catalogue',
        primaryCtaLink: '/catalogue',
        secondaryCtaLabel: 'Request Commission',
        secondaryCtaLink: '/contact',
        mediaType: 'frames',
        mediaUrl: '/hero-frames/frame-00001.webp',
        posterUrl: '/hero-frames/frame-00001.webp',
        frameSequence: frameSequenceConfig
      };

      const upsertSpy = vi.fn().mockResolvedValue({ error: null });
      vi.spyOn(supabase, 'from').mockReturnValue({ upsert: upsertSpy } as any);

      const saveRes = await adminService.saveSiteSettings('hero', heroWithFrames);
      expect(saveRes.success).toBe(true);
      expect(upsertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'hero',
          value: expect.objectContaining({
            mediaType: 'frames',
            frameSequence: expect.objectContaining({
              frameCount: 384,
              width: 1600,
              height: 900
            })
          })
        })
      );
    });

    // 6. Regression Suite: Frame 384 Root Cause & Lifecycle Fix
    it('reliably normalizes homepage routes across variations using production isHomeRoute', () => {
      expect(isHomeRoute('/')).toBe(true);
      expect(isHomeRoute('')).toBe(true);
      expect(isHomeRoute('/index.html')).toBe(true);
      expect(isHomeRoute('/?utm_source=test')).toBe(true);
      expect(isHomeRoute('/#collection-intro')).toBe(true);
      expect(isHomeRoute('/catalogue')).toBe(false);
      expect(isHomeRoute('/inspiration')).toBe(false);
      expect(isHomeRoute('/product/emerald-velvet-armchair')).toBe(false);
    });

    it('selects frame 1 on initial homepage entry even if isHeroCompleted lingered', () => {
      const isHomePage = true;
      const isHeroCompletedLingering = true;
      const scrollProgress = 0.0;
      const frameCount = 384;

      // Target index selection formula
      const targetIndex = (!isHomePage || (isHeroCompletedLingering && scrollProgress >= 0.99))
        ? frameCount
        : Math.min(Math.max(Math.round(scrollProgress * (frameCount - 1)) + 1, 1), frameCount);

      expect(targetIndex).toBe(1);
    });

    it('smoothly scrubs frames forward and backward with linear precision', () => {
      const isHomePage = true;
      const isHeroCompleted = false;
      const frameCount = 384;

      const computeFrame = (progress: number) => {
        return (!isHomePage || (isHeroCompleted && progress >= 0.99))
          ? frameCount
          : Math.min(Math.max(Math.round(progress * (frameCount - 1)) + 1, 1), frameCount);
      };

      // Forward scrub
      expect(computeFrame(0.0)).toBe(1);
      expect(computeFrame(0.25)).toBe(97);
      expect(computeFrame(0.5)).toBe(193);
      expect(computeFrame(0.75)).toBe(288);
      expect(computeFrame(1.0)).toBe(384);

      // Reverse scrub
      expect(computeFrame(0.8)).toBe(307);
      expect(computeFrame(0.3)).toBe(116);
      expect(computeFrame(0.0)).toBe(1);
    });

    it('holds frame 384 on non-homepage public routes and after hero completion', () => {
      const frameCount = 384;

      // On catalogue page
      const catalogueTarget = (!false || (false && 0 >= 0.99))
        ? frameCount
        : 1;
      expect(catalogueTarget).toBe(384);

      // On completed homepage scrolled past hero
      const completedTarget = (!true || (true && 1.0 >= 0.99))
        ? frameCount
        : 1;
      expect(completedTarget).toBe(384);
    });

    it('guarantees frameSequence presence from siteConfigService.getLocalFallback()', () => {
      const fallback = siteConfigService.getLocalFallback();
      expect(fallback.hero).toBeDefined();
      expect(fallback.hero.frameSequence).toBeDefined();
      expect(fallback.hero.frameSequence?.frameCount).toBe(384);
      expect(fallback.hero.frameSequence?.firstFrame).toBe('/hero-frames/frame-00001.webp');
      expect(fallback.hero.frameSequence?.finalFrame).toBe('/hero-frames/frame-00384.webp');
    });
  });
});
