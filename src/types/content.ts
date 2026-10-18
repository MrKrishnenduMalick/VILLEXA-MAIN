/**
 * VILLEXA SITE CONTENT & BRAND SETTINGS TYPES
 */

export interface HeroFrameSequenceConfig {
  version: string;
  frameCount: number;
  width: number;
  height: number;
  framePattern: string; // e.g. '/hero-frames/frame-{index}.webp'
  firstFrame: string;
  finalFrame: string;
  manifestUrl?: string;
  totalSizeBytes?: number;
  isPublished: boolean;
  publishedAt?: string;
  previousSequence?: Omit<HeroFrameSequenceConfig, 'previousSequence'> | null;
}

export interface HeroConfig {
  kicker: string;
  title: string;
  subtitle: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  secondaryCtaLink: string;
  mediaType: 'none' | 'image' | 'video' | 'frames';
  mediaUrl: string | null;
  posterUrl?: string | null;
  frameSequence?: HeroFrameSequenceConfig | null;
}

export interface ShowroomMediaConfig {
  enabled: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  videoUrl: string | null;
  posterUrl: string | null;
  autoPlay: boolean;
  loop: boolean;
}

export interface BrandSettings {
  brandName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  showroomAddress: string;
  visitingHours: string;
  socialInstagram?: string;
  socialPinterest?: string;
  socialLinkedIn?: string;
}

export interface SiteConfiguration {
  hero: HeroConfig;
  showroomMedia: ShowroomMediaConfig;
  brand: BrandSettings;
}
