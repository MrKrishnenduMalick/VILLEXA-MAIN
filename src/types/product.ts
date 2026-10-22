/**
 * VILLEXA PRODUCT DOMAIN TYPES
 * Prepared for real database integration (PostgreSQL / Supabase / SQLite)
 */

export type ProductStatus = 'draft' | 'published';

export type ProductViewerMode = 'gallery' | 'glb_3d' | 'video';

export interface ProductDimensions {
  width: number;
  depth: number;
  height: number;
  seatHeight?: number;
  unit: 'cm' | 'in';
}

export interface ProductFinish {
  id: string;
  name: string;
  colorHex: string;
  materialName?: string;
  isDefault?: boolean;
}

export interface ProductMediaItem {
  id: string;
  productId: string;
  type: 'image' | 'video' | 'glb_model';
  url: string;
  storagePath?: string;
  thumbnailUrl?: string;
  sortOrder: number;
  altText?: string;
  metadata?: Record<string, unknown>;
}

export interface ProductGLBConfig {
  modelUrl: string;
  initialRotationY?: number;
  cameraDistance?: number;
  autoRotate?: boolean;
  backgroundTint?: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName: string;
  collectionId?: string;
  collectionName?: string;
  
  // Pricing
  regularPrice: number | null;
  salePrice?: number | null;
  currency: string;
  showPricePublicly: boolean;
  isEnquiryOnly: boolean;

  // Descriptions & Editorial Content
  shortDescription: string;
  fullDescription: string;
  materials: string;
  careInstructions?: string;
  dimensions?: ProductDimensions;
  finishes: ProductFinish[];

  // Media & Viewer configurations
  primaryImageUrl: string | null;
  galleryImages: string[];
  galleryMedia?: Array<{ url: string; storagePath?: string; metadata?: Record<string, unknown> }>;
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  videoMedia?: {
    url: string;
    storagePath?: string;
    posterUrl?: string;
    metadata?: Record<string, unknown>;
  } | null;
  preferredViewer: ProductViewerMode;
  glbConfig?: ProductGLBConfig;
  glbMedia?: {
    url: string;
    storagePath?: string;
    metadata?: Record<string, unknown>;
  } | null;

  // Organization & Metadata
  tags: string[];
  isFeatured: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description?: string;
  coverImageUrl?: string | null;
  sortOrder: number;
  productCount: number;
}
