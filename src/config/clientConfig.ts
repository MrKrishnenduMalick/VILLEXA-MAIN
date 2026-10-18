/**
 * VILLEXA / ATELIER DIGITAL SHOWROOM — MASTER CLIENT CONFIGURATION SYSTEM
 *
 * This file is the single source of truth for brand identity, contact details,
 * theme tokens, and feature flags. To customize this showroom for a new client:
 *
 * 1. Modify the values in `defaultClientConfig` below (or override via VITE_CLIENT_* env vars).
 * 2. Run `npm run validate:config` to verify all required fields.
 * 3. The entire application (Header, Footer, Contact, Metadata, Admin) immediately
 *    reflects the client's identity without modifying component files.
 */

export interface ClientBrandConfig {
  brandName: string;
  tagline: string;
  badge: string;
  description: string;
  logoText: string;
  logoSubtext: string;
  logoImageUrl: string | null;
  faviconUrl: string | null;
}

export interface ClientContactConfig {
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string; // Clean numerical string for wa.me links, e.g., '18004821980'
  whatsappDefaultMessage: string;
  showroomAddress: string;
  visitingHours: string;
  flagshipLocationName: string;
}

export interface ClientSocialConfig {
  instagramUrl: string | null;
  pinterestUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl?: string | null;
}

export interface ClientThemeConfig {
  accentColor: string;
  accentHoverColor: string;
  bgPrimary: string;
  bgDark: string;
  fontSerif: string;
  fontSans: string;
}

export interface ClientFeaturesConfig {
  enable3DViewer: boolean;
  enable360Turntable: boolean;
  enableShowroomVideo: boolean;
  enableBespokeInquiry: boolean;
  enablePriceDisplay: boolean;
  enableCollections: boolean;
  enableInspirationRooms: boolean;
  enableCraftsmanshipStory: boolean;
}

export interface ClientSeoConfig {
  defaultTitle: string;
  defaultDescription: string;
  keywords: string[];
  siteUrl: string;
}

export interface ClientConfig {
  brand: ClientBrandConfig;
  contact: ClientContactConfig;
  social: ClientSocialConfig;
  theme: ClientThemeConfig;
  features: ClientFeaturesConfig;
  seo: ClientSeoConfig;
}

/**
 * DEFAULT BASELINE CONFIGURATION (Villexa Master Preset)
 */
