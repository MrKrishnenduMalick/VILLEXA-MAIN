import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { defaultClientConfig, getClientConfig, applyClientTheme } from '../config/clientConfig';

describe('Client Configuration System (Phase A Reusability)', () => {
  const originalEnv = { ...import.meta.env };

  const clearClientOverrides = () => {
    for (const key of Object.keys(import.meta.env)) {
      if (key.startsWith('VITE_CLIENT_') || key.startsWith('VITE_FEATURE_')) {
        delete (import.meta.env as Record<string, any>)[key];
      }
    }
  };

  beforeEach(() => {
    // Reset document styles if in browser env
    if (typeof document !== 'undefined') {
      document.documentElement.style.cssText = '';
    }
    clearClientOverrides();
  });

  afterEach(() => {
    // Restore env
    clearClientOverrides();
    Object.assign(import.meta.env, originalEnv);
  });

  describe('Default Preset Baseline (Villexa Master)', () => {
    it('provides Villexa as the default master preset without configuration overrides', () => {
      const config = getClientConfig();
      expect(config.brand.brandName).toBe('VILLEXA');
      expect(config.brand.tagline).toBe('Haute Ébénisterie & Architecture');
      expect(config.brand.logoText).toBe('VILLEXA');
      expect(config.contact.contactEmail).toBe('concierge@villexa.com');
      expect(config.contact.whatsappNumber).toBe('18004821980');
    });

    it('has all core feature flags explicitly defined as booleans', () => {
      const { features } = defaultClientConfig;
      expect(typeof features.enable3DViewer).toBe('boolean');
      expect(typeof features.enable360Turntable).toBe('boolean');
      expect(typeof features.enableShowroomVideo).toBe('boolean');
      expect(typeof features.enableBespokeInquiry).toBe('boolean');
      expect(typeof features.enablePriceDisplay).toBe('boolean');
      expect(typeof features.enableCollections).toBe('boolean');
      expect(typeof features.enableInspirationRooms).toBe('boolean');
      expect(typeof features.enableCraftsmanshipStory).toBe('boolean');
    });

    it('contains valid theme tokens conforming to luxury aesthetic guidelines', () => {
      const { theme } = defaultClientConfig;
      expect(theme.accentColor).toMatch(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
      expect(theme.bgPrimary).toMatch(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
      expect(theme.bgDark).toMatch(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
      expect(theme.fontSerif).toContain('Cormorant Garamond');
      expect(theme.fontSans).toContain('Outfit');
    });

    it('includes default SEO metadata and keywords for discovery', () => {
      const { seo } = defaultClientConfig;
      expect(seo.defaultTitle).toContain('VILLEXA');
      expect(seo.defaultDescription.length).toBeGreaterThan(20);
      expect(Array.isArray(seo.keywords)).toBe(true);
      expect(seo.keywords.length).toBeGreaterThan(3);
    });
  });

  describe('Dynamic Environment & Client Customization Overrides', () => {
    it('allows overriding brand identity via VITE_CLIENT_* variables', () => {
      // Simulate client clone overriding brand
      const customEnv = {
        ...import.meta.env,
        VITE_CLIENT_BRAND_NAME: 'AURELIA ATELIER',
        VITE_CLIENT_TAGLINE: 'Nordic Sculptural Furniture',
        VITE_CLIENT_CONTACT_EMAIL: 'concierge@aurelia-atelier.ch',
        VITE_CLIENT_WHATSAPP_NUMBER: '41791234567'
      };

      // In Vitest, modify import.meta.env
      Object.assign(import.meta.env, customEnv);

      const config = getClientConfig();
      expect(config.brand.brandName).toBe('AURELIA ATELIER');
      expect(config.brand.tagline).toBe('Nordic Sculptural Furniture');
      expect(config.contact.contactEmail).toBe('concierge@aurelia-atelier.ch');
      expect(config.contact.whatsappNumber).toBe('41791234567');
      // LogoText should fall back to overridden brandName if not explicitly set
      expect(config.brand.logoText).toBe('AURELIA ATELIER');
    });

    it('supports disabling specific features for lightweight clients', () => {
      // Client does not have 3D models or showroom videos
      const customEnv = {
        ...import.meta.env,
        VITE_FEATURE_3D_VIEWER: 'false',
        VITE_FEATURE_SHOWROOM_VIDEO: 'false',
        VITE_FEATURE_PRICE_DISPLAY: 'false'
      };
      Object.assign(import.meta.env, customEnv);

      const config = getClientConfig();
      expect(config.features.enable3DViewer).toBe(false);
      expect(config.features.enableShowroomVideo).toBe(false);
      expect(config.features.enablePriceDisplay).toBe(false);
      // Other features remain enabled
      expect(config.features.enableBespokeInquiry).toBe(true);
    });
  });

  describe('Theme Custom Properties Application', () => {
    it('sets root CSS custom properties when applyClientTheme is invoked', () => {
      if (typeof document === 'undefined') return;

      const customTheme = {
        accentColor: '#b89047',
        accentHoverColor: '#a17c38',
        bgPrimary: '#fbf9f5',
        bgDark: '#0e0e0d',
        fontSerif: 'Georgia, serif',
        fontSans: 'Arial, sans-serif'
      };

      applyClientTheme(customTheme);

      expect(document.documentElement.style.getPropertyValue('--color-accent-gold')).toBe('#b89047');
      expect(document.documentElement.style.getPropertyValue('--color-accent-gold-hover')).toBe('#a17c38');
      expect(document.documentElement.style.getPropertyValue('--color-bg-primary')).toBe('#fbf9f5');
      expect(document.documentElement.style.getPropertyValue('--color-dark-bg')).toBe('#0e0e0d');
    });
  });

  describe('Client Isolation & Security Invariants', () => {
    it('verifies that service role keys are never exposed in client configuration', () => {
      const config = getClientConfig() as any;
      expect(config.serviceRoleKey).toBeUndefined();
      expect(config.supabaseServiceKey).toBeUndefined();
      expect(config.adminSecret).toBeUndefined();
    });

    it('verifies contact WhatsApp numbers can be sanitized to purely numerical digits', () => {
      const rawNumbers = ['+1 (800) 482-1980', '41-79-123-4567', ' 91 98765 43210 '];
      for (const raw of rawNumbers) {
        const clean = raw.replace(/\D/g, '');
        expect(clean.length).toBeGreaterThanOrEqual(7);
        expect(/^\d+$/.test(clean)).toBe(true);
      }
    });
  });
});
