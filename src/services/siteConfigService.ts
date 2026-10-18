import { SiteConfiguration, HeroConfig, ShowroomMediaConfig, BrandSettings } from '../types/content';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getClientConfig } from '../config/clientConfig';

const activeClient = getClientConfig();

const defaultSiteConfig: SiteConfiguration = {
  hero: {
    kicker: 'HAUTE ÉBÉNISTERIE & ARCHITECTURE',
    title: 'Pure Architectural Form Meets Bespoke Craftsmanship',
    subtitle: `${activeClient.brand.brandName} curates timeless interior masterworks. Sculptural silhouettes, organic materials, and deliberate proportions crafted for refined living spaces.`,
    primaryCtaLabel: 'Explore Catalogue',
    primaryCtaLink: '/catalogue',
    secondaryCtaLabel: 'Request Commission',
    secondaryCtaLink: '/contact',
    mediaType: 'frames',
    mediaUrl: '/hero-frames/frame-00001.webp',
    posterUrl: '/hero-frames/frame-00001.webp',
    frameSequence: {
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
      publishedAt: '2026-10-18T00:00:00.000Z'
    }
  },
  showroomMedia: {
    enabled: false,
    sectionTitle: 'The Atelier Atmosphere',
    sectionSubtitle: 'An intimate glimpse into our material joinery and spatial compositions.',
    videoUrl: null,
    posterUrl: null,
    autoPlay: false,
    loop: false
  },
  brand: {
    brandName: activeClient.brand.brandName,
    tagline: activeClient.brand.tagline,
    contactEmail: activeClient.contact.contactEmail,
    contactPhone: activeClient.contact.contactPhone,
    whatsappNumber: activeClient.contact.whatsappNumber,
    showroomAddress: activeClient.contact.showroomAddress,
    visitingHours: activeClient.contact.visitingHours,
    socialInstagram: activeClient.social.instagramUrl || '',
    socialPinterest: activeClient.social.pinterestUrl || ''
  }
};

export const siteConfigService = {
  async getSiteConfig(): Promise<SiteConfiguration> {
    const getLocalFallback = (): SiteConfiguration => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const storedHero = window.localStorage.getItem('villexa_site_config_hero');
          const storedShowroom = window.localStorage.getItem('villexa_site_config_showroom_media');
          const storedBrand = window.localStorage.getItem('villexa_site_config_brand');
          return {
            hero: storedHero ? JSON.parse(storedHero) : defaultSiteConfig.hero,
            showroomMedia: storedShowroom ? JSON.parse(storedShowroom) : defaultSiteConfig.showroomMedia,
            brand: storedBrand ? JSON.parse(storedBrand) : defaultSiteConfig.brand
          };
        }
      } catch {
        // Fallback safely to defaultSiteConfig
      }
      return defaultSiteConfig;
    };

    if (!isSupabaseConfigured) return getLocalFallback();

    try {
      const { data, error } = await supabase.from('site_settings').select('key, value');
      if (error || !data) return getLocalFallback();

      const heroRow = data.find((r) => r.key === 'hero');
      const showroomRow = data.find((r) => r.key === 'showroom_media');
      const brandRow = data.find((r) => r.key === 'brand');

      const config: SiteConfiguration = {
        hero: (heroRow?.value as HeroConfig) || defaultSiteConfig.hero,
        showroomMedia: (showroomRow?.value as ShowroomMediaConfig) || defaultSiteConfig.showroomMedia,
        brand: (brandRow?.value as BrandSettings) || defaultSiteConfig.brand
      };

      // Cache locally for offline resilience
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          if (heroRow?.value) window.localStorage.setItem('villexa_site_config_hero', JSON.stringify(heroRow.value));
          if (showroomRow?.value) window.localStorage.setItem('villexa_site_config_showroom_media', JSON.stringify(showroomRow.value));
          if (brandRow?.value) window.localStorage.setItem('villexa_site_config_brand', JSON.stringify(brandRow.value));
        }
      } catch {
        // Ignore cache storage errors
      }

      return config;
    } catch {
      return getLocalFallback();
    }
  }
};