export const defaultClientConfig: ClientConfig = {
  brand: {
    brandName: 'VILLEXA',
    tagline: 'Haute Ébénisterie & Architecture',
    badge: 'HAUTE ATELIER ÉBÉNISTERIE',
    description: 'Bespoke architectural furniture, monolithic proportions, and hand-finished timber joinery. Conceived in Milan, crafted for global architectural residences.',
    logoText: 'VILLEXA',
    logoSubtext: 'Haute Ébénisterie',
    logoImageUrl: null,
    faviconUrl: null
  },
  contact: {
    contactEmail: 'concierge@villexa.com',
    contactPhone: '+1 (800) 482-1980',
    whatsappNumber: '18004821980',
    whatsappDefaultMessage: 'Hello, I would like to inquire regarding a bespoke showroom piece.',
    showroomAddress: 'Via della Spiga 28, 20121 Milano, Italy',
    visitingHours: 'Monday – Saturday: 10:00 to 19:00 (By Appointment Only)',
    flagshipLocationName: 'Milano Flagship Showroom'
  },
  social: {
    instagramUrl: 'https://instagram.com/villexaofficial',
    pinterestUrl: 'https://pinterest.com/villexaofficial',
    linkedinUrl: null,
    twitterUrl: null
  },
  theme: {
    accentColor: '#c5a059',
    accentHoverColor: '#b38f48',
    bgPrimary: '#f8f6f1',
    bgDark: '#141413',
    fontSerif: '"Cormorant Garamond", Georgia, serif',
    fontSans: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  features: {
    enable3DViewer: true,
    enable360Turntable: true,
    enableShowroomVideo: true,
    enableBespokeInquiry: true,
    enablePriceDisplay: true,
    enableCollections: true,
    enableInspirationRooms: true,
    enableCraftsmanshipStory: true
  },
  seo: {
    defaultTitle: 'VILLEXA — Haute Ébénisterie & Architecture | Modern Showroom',
    defaultDescription: 'Villexa curates timeless interior masterworks. Sculptural silhouettes, organic materials, and deliberate proportions crafted for refined living spaces.',
    keywords: ['luxury furniture', 'bespoke joinery', 'architectural furniture', 'monolithic design', 'atelier', 'milan craftsmanship'],
    siteUrl: 'https://villexa.com'
  }
};

/**
 * Returns the effective client configuration, merging compile-time defaults
 * with optional VITE_CLIENT_* environment variable overrides.
 */
export function getClientConfig(): ClientConfig {
  const env = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}) as Record<string, string | undefined>;

  return {
    brand: {
      brandName: env.VITE_CLIENT_BRAND_NAME || defaultClientConfig.brand.brandName,
      tagline: env.VITE_CLIENT_TAGLINE || defaultClientConfig.brand.tagline,
      badge: env.VITE_CLIENT_BADGE || defaultClientConfig.brand.badge,
      description: env.VITE_CLIENT_DESCRIPTION || defaultClientConfig.brand.description,
      logoText: env.VITE_CLIENT_LOGO_TEXT || env.VITE_CLIENT_BRAND_NAME || defaultClientConfig.brand.logoText,
      logoSubtext: env.VITE_CLIENT_LOGO_SUBTEXT || defaultClientConfig.brand.logoSubtext,
      logoImageUrl: env.VITE_CLIENT_LOGO_IMAGE_URL || defaultClientConfig.brand.logoImageUrl,
      faviconUrl: env.VITE_CLIENT_FAVICON_URL || defaultClientConfig.brand.faviconUrl
    },
    contact: {
      contactEmail: env.VITE_CLIENT_CONTACT_EMAIL || defaultClientConfig.contact.contactEmail,
      contactPhone: env.VITE_CLIENT_CONTACT_PHONE || defaultClientConfig.contact.contactPhone,
      whatsappNumber: env.VITE_CLIENT_WHATSAPP_NUMBER || defaultClientConfig.contact.whatsappNumber,
      whatsappDefaultMessage: env.VITE_CLIENT_WHATSAPP_MESSAGE || defaultClientConfig.contact.whatsappDefaultMessage,
      showroomAddress: env.VITE_CLIENT_SHOWROOM_ADDRESS || defaultClientConfig.contact.showroomAddress,
      visitingHours: env.VITE_CLIENT_VISITING_HOURS || defaultClientConfig.contact.visitingHours,
      flagshipLocationName: env.VITE_CLIENT_LOCATION_NAME || defaultClientConfig.contact.flagshipLocationName
    },
    social: {
      instagramUrl: env.VITE_CLIENT_INSTAGRAM_URL ?? defaultClientConfig.social.instagramUrl,
      pinterestUrl: env.VITE_CLIENT_PINTEREST_URL ?? defaultClientConfig.social.pinterestUrl,
      linkedinUrl: env.VITE_CLIENT_LINKEDIN_URL ?? defaultClientConfig.social.linkedinUrl,
      twitterUrl: env.VITE_CLIENT_TWITTER_URL ?? defaultClientConfig.social.twitterUrl
    },
    theme: {
      accentColor: env.VITE_CLIENT_THEME_ACCENT || defaultClientConfig.theme.accentColor,
      accentHoverColor: env.VITE_CLIENT_THEME_ACCENT_HOVER || defaultClientConfig.theme.accentHoverColor,
      bgPrimary: env.VITE_CLIENT_THEME_BG_PRIMARY || defaultClientConfig.theme.bgPrimary,
      bgDark: env.VITE_CLIENT_THEME_BG_DARK || defaultClientConfig.theme.bgDark,
      fontSerif: defaultClientConfig.theme.fontSerif,
      fontSans: defaultClientConfig.theme.fontSans
    },
    features: {
      enable3DViewer: env.VITE_FEATURE_3D_VIEWER !== undefined ? env.VITE_FEATURE_3D_VIEWER === 'true' : defaultClientConfig.features.enable3DViewer,
      enable360Turntable: env.VITE_FEATURE_360_TURNTABLE !== undefined ? env.VITE_FEATURE_360_TURNTABLE === 'true' : defaultClientConfig.features.enable360Turntable,
      enableShowroomVideo: env.VITE_FEATURE_SHOWROOM_VIDEO !== undefined ? env.VITE_FEATURE_SHOWROOM_VIDEO === 'true' : defaultClientConfig.features.enableShowroomVideo,
      enableBespokeInquiry: env.VITE_FEATURE_BESPOKE_INQUIRY !== undefined ? env.VITE_FEATURE_BESPOKE_INQUIRY === 'true' : defaultClientConfig.features.enableBespokeInquiry,
      enablePriceDisplay: env.VITE_FEATURE_PRICE_DISPLAY !== undefined ? env.VITE_FEATURE_PRICE_DISPLAY === 'true' : defaultClientConfig.features.enablePriceDisplay,
      enableCollections: env.VITE_FEATURE_COLLECTIONS !== undefined ? env.VITE_FEATURE_COLLECTIONS === 'true' : defaultClientConfig.features.enableCollections,
      enableInspirationRooms: env.VITE_FEATURE_INSPIRATION !== undefined ? env.VITE_FEATURE_INSPIRATION === 'true' : defaultClientConfig.features.enableInspirationRooms,
      enableCraftsmanshipStory: env.VITE_FEATURE_CRAFTSMANSHIP !== undefined ? env.VITE_FEATURE_CRAFTSMANSHIP === 'true' : defaultClientConfig.features.enableCraftsmanshipStory
    },
    seo: {
      defaultTitle: env.VITE_CLIENT_SEO_TITLE || defaultClientConfig.seo.defaultTitle,
      defaultDescription: env.VITE_CLIENT_SEO_DESC || defaultClientConfig.seo.defaultDescription,
      keywords: defaultClientConfig.seo.keywords,
      siteUrl: env.VITE_CLIENT_SITE_URL || defaultClientConfig.seo.siteUrl
    }
  };
}

/**
 * Injects client theme variables into document root so that colors and branding
 * take effect automatically across all CSS rules without modifying stylesheets.
 */
export function applyClientTheme(theme: ClientThemeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme.accentColor) root.style.setProperty('--color-accent-gold', theme.accentColor);
  if (theme.accentHoverColor) root.style.setProperty('--color-accent-gold-hover', theme.accentHoverColor);
  if (theme.bgPrimary) root.style.setProperty('--color-bg-primary', theme.bgPrimary);
  if (theme.bgDark) root.style.setProperty('--color-dark-bg', theme.bgDark);
}
