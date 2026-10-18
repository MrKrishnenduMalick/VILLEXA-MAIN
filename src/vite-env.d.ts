/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;

  // Client branding overrides
  readonly VITE_CLIENT_BRAND_NAME?: string;
  readonly VITE_CLIENT_TAGLINE?: string;
  readonly VITE_CLIENT_BADGE?: string;
  readonly VITE_CLIENT_DESCRIPTION?: string;
  readonly VITE_CLIENT_LOGO_TEXT?: string;
  readonly VITE_CLIENT_LOGO_SUBTEXT?: string;
  readonly VITE_CLIENT_LOGO_IMAGE_URL?: string;
  readonly VITE_CLIENT_FAVICON_URL?: string;

  // Client contact overrides
  readonly VITE_CLIENT_CONTACT_EMAIL?: string;
  readonly VITE_CLIENT_CONTACT_PHONE?: string;
  readonly VITE_CLIENT_WHATSAPP_NUMBER?: string;
  readonly VITE_CLIENT_WHATSAPP_MESSAGE?: string;
  readonly VITE_CLIENT_SHOWROOM_ADDRESS?: string;
  readonly VITE_CLIENT_VISITING_HOURS?: string;
  readonly VITE_CLIENT_LOCATION_NAME?: string;

  // Client social links
  readonly VITE_CLIENT_INSTAGRAM_URL?: string;
  readonly VITE_CLIENT_PINTEREST_URL?: string;
  readonly VITE_CLIENT_LINKEDIN_URL?: string;
  readonly VITE_CLIENT_TWITTER_URL?: string;

  // Client theme tokens
  readonly VITE_CLIENT_THEME_ACCENT?: string;
  readonly VITE_CLIENT_THEME_ACCENT_HOVER?: string;
  readonly VITE_CLIENT_THEME_BG_PRIMARY?: string;
  readonly VITE_CLIENT_THEME_BG_DARK?: string;

  // Feature flags
  readonly VITE_FEATURE_3D_VIEWER?: string;
  readonly VITE_FEATURE_360_TURNTABLE?: string;
  readonly VITE_FEATURE_SHOWROOM_VIDEO?: string;
  readonly VITE_FEATURE_BESPOKE_INQUIRY?: string;
  readonly VITE_FEATURE_PRICE_DISPLAY?: string;
  readonly VITE_FEATURE_COLLECTIONS?: string;
  readonly VITE_FEATURE_INSPIRATION?: string;
  readonly VITE_FEATURE_CRAFTSMANSHIP?: string;

  // SEO & metadata
  readonly VITE_CLIENT_SEO_TITLE?: string;
  readonly VITE_CLIENT_SEO_DESC?: string;
  readonly VITE_CLIENT_SITE_URL?: string;

  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
