import { supabase, isSupabaseConfigured, checkIsAdmin } from './supabaseClient';
import { Product, ProductCategory, ProductViewerMode } from '../types/product';
import { Collection } from '../types/collection';
import { CustomerEnquiry } from '../types/enquiry';
import {
  promoteDraftToPublic,
  revokePublicAsset,
  deleteAsset,
  assetExists,
  VAULT_BUCKET
} from './storageService';

/**
 * ADMINISTRATIVE PERSISTENCE SERVICE
 * Enforced via Supabase RLS is_admin() check at database and storage levels.
 */

export interface StorageCleanupAuditItem {
  bucket: string;
  path: string;
  status: 'deleted' | 'skipped_shared' | 'failed' | 'skipped_reserved';
  reason?: string;
  error?: string;
}

export interface ProductDeletionResult {
  success: boolean;
  productId: string;
  productName?: string;
  productSku?: string;
  databaseDeleted: boolean;
  deletedMediaCount: number;
  deletedFinishesCount: number;
  deletedSequencesCount: number;
  unlinkedEnquiriesCount: number;
  storageCleanup: StorageCleanupAuditItem[];
  storageFailedCount: number;
  error?: string;
}

/**
 * Normalizes a relative storage path by removing leading and trailing slashes and whitespace.
 */
export function normalizeStoragePath(p: string): string {
  return p.replace(/^\/+|\/+$/g, '').trim();
}

/**
 * Protects system storage folders and roots from accidental bulk deletion.
 */
export function isForbiddenStorageTarget(path: string): boolean {
  const normalized = normalizeStoragePath(path).toLowerCase();
  if (!normalized) return true;
  const reserved = [
    '',
    '.',
    '..',
    'drafts',
    'drafts/videos',
    'drafts/images',
    'drafts/models',
    'drafts/sequences',
    'published',
    'published/videos',
    'published/images',
    'published/models',
    'published/sequences',
    'hero',
    'staging'
  ];
  return reserved.includes(normalized);
}

/**
 * Safely parses any Supabase storage URL or relative storage path into its bucket and normalized object path.
 * External URLs (Unsplash, external CDNs) return null to ensure external links are never touched.
 */
export function parseStorageBucketAndPath(
  urlOrPath: string | null | undefined,
  defaultBucketHint?: string
): { bucket: string; path: string } | null {
  if (!urlOrPath || typeof urlOrPath !== 'string') return null;
  const trimmed = urlOrPath.trim();
  if (!trimmed) return null;

  // External URLs (Unsplash, YouTube, Cloudinary, etc.) are not in Supabase storage
  if (
    (trimmed.startsWith('http://') || trimmed.startsWith('https://')) &&
    !trimmed.includes('/storage/v1/object/') &&
    !trimmed.includes('atelier-vault') &&
    !trimmed.includes('showroom-videos') &&
    !trimmed.includes('product-images') &&
    !trimmed.includes('product-models') &&
    !trimmed.includes('360-sequences')
  ) {
    return null;
  }

  // 1. Supabase standard storage URLs: /storage/v1/object/(public|sign|authenticated)/<bucket>/<path>
  const storageObjectMatch = trimmed.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/?#]+)\/([^?#]+)/);
  if (storageObjectMatch) {
    const bucket = storageObjectMatch[1];
    const rawPath = decodeURIComponent(storageObjectMatch[2]);
    return { bucket, path: normalizeStoragePath(rawPath) };
  }

  // 2. Direct bucket mention with slash: <bucket>/<path>
  const knownBuckets = ['atelier-vault', 'product-images', 'showroom-videos', 'product-models', '360-sequences'];
  for (const b of knownBuckets) {
    const bucketMarker = `${b}/`;
    const idx = trimmed.indexOf(bucketMarker);
    if (idx !== -1) {
      const rawSubpath = trimmed.substring(idx + bucketMarker.length).split('?')[0];
      const path = decodeURIComponent(rawSubpath);
      return { bucket: b, path: normalizeStoragePath(path) };
    }
  }

  // 3. Draft paths in atelier-vault
  if (trimmed.startsWith('drafts/')) {
    const clean = decodeURIComponent(trimmed.split('?')[0]);
    return { bucket: 'atelier-vault', path: normalizeStoragePath(clean) };
  }

  // 4. Default bucket hint for relative paths
  if (defaultBucketHint && (
    trimmed.startsWith('published/') ||
    trimmed.startsWith('hero/') ||
    trimmed.startsWith('models/') ||
    trimmed.startsWith('videos/') ||
    trimmed.startsWith('images/') ||
    trimmed.startsWith('sequences/')
  )) {
    const clean = decodeURIComponent(trimmed.split('?')[0]);
    return { bucket: defaultBucketHint, path: normalizeStoragePath(clean) };
  }

  // 5. Deduce from prefix if starts with published/
  if (trimmed.startsWith('published/videos/') || trimmed.startsWith('videos/')) {
    return { bucket: 'showroom-videos', path: normalizeStoragePath(decodeURIComponent(trimmed.split('?')[0])) };
  }
  if (trimmed.startsWith('published/models/') || trimmed.startsWith('models/')) {
    return { bucket: 'product-models', path: normalizeStoragePath(decodeURIComponent(trimmed.split('?')[0])) };
  }
  if (trimmed.startsWith('published/sequences/') || trimmed.startsWith('sequences/')) {
    return { bucket: '360-sequences', path: normalizeStoragePath(decodeURIComponent(trimmed.split('?')[0])) };
  }
  if (trimmed.startsWith('published/images/') || trimmed.startsWith('images/') || trimmed.startsWith('published/')) {
    return { bucket: 'product-images', path: normalizeStoragePath(decodeURIComponent(trimmed.split('?')[0])) };
  }

  return null;
}


/**
 * Safely parses the relative vault path from a full signed URL or vault URL.
 * e.g. "https://.../storage/v1/object/sign/atelier-vault/drafts/videos/123_video.mp4?token=..." -> "drafts/videos/123_video.mp4"
 */
export function extractVaultPathFromUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  // If it's already a relative storage path (e.g. drafts/..., published/..., products/..., videos/..., models/..., images/...)
  if (
    url.startsWith('drafts/') ||
    url.startsWith('published/') ||
    url.startsWith('products/') ||
    url.startsWith('videos/') ||
    url.startsWith('models/') ||
    url.startsWith('images/') ||
    url.startsWith('sequences/')
  ) {
    return url;
  }
  if (!url.includes('atelier-vault/')) return null;
  try {
    const afterVault = url.split('atelier-vault/')[1];
    if (!afterVault) return null;
    const cleanPath = decodeURIComponent(afterVault.split('?')[0]);
    return cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
  } catch {
    return null;
  }
}

export interface MediaRepairDetail {
  productId: string;
  productName: string;
  mediaId: string;
  type: string;
  oldUrl: string;
  newUrl: string;
  storagePath: string;
}
 
export interface MediaRepairResult {
  success: boolean;
  scanned: number;
  repaired: number;
  alreadyRepaired?: number;
  errors: string[];
  details: MediaRepairDetail[];
}

export const TARGETED_AFFECTED_PRODUCTS = [
  { slug: 'aurelia-monolith-curved-sofa', name: 'Aurelia Monolith Curved Sofa' },
  { slug: 'brera-sculpted-velvet-barrel-lounge-chair', name: 'Brera Sculpted Velvet Barrel Lounge Chair' },
  { slug: 'tivoli-travertine-cantilever-coffee-table', name: 'Tivoli Travertine Cantilever Coffee Table' }
];

export interface ProductFormData {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  categoryId?: string;
  collectionId?: string;
  regularPrice: number | null;
  salePrice: number | null;
  currency: string;
  showPricePublicly: boolean;
  isEnquiryOnly: boolean;
  shortDescription: string;
  fullDescription: string;
  materials: string;
  careInstructions?: string;
  dimensions?: {
    width: number;
    depth: number;
    height: number;
    seatHeight?: number;
    unit: 'cm' | 'in';
  };
  primaryImageUrl: string | null;
  preferredViewer: ProductViewerMode;
  tags: string[];
  isFeatured: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  status: 'draft' | 'published';
  galleryImages?: Array<{ url: string; storagePath?: string; metadata?: Record<string, unknown> }>;
  productVideo?: { url: string; posterUrl?: string; storagePath?: string; metadata?: Record<string, unknown> } | null;
  glbModel?: { url: string; storagePath?: string; metadata?: Record<string, unknown> } | null;
}

export const adminService = {
  // ===================== PRODUCT CRUD =====================
  async getAllProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), collections(*), product_media(*)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching admin products:', error);
      return [];
    }

    // Collect all draft vault storage paths across products to batch generate fresh signed preview URLs
    const vaultPathsToSign: string[] = [];
    data.forEach((item) => {
      (item.product_media || []).forEach((m: { storage_path?: string; public_url?: string }) => {
        const path = m.storage_path || extractVaultPathFromUrl(m.public_url);
        if (path && !path.startsWith('published/') && !path.startsWith('http')) {
          vaultPathsToSign.push(path);
        }
      });
    });

    const signedUrlMap = new Map<string, string>();
    if (vaultPathsToSign.length > 0) {
      try {
        const uniquePaths = Array.from(new Set(vaultPathsToSign));
        const { data: signedData, error: signError } = await supabase.storage
          .from(VAULT_BUCKET)
          .createSignedUrls(uniquePaths, 3600);

        if (!signError && signedData) {
          signedData.forEach((res) => {
            if (res.signedUrl && !res.error && res.path) {
              signedUrlMap.set(res.path, res.signedUrl);
            }
          });
        }
      } catch (err) {
        console.warn('Could not batch sign vault URLs:', err);
      }
    }

    return data.map((item) => {
      const isDraft = item.status === 'draft';
      const glbItem = item.product_media?.find((m: { type: string }) => m.type === 'glb_model');
      const videoItem = item.product_media?.find((m: { type: string }) => m.type === 'video');
      const imageItems = (item.product_media || []).filter((m: { type: string }) => m.type === 'image');

      // Resolve gallery images with fresh signed URLs if in private vault, or existing permanent URL
      const galleryMedia: Array<{ url: string; storagePath?: string; metadata?: Record<string, unknown> }> = imageItems.map((m: { public_url: string; storage_path?: string; metadata?: any }) => {
        const path = m.storage_path || extractVaultPathFromUrl(m.public_url);
        const signed = path ? signedUrlMap.get(path) : undefined;
        const isVault = path && !path.startsWith('published/') && !path.startsWith('http');
        const freshUrl = (isVault && signed) ? signed : m.public_url;
        return {
          url: freshUrl,
          storagePath: m.storage_path || undefined,
          metadata: m.metadata || undefined
        };
      });

      // Primary image URL resolution:
      // If primary image points to vault, resolve fresh signed URL from gallery or map
      let primaryUrl = item.primary_image_url || null;
      if (galleryMedia.length > 0) {
        if (!primaryUrl || primaryUrl.includes('atelier-vault') || isDraft) {
          const matched = galleryMedia.find((gm) => Boolean(gm.storagePath && item.primary_image_url && item.primary_image_url.includes(gm.storagePath)));
          primaryUrl = matched?.url || galleryMedia[0]?.url || primaryUrl;
        }
      }

      // Resolve 3D GLB Model URL & Media
      let glbUrl = glbItem?.public_url;
      const glbVaultPath = glbItem?.storage_path || extractVaultPathFromUrl(glbItem?.public_url);
      const isGlbStagedInVault = Boolean(
        glbVaultPath &&
        (!glbItem?.storage_path?.startsWith('published/models/') ||
          glbItem?.public_url?.includes('atelier-vault') ||
          glbItem?.public_url?.includes('token='))
      );
      if ((isDraft || isGlbStagedInVault) && glbVaultPath && signedUrlMap.get(glbVaultPath)) {
        glbUrl = signedUrlMap.get(glbVaultPath);
      }
      const glbMedia = glbItem ? {
        url: glbUrl || glbItem.public_url,
        storagePath: glbItem.storage_path || glbVaultPath || undefined,
        metadata: {
          ...(glbItem.metadata || {}),
          isStagedInVault: isGlbStagedInVault
        }
      } : null;

      // Resolve Video URL & Media
      let videoUrl = videoItem?.public_url || null;
      const videoVaultPath = videoItem?.storage_path || extractVaultPathFromUrl(videoItem?.public_url);
      const isVideoStagedInVault = Boolean(
        videoVaultPath &&
        (!videoItem?.storage_path?.startsWith('published/videos/') ||
          videoItem?.public_url?.includes('atelier-vault') ||
          videoItem?.public_url?.includes('token='))
      );
      if ((isDraft || isVideoStagedInVault) && videoVaultPath && signedUrlMap.get(videoVaultPath)) {
        videoUrl = signedUrlMap.get(videoVaultPath)!;
      }
      const videoPosterUrl = (videoItem?.metadata as any)?.posterUrl || videoItem?.thumbnail_url || null;
      const videoMedia = videoItem ? {
        url: videoUrl || videoItem.public_url,
        storagePath: videoItem.storage_path || videoVaultPath || undefined,
        posterUrl: videoPosterUrl || undefined,
        metadata: {
          ...(videoItem.metadata || {}),
          isStagedInVault: isVideoStagedInVault
        }
      } : null;

      return {
        id: item.id,
        slug: item.slug,
        sku: item.sku,
        name: item.name,
        categoryId: item.category_id || '',
        categoryName: item.categories?.name || 'Unassigned',
        collectionId: item.collection_id || undefined,
        collectionName: item.collections?.name || undefined,
        regularPrice: item.regular_price ? Number(item.regular_price) : null,
        salePrice: item.sale_price ? Number(item.sale_price) : null,
        currency: item.currency || 'USD',
        showPricePublicly: item.show_price_publicly ?? true,
        isEnquiryOnly: item.is_enquiry_only ?? false,
        shortDescription: item.short_description,
        fullDescription: item.full_description,
        materials: item.materials,
        careInstructions: item.care_instructions || undefined,
        dimensions: item.dimensions || undefined,
        finishes: [],
        primaryImageUrl: primaryUrl,
        galleryImages: galleryMedia.map((m: { url: string }) => m.url),
        galleryMedia,
        videoUrl,
        videoPosterUrl,
        videoMedia,
        preferredViewer: (item.preferred_viewer === 'video' || (videoItem?.metadata as any)?.is_preferred_viewer) ? 'video' : (item.preferred_viewer === 'glb_3d' ? 'glb_3d' : 'gallery'),
        glbConfig: glbItem ? { modelUrl: glbUrl || glbItem.public_url } : undefined,
        glbMedia,
        tags: item.tags || [],
        isFeatured: item.is_featured ?? false,
        sortOrder: item.sort_order ?? 0,
        seoTitle: item.seo_title || undefined,
        seoDescription: item.seo_description || undefined,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      };
    });
  },

  async saveProduct(form: ProductFormData): Promise<{ 
    success: boolean; 
    id?: string; 
    error?: string;
    promotedVideo?: { url: string; storagePath?: string; posterUrl?: string };
    promotedGlb?: { url: string; storagePath?: string };
  }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Database is unconfigured. Connect Supabase to persist products.' };
    }

    let finalPrimaryImageUrl = form.primaryImageUrl;
    let finalGalleryImages = form.galleryImages ? [...form.galleryImages] : undefined;
    let finalGlbModel = form.glbModel ? { ...form.glbModel } : form.glbModel;
    let finalProductVideo = form.productVideo ? { ...form.productVideo } : form.productVideo;
    const promotedStagingVaultPaths: string[] = [];

    // PUBLICATION WORKFLOW:
    // If saving as published, promote assets from private vault to public showroom buckets
    if (form.status === 'published') {
      // 1. Promote Gallery Images
      if (finalGalleryImages) {
        const promoted: Array<{ url: string; storagePath?: string; metadata?: Record<string, unknown> }> = [];
        for (const img of finalGalleryImages) {
          const alreadyExists = img.storagePath?.startsWith('published/') && await assetExists('product-images', img.storagePath);
          if (!alreadyExists) {
            const vaultSource = (img.metadata as any)?.draft_vault_path || img.storagePath || extractVaultPathFromUrl(img.url);
            if (vaultSource && !vaultSource.startsWith('http')) {
              const res = await promoteDraftToPublic(vaultSource, 'image');
              if (res.success && res.publicUrl) {
                if (res.vaultPath) promotedStagingVaultPaths.push(res.vaultPath);
                promoted.push({
                  url: res.publicUrl,
                  storagePath: res.publicPath,
                  metadata: {
                    ...(img.metadata || {}),
                    draft_vault_path: undefined,
                    previous_vault_path: res.vaultPath || vaultSource
                  }
                });
                if (finalPrimaryImageUrl === img.url || (img.storagePath && finalPrimaryImageUrl?.includes(img.storagePath))) {
                  finalPrimaryImageUrl = res.publicUrl;
                }
              } else {
                return {
                  success: false,
                  error: `Failed to promote gallery photograph to public showroom: ${res.error || 'Unknown error'}. Product remains in draft status.`
                };
              }
            } else {
              promoted.push(img);
            }
          } else {
            promoted.push(img);
          }
        }
        finalGalleryImages = promoted;
        if (finalGalleryImages.length > 0 && (!finalPrimaryImageUrl || finalPrimaryImageUrl.includes('atelier-vault') || finalPrimaryImageUrl.includes('token='))) {
          finalPrimaryImageUrl = finalGalleryImages[0].url;
        }
      }

      // 2. Promote 3D GLB Model
      if (finalGlbModel && finalGlbModel.url) {
        const vaultSource = (finalGlbModel.metadata as any)?.draft_vault_path || 
                            finalGlbModel.storagePath || 
                            extractVaultPathFromUrl(finalGlbModel.url);

        const isAlreadyPublished = Boolean(
          finalGlbModel.storagePath?.startsWith('published/models/') &&
          !finalGlbModel.url.includes('atelier-vault') &&
          !finalGlbModel.url.includes('token=') &&
          await assetExists('product-models', finalGlbModel.storagePath)
        );

        if (!isAlreadyPublished) {
          if (vaultSource && !vaultSource.startsWith('http')) {
            const res = await promoteDraftToPublic(vaultSource, 'model');
            if (res.success && res.publicUrl && res.publicPath) {
              if (res.vaultPath) promotedStagingVaultPaths.push(res.vaultPath);
              finalGlbModel = {
                ...finalGlbModel,
                url: res.publicUrl,
                storagePath: res.publicPath,
                metadata: {
                  ...(finalGlbModel.metadata || {}),
                  draft_vault_path: undefined,
                  previous_vault_path: res.vaultPath || vaultSource
                }
              };
            } else {
              return {
                success: false,
                error: `Failed to promote 3D GLB model to public showroom: ${res.error || 'Unknown error'}. Product remains in draft status.`
              };
            }
          } else if (!finalGlbModel.storagePath && finalGlbModel.url.includes('atelier-vault')) {
            return {
              success: false,
              error: '3D model file in draft vault could not be verified or has expired. Please upload a fresh .glb file.'
            };
          }
        }
      }

      // 3. Promote Showcase Video & Poster
      if (finalProductVideo && finalProductVideo.url) {
        // Promote video poster thumbnail if present and in vault
        const posterVaultSource = (finalProductVideo.metadata as any)?.posterStoragePath || 
                                  extractVaultPathFromUrl(finalProductVideo.posterUrl);
        if (posterVaultSource && !posterVaultSource.startsWith('published/') && !posterVaultSource.startsWith('http')) {
          const posterRes = await promoteDraftToPublic(posterVaultSource, 'image');
          if (posterRes.success && posterRes.publicUrl) {
            if (posterRes.vaultPath) promotedStagingVaultPaths.push(posterRes.vaultPath);
            finalProductVideo.posterUrl = posterRes.publicUrl;
            finalProductVideo.metadata = {
              ...(finalProductVideo.metadata || {}),
              draft_poster_vault_path: undefined,
              posterUrl: posterRes.publicUrl
            };
          } else {
            return {
              success: false,
              error: `Failed to promote video thumbnail poster: ${posterRes.error || 'Unknown error'}. Product remains in draft status.`
            };
          }
        }

        const vaultSource = (finalProductVideo.metadata as any)?.draft_vault_path || 
                            finalProductVideo.storagePath || 
                            extractVaultPathFromUrl(finalProductVideo.url);

        const isAlreadyPublished = Boolean(
          finalProductVideo.storagePath?.startsWith('published/videos/') &&
          !finalProductVideo.url.includes('atelier-vault') &&
          !finalProductVideo.url.includes('token=') &&
          await assetExists('showroom-videos', finalProductVideo.storagePath)
        );

        if (!isAlreadyPublished) {
          if (vaultSource && !vaultSource.startsWith('http')) {
            const res = await promoteDraftToPublic(vaultSource, 'video');
            if (res.success && res.publicUrl && res.publicPath) {
              if (res.vaultPath) promotedStagingVaultPaths.push(res.vaultPath);
              finalProductVideo = {
                ...finalProductVideo,
                url: res.publicUrl,
                storagePath: res.publicPath,
                metadata: {
                  ...(finalProductVideo.metadata || {}),
                  draft_vault_path: undefined,
                  previous_vault_path: res.vaultPath || vaultSource
                }
              };
            } else {
              return {
                success: false,
                error: `Failed to promote showcase video to public showroom: ${res.error || 'Unknown error'}. Product remains in draft status.`
              };
            }
          } else if (!finalProductVideo.storagePath && finalProductVideo.url.includes('atelier-vault')) {
            return {
              success: false,
              error: 'Showcase video file in draft vault could not be verified or has expired. Please upload a fresh video file.'
            };
          }
        }
      }
    } else {
      // DRAFT WORKFLOW:
      // If saving as draft, revoke any existing public files if this product was previously published
      if (form.id) {
        const { data: existingMedia } = await supabase.from('product_media').select('*').eq('product_id', form.id);
        if (existingMedia) {
          for (const m of existingMedia) {
            if (m.storage_path && m.storage_path.startsWith('published/')) {
              const b = m.type === 'image' ? 'product-images' : m.type === 'glb_model' ? 'product-models' : m.type === 'video' ? 'showroom-videos' : '360-sequences';
              await revokePublicAsset(b, m.storage_path);
            }
          }
        }
      }
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      sku: form.sku.trim(),
      category_id: form.categoryId || null,
      collection_id: form.collectionId || null,
      regular_price: form.regularPrice,
      sale_price: form.salePrice,
      currency: form.currency || 'USD',
      show_price_publicly: form.showPricePublicly,
      is_enquiry_only: form.isEnquiryOnly,
      short_description: form.shortDescription,
      full_description: form.fullDescription,
      materials: form.materials,
      care_instructions: form.careInstructions || null,
      dimensions: form.dimensions || null,
      primary_image_url: finalPrimaryImageUrl || null,
      preferred_viewer: form.preferredViewer,
      tags: form.tags || [],
      is_featured: form.isFeatured,
      sort_order: form.sortOrder,
      seo_title: form.seoTitle || null,
      seo_description: form.seoDescription || null,
      status: form.status,
      updated_at: new Date().toISOString()
    };

    try {
      let savedId = form.id;
      if (form.id) {
        let { error } = await supabase.from('products').update(payload).eq('id', form.id);
        if (error && error.message.includes('products_preferred_viewer_check') && payload.preferred_viewer === 'video') {
          console.warn('Database products_preferred_viewer_check rejected "video". Retrying with "gallery" column while Migration 003 is pending.');
          const fallbackPayload = { ...payload, preferred_viewer: 'gallery' };
          const res = await supabase.from('products').update(fallbackPayload).eq('id', form.id);
          error = res.error;
        }
        if (error) return { success: false, error: error.message };
      } else {
        let { data, error } = await supabase.from('products').insert([payload]).select('id').single();
        if (error && error.message.includes('products_preferred_viewer_check') && payload.preferred_viewer === 'video') {
          console.warn('Database products_preferred_viewer_check rejected "video". Retrying with "gallery" column while Migration 003 is pending.');
          const fallbackPayload = { ...payload, preferred_viewer: 'gallery' };
          const res = await supabase.from('products').insert([fallbackPayload]).select('id').single();
          data = res.data;
          error = res.error;
        }
        if (error || !data) return { success: false, error: error?.message || 'Failed to insert product' };
        savedId = data.id;
      }

      // Sync Gallery Images into product_media
      if (savedId && finalGalleryImages !== undefined) {
        const { error: delErr } = await supabase.from('product_media').delete().eq('product_id', savedId).eq('type', 'image');
        if (delErr) {
          return { success: false, error: `Failed to clear existing media: ${delErr.message}` };
        }
        if (finalGalleryImages.length > 0) {
          const mediaRows = finalGalleryImages.map((img, idx) => ({
            product_id: savedId,
            type: 'image',
            storage_path: img.storagePath || '',
            public_url: img.url,
            metadata: img.metadata || null,
            sort_order: idx
          }));
          const { error: insErr } = await supabase.from('product_media').insert(mediaRows);
          if (insErr) {
            return { success: false, error: `Failed to persist gallery images: ${insErr.message}` };
          }
        }
      }

      // Sync 3D GLB Model into product_media (Update in-place to preserve row ID & prevent duplicates)
      if (savedId && finalGlbModel !== undefined) {
        if (finalGlbModel && finalGlbModel.url) {
          const resolvedStoragePath = finalGlbModel.storagePath || 
            (form.status === 'published' ? '' : extractVaultPathFromUrl(finalGlbModel.url) || '');

          if (form.status === 'published') {
            if (!resolvedStoragePath || !resolvedStoragePath.startsWith('published/models/')) {
              return {
                success: false,
                error: `Cannot persist unpromoted 3D model for published product. Staging path "${resolvedStoragePath}" must be published to product-models bucket.`
              };
            }
            if (finalGlbModel.url.includes('atelier-vault') || finalGlbModel.url.includes('token=')) {
              return {
                success: false,
                error: 'Cannot save temporary signed URL as permanent public URL for published 3D model.'
              };
            }
          }

          const { data: existingGlbRows } = await supabase
            .from('product_media')
            .select('id')
            .eq('product_id', savedId)
            .eq('type', 'glb_model');

          const glbPayload = {
            product_id: savedId,
            type: 'glb_model',
            storage_path: resolvedStoragePath,
            public_url: finalGlbModel.url,
            metadata: finalGlbModel.metadata || null,
            sort_order: 0
          };

          if (existingGlbRows && existingGlbRows.length > 0) {
            const { error: updErr } = await supabase
              .from('product_media')
              .update(glbPayload)
              .eq('id', existingGlbRows[0].id);
            if (updErr) {
              return { success: false, error: `Failed to update 3D model record: ${updErr.message}` };
            }
          } else {
            const { error: insErr } = await supabase
              .from('product_media')
              .insert([glbPayload]);
            if (insErr) {
              return { success: false, error: `Failed to persist 3D model: ${insErr.message}` };
            }
          }
        }
      }

      // Sync Product Video into product_media (Update in-place to preserve row ID & prevent duplicates)
      if (savedId && finalProductVideo !== undefined) {
        if (finalProductVideo && finalProductVideo.url) {
          const resolvedStoragePath = finalProductVideo.storagePath || 
            (form.status === 'published' ? '' : extractVaultPathFromUrl(finalProductVideo.url) || '');

          if (form.status === 'published') {
            if (!resolvedStoragePath || !resolvedStoragePath.startsWith('published/videos/')) {
              return {
                success: false,
                error: `Cannot persist unpromoted video for published product. Staging path "${resolvedStoragePath}" must be published to showroom-videos bucket.`
              };
            }
            if (finalProductVideo.url.includes('atelier-vault') || finalProductVideo.url.includes('token=')) {
              return {
                success: false,
                error: 'Cannot save temporary signed URL as permanent public URL for published showcase video.'
              };
            }
          }

          const { data: existingVideoRows } = await supabase
            .from('product_media')
            .select('id')
            .eq('product_id', savedId)
            .eq('type', 'video');

          const videoPayload = {
            product_id: savedId,
            type: 'video',
            storage_path: resolvedStoragePath,
            public_url: finalProductVideo.url,
            sort_order: 0,
            thumbnail_url: finalProductVideo.posterUrl || null,
            metadata: {
              ...(finalProductVideo.metadata || {}),
              ...(finalProductVideo.posterUrl ? { posterUrl: finalProductVideo.posterUrl } : {}),
              is_preferred_viewer: form.preferredViewer === 'video'
            }
          };

          if (existingVideoRows && existingVideoRows.length > 0) {
            const { error: updErr } = await supabase
              .from('product_media')
              .update(videoPayload)
              .eq('id', existingVideoRows[0].id);
            if (updErr) {
              return { success: false, error: `Failed to update showcase video record: ${updErr.message}` };
            }
          } else {
            const { error: insErr } = await supabase
              .from('product_media')
              .insert([videoPayload]);
            if (insErr) {
              return { success: false, error: `Failed to persist showcase video: ${insErr.message}` };
            }
          }
        }
      }

      // Publication verified: safely remove staged files from private vault so they don't linger in atelier-vault
      if (form.status === 'published' && promotedStagingVaultPaths.length > 0) {
        for (const vPath of promotedStagingVaultPaths) {
          await deleteAsset(VAULT_BUCKET, vPath);
        }
      }

      return {
        success: true,
        id: savedId,
        promotedVideo: finalProductVideo && finalProductVideo.url ? {
          url: finalProductVideo.url,
          storagePath: finalProductVideo.storagePath,
          posterUrl: finalProductVideo.posterUrl
        } : undefined,
        promotedGlb: finalGlbModel && finalGlbModel.url ? {
          url: finalGlbModel.url,
          storagePath: finalGlbModel.storagePath
        } : undefined
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      return { success: false, error: msg };
    }
  },

  /**
   * PERMANENT PRODUCT DELETION & STORAGE CLEANUP WORKFLOW
   * 1. Validates is_admin() authorization.
   * 2. Retrieves target product and all dependent database records (media, finishes, 360 sequences, enquiries).
   * 3. Scans all candidate storage objects across showroom-videos, product-images, product-models, 360-sequences, and atelier-vault.
   * 4. Verifies exclusive ownership: Cross-references other products, categories, collections, and site settings to guarantee shared files are NEVER deleted.
   * 5. Atomically deletes database records via delete_product_permanent RPC (or safe cascading fallback) before deleting files.
   * 6. Deletes only verified unshared storage objects.
   * 7. Returns auditable ProductDeletionResult and preserves failed items for retry.
   */
  async deleteProductPermanent(id: string): Promise<ProductDeletionResult> {
    if (!isSupabaseConfigured) {
      return {
        success: true,
        productId: id,
        databaseDeleted: true,
        deletedMediaCount: 0,
        deletedFinishesCount: 0,
        deletedSequencesCount: 0,
        unlinkedEnquiriesCount: 0,
        storageCleanup: [],
        storageFailedCount: 0
      };
    }

    // Step 0: Enforce administrative authorization
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      return {
        success: false,
        productId: id,
        databaseDeleted: false,
        deletedMediaCount: 0,
        deletedFinishesCount: 0,
        deletedSequencesCount: 0,
        unlinkedEnquiriesCount: 0,
        storageCleanup: [],
        storageFailedCount: 0,
        error: 'Unauthorized: Only authorized administrators can permanently delete products.'
      };
    }

    try {
      // Step 1: Identify target product & dependent database records
      const { data: targetProduct, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (prodErr || !targetProduct) {
        return {
          success: false,
          productId: id,
          databaseDeleted: false,
          deletedMediaCount: 0,
          deletedFinishesCount: 0,
          deletedSequencesCount: 0,
          unlinkedEnquiriesCount: 0,
          storageCleanup: [],
          storageFailedCount: 0,
          error: prodErr?.message || `Product with ID "${id}" was not found.`
        };
      }

      const { data: targetMedia } = await supabase
        .from('product_media')
        .select('*')
        .eq('product_id', id);

      const { data: targetSequences } = await supabase
        .from('product_sequences_360')
        .select('*')
        .eq('product_id', id);

      const { data: targetFinishes } = await supabase
        .from('product_finishes')
        .select('id')
        .eq('product_id', id);

      const { data: targetEnquiries } = await supabase
        .from('enquiries')
        .select('id')
        .eq('product_id', id);

      // Step 2: Compile candidate storage objects
      const candidateMap = new Map<string, { bucket: string; path: string }>();

      const addCandidate = (val: string | null | undefined, hint?: string) => {
        const parsed = parseStorageBucketAndPath(val, hint);
        if (parsed && !isForbiddenStorageTarget(parsed.path)) {
          const key = `${parsed.bucket}:::${parsed.path}`;
          if (!candidateMap.has(key)) {
            candidateMap.set(key, parsed);
          }
        }
      };

      if (targetProduct.primary_image_url) {
        addCandidate(targetProduct.primary_image_url, 'product-images');
      }

      (targetMedia || []).forEach((m) => {
        const hint = m.type === 'video' ? 'showroom-videos' : m.type === 'glb_model' ? 'product-models' : 'product-images';
        if (m.storage_path) addCandidate(m.storage_path, hint);
        if (m.public_url) addCandidate(m.public_url, hint);
        if (m.thumbnail_url) addCandidate(m.thumbnail_url, 'product-images');
        if (m.metadata && typeof m.metadata === 'object') {
          const draftVaultPath = (m.metadata as Record<string, unknown>).draft_vault_path;
          if (typeof draftVaultPath === 'string') {
            addCandidate(draftVaultPath, 'atelier-vault');
          }
        }
      });

      (targetSequences || []).forEach((s) => {
        if (s.storage_path) addCandidate(s.storage_path, '360-sequences');
        if (s.public_url) addCandidate(s.public_url, '360-sequences');
      });

      // Step 3: Verify exclusive ownership and skip shared assets
      const sharedReasons = new Map<string, string>();

      if (candidateMap.size > 0) {
        // 3a. Check other products
        const { data: otherProducts } = await supabase
          .from('products')
          .select('id, name, primary_image_url')
          .neq('id', id);

        (otherProducts || []).forEach((p) => {
          const parsed = parseStorageBucketAndPath(p.primary_image_url, 'product-images');
          if (parsed) {
            const key = `${parsed.bucket}:::${parsed.path}`;
            if (candidateMap.has(key)) {
              sharedReasons.set(key, `Shared as primary image for product "${p.name}"`);
            }
          }
        });

        // 3b. Check other product media
        const { data: otherMedia } = await supabase
          .from('product_media')
          .select('storage_path, public_url, thumbnail_url, type, product_id')
          .neq('product_id', id);

        (otherMedia || []).forEach((m) => {
          const hint = m.type === 'video' ? 'showroom-videos' : m.type === 'glb_model' ? 'product-models' : 'product-images';
          [m.storage_path, m.public_url, m.thumbnail_url].forEach((u) => {
            const parsed = parseStorageBucketAndPath(u, hint);
            if (parsed) {
              const key = `${parsed.bucket}:::${parsed.path}`;
              if (candidateMap.has(key)) {
                sharedReasons.set(key, `Shared in media gallery of another product`);
              }
            }
          });
        });

        // 3c. Check other 360 sequences
        const { data: otherSequences } = await supabase
          .from('product_sequences_360')
          .select('storage_path, public_url')
          .neq('product_id', id);

        (otherSequences || []).forEach((s) => {
          [s.storage_path, s.public_url].forEach((u) => {
            const parsed = parseStorageBucketAndPath(u, '360-sequences');
            if (parsed) {
              const key = `${parsed.bucket}:::${parsed.path}`;
              if (candidateMap.has(key)) {
                sharedReasons.set(key, `Shared in 360 sequence of another product`);
              }
            }
          });
        });

        // 3d. Check categories
        const { data: categories } = await supabase
          .from('categories')
          .select('name, cover_image_url');

        (categories || []).forEach((c) => {
          const parsed = parseStorageBucketAndPath(c.cover_image_url, 'product-images');
          if (parsed) {
            const key = `${parsed.bucket}:::${parsed.path}`;
            if (candidateMap.has(key)) {
              sharedReasons.set(key, `Shared as cover image for category "${c.name}"`);
            }
          }
        });

        // 3e. Check collections
        const { data: collections } = await supabase
          .from('collections')
          .select('name, cover_image_url, video_url, video_poster_url');

        (collections || []).forEach((col) => {
          [
            { url: col.cover_image_url, hint: 'product-images' },
            { url: col.video_url, hint: 'showroom-videos' },
            { url: col.video_poster_url, hint: 'product-images' }
          ].forEach(({ url, hint }) => {
            const parsed = parseStorageBucketAndPath(url, hint);
            if (parsed) {
              const key = `${parsed.bucket}:::${parsed.path}`;
              if (candidateMap.has(key)) {
                sharedReasons.set(key, `Shared with collection "${col.name}"`);
              }
            }
          });
        });

        // 3f. Check site settings (hero videos, showroom media, etc.)
        const { data: siteSettings } = await supabase
          .from('site_settings')
          .select('key, value');

        (siteSettings || []).forEach((setting) => {
          const strVal = typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value);
          candidateMap.forEach((candidate, key) => {
            if (strVal.includes(candidate.path)) {
              sharedReasons.set(key, `Shared in site settings configuration (${setting.key})`);
            }
          });
        });
      }

      // Partition into unshared vs skipped shared
      const unsharedToDelete: Array<{ bucket: string; path: string }> = [];
      const storageAuditItems: StorageCleanupAuditItem[] = [];

      candidateMap.forEach((candidate, key) => {
        if (sharedReasons.has(key)) {
          storageAuditItems.push({
            bucket: candidate.bucket,
            path: candidate.path,
            status: 'skipped_shared',
            reason: sharedReasons.get(key)
          });
        } else {
          unsharedToDelete.push(candidate);
        }
      });

      // Step 4: Safely delete database records first
      let databaseDeleted = false;
      let deletedMediaCount = (targetMedia || []).length;
      let deletedFinishesCount = (targetFinishes || []).length;
      let deletedSequencesCount = (targetSequences || []).length;
      let unlinkedEnquiriesCount = (targetEnquiries || []).length;

      // Invoke server-side atomic RPC delete_product_permanent
      const { data: rpcData, error: rpcErr } = await supabase.rpc('delete_product_permanent', {
        target_product_id: id
      });

      if (!rpcErr && rpcData?.success) {
        databaseDeleted = true;
        deletedMediaCount = rpcData.deleted_media_count ?? deletedMediaCount;
        deletedFinishesCount = rpcData.deleted_finishes_count ?? deletedFinishesCount;
        deletedSequencesCount = rpcData.deleted_sequences_count ?? deletedSequencesCount;
        unlinkedEnquiriesCount = rpcData.unlinked_enquiries_count ?? unlinkedEnquiriesCount;
      } else {
        // Fallback: If RPC is not present in live DB, execute cascading operations
        // 1. Unlink enquiries to preserve customer records
        const { error: enqErr } = await supabase
          .from('enquiries')
          .update({ product_id: null })
          .eq('product_id', id);

        if (enqErr) {
          console.warn('Enquiries unlinking notice:', enqErr.message);
        }

        // 2. Delete dependent tables
        await supabase.from('product_sequences_360').delete().eq('product_id', id);
        await supabase.from('product_finishes').delete().eq('product_id', id);
        await supabase.from('product_media').delete().eq('product_id', id);

        // 3. Delete root product
        const { error: delProdErr } = await supabase.from('products').delete().eq('id', id);
        if (delProdErr) {
          return {
            success: false,
            productId: id,
            productName: targetProduct.name,
            productSku: targetProduct.sku,
            databaseDeleted: false,
            deletedMediaCount: 0,
            deletedFinishesCount: 0,
            deletedSequencesCount: 0,
            unlinkedEnquiriesCount: 0,
            storageCleanup: [],
            storageFailedCount: 0,
            error: `Database deletion failed: ${delProdErr.message}. Storage cleanup was aborted to protect assets.`
          };
        }
        databaseDeleted = true;
      }

      // Step 5: Delete verified, unshared storage objects belonging to this product
      for (const item of unsharedToDelete) {
        try {
          const { error: removeErr } = await supabase.storage.from(item.bucket).remove([item.path]);
          if (removeErr) {
            storageAuditItems.push({
              bucket: item.bucket,
              path: item.path,
              status: 'failed',
              error: removeErr.message
            });
          } else {
            storageAuditItems.push({
              bucket: item.bucket,
              path: item.path,
              status: 'deleted'
            });
          }
        } catch (storageErr) {
          storageAuditItems.push({
            bucket: item.bucket,
            path: item.path,
            status: 'failed',
            error: storageErr instanceof Error ? storageErr.message : 'Storage remove failed'
          });
        }
      }

      const storageFailedCount = storageAuditItems.filter((i) => i.status === 'failed').length;
      const isCompleteSuccess = databaseDeleted && storageFailedCount === 0;

      return {
        success: isCompleteSuccess,
        productId: id,
        productName: targetProduct.name,
        productSku: targetProduct.sku,
        databaseDeleted,
        deletedMediaCount,
        deletedFinishesCount,
        deletedSequencesCount,
        unlinkedEnquiriesCount,
        storageCleanup: storageAuditItems,
        storageFailedCount,
        error: storageFailedCount > 0
          ? `Product database records deleted, but ${storageFailedCount} storage asset(s) could not be removed. You can retry cleanup.`
          : undefined
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Product deletion failed';
      return {
        success: false,
        productId: id,
        databaseDeleted: false,
        deletedMediaCount: 0,
        deletedFinishesCount: 0,
        deletedSequencesCount: 0,
        unlinkedEnquiriesCount: 0,
        storageCleanup: [],
        storageFailedCount: 0,
        error: msg
      };
    }
  },

  /**
   * Retries storage deletion for any assets that encountered temporary failures during product deletion.
   */
  async retryStorageCleanup(auditItems: StorageCleanupAuditItem[]): Promise<{
    success: boolean;
    results: StorageCleanupAuditItem[];
    remainingFailedCount: number;
  }> {
    const results: StorageCleanupAuditItem[] = [];
    const failedItems = auditItems.filter((i) => i.status === 'failed');

    for (const item of failedItems) {
      if (isForbiddenStorageTarget(item.path)) {
        results.push({
          ...item,
          status: 'skipped_reserved',
          reason: 'System protected path'
        });
        continue;
      }

      try {
        const { error } = await supabase.storage.from(item.bucket).remove([item.path]);
        if (error) {
          results.push({
            bucket: item.bucket,
            path: item.path,
            status: 'failed',
            error: error.message
          });
        } else {
          results.push({
            bucket: item.bucket,
            path: item.path,
            status: 'deleted'
          });
        }
      } catch (err) {
        results.push({
          bucket: item.bucket,
          path: item.path,
          status: 'failed',
          error: err instanceof Error ? err.message : 'Storage remove failed'
        });
      }
    }

    const remainingFailedCount = results.filter((r) => r.status === 'failed').length;
    return {
      success: remainingFailedCount === 0,
      results,
      remainingFailedCount
    };
  },

  async deleteProduct(id: string): Promise<{ success: boolean; error?: string; audit?: ProductDeletionResult }> {
    const result = await this.deleteProductPermanent(id);
    return {
      success: result.success,
      error: result.error,
      audit: result
    };
  },

  async toggleProductPublish(id: string, newStatus: 'draft' | 'published'): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };

    try {
      if (newStatus === 'published') {
        // Promote assets from private vault to public showroom buckets
        const { data: media, error: medErr } = await supabase.from('product_media').select('*').eq('product_id', id);
        if (medErr) return { success: false, error: medErr.message };

        let promotedPrimaryUrl: string | undefined;
        if (media) {
          for (const m of media) {
            const isVideo = m.type === 'video';
            const isGlb = m.type === 'glb_model';
            const targetBucket = m.type === 'image' ? 'product-images' : isGlb ? 'product-models' : isVideo ? 'showroom-videos' : '360-sequences';
            const targetPrefix = isVideo ? 'published/videos/' : isGlb ? 'published/models/' : 'published/';
            const exists = Boolean(
              m.storage_path &&
              m.storage_path.startsWith(targetPrefix) &&
              !m.public_url.includes('atelier-vault') &&
              !m.public_url.includes('token=') &&
              await assetExists(targetBucket, m.storage_path)
            );
            if (!exists) {
              const vaultSource = (m.metadata as any)?.draft_vault_path || 
                                  (m.storage_path && !m.storage_path.startsWith('http') ? m.storage_path : null) || 
                                  extractVaultPathFromUrl(m.public_url);
              if (vaultSource && !vaultSource.startsWith('http')) {
                const uploadType = isGlb ? 'model' : isVideo ? 'video' : m.type === 'sequence_frame' ? 'sequence' : 'image';
                const res = await promoteDraftToPublic(vaultSource, uploadType);
                if (res.success && res.publicUrl && res.publicPath) {
                  // Also handle video poster thumbnail if present and in vault
                  let promotedThumbnailUrl = m.thumbnail_url;
                  if (m.type === 'video' && m.thumbnail_url) {
                    const posterSource = (m.metadata as any)?.posterStoragePath || extractVaultPathFromUrl(m.thumbnail_url);
                    if (posterSource && !posterSource.startsWith('published/') && !posterSource.startsWith('http')) {
                      const pRes = await promoteDraftToPublic(posterSource, 'image');
                      if (pRes.success && pRes.publicUrl) {
                        promotedThumbnailUrl = pRes.publicUrl;
                        await deleteAsset(VAULT_BUCKET, pRes.vaultPath || posterSource);
                      }
                    }
                  }

                  await supabase.from('product_media').update({
                    public_url: res.publicUrl,
                    storage_path: res.publicPath,
                    thumbnail_url: promotedThumbnailUrl,
                    metadata: {
                      ...((m.metadata as Record<string, unknown>) || {}),
                      draft_vault_path: undefined,
                      previous_vault_path: res.vaultPath || vaultSource
                    }
                  }).eq('id', m.id);

                  if (m.type === 'image' && !promotedPrimaryUrl) {
                    promotedPrimaryUrl = res.publicUrl;
                  }

                  // Verification complete and database updated: safely delete from vault
                  await deleteAsset(VAULT_BUCKET, res.vaultPath || vaultSource);
                } else {
                  return {
                    success: false,
                    error: `Failed to promote asset "${vaultSource}" to public showroom: ${res.error || 'Unknown error'}. Product remains in draft status.`
                  };
                }
              }
            } else if (m.type === 'image' && !promotedPrimaryUrl) {
              promotedPrimaryUrl = m.public_url;
            }
          }
        }

        const updatePayload: Record<string, unknown> = {
          status: 'published',
          updated_at: new Date().toISOString()
        };
        if (promotedPrimaryUrl) {
          updatePayload.primary_image_url = promotedPrimaryUrl;
        }

        const { error } = await supabase
          .from('products')
          .update(updatePayload)
          .eq('id', id);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } else {
        // When unpublishing (moving to draft), revoke public assets from public showroom buckets
        const { data: media } = await supabase.from('product_media').select('*').eq('product_id', id);
        if (media) {
          for (const m of media) {
            if (m.storage_path && m.storage_path.startsWith('published/')) {
              const b = m.type === 'image' ? 'product-images' : m.type === 'glb_model' ? 'product-models' : 'showroom-videos';
              await revokePublicAsset(b, m.storage_path);
            }
          }
        }

        const { error } = await supabase
          .from('products')
          .update({
            status: 'draft',
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publish toggle failed';
      return { success: false, error: msg };
    }
  },

  /**
   * SAFE RECOVERY ROUTINE:
   * Inspects published products and product_media records for videos and 3D GLB models whose source objects
   * still reside in atelier-vault with empty or draft storage paths and expiring signed tokens.
   * Promotes them to permanent public showroom buckets (showroom-videos/published/videos/ or product-models/published/models/),
   * verifies persistence, updates product_media with permanent public URLs and paths.
   * PRESERVES original staged files in atelier-vault as required by safe recovery guidelines.
   */
  async repairPublishedProductMedia(): Promise<MediaRepairResult> {
    if (!isSupabaseConfigured) {
      return { success: false, scanned: 0, repaired: 0, errors: ['Supabase is not configured'], details: [] };
    }

    try {
      const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('id, name, slug, status, product_media(*)');

      if (prodErr || !products) {
        return { success: false, scanned: 0, repaired: 0, errors: [prodErr?.message || 'Failed to fetch products'], details: [] };
      }

      let repaired = 0;
      let scanned = 0;
      const errors: string[] = [];
      const details: MediaRepairDetail[] = [];

      for (const prod of products) {
        const mediaItems = (prod.product_media || []).filter(
          (m: { type: string }) => m.type === 'video' || m.type === 'glb_model'
        );

        for (const item of mediaItems) {
          scanned++;
          const isVideo = item.type === 'video';
          const isGlb = item.type === 'glb_model';
          const targetBucket = isVideo ? 'showroom-videos' : 'product-models';
          const targetPrefix = isVideo ? 'published/videos/' : 'published/models/';
          const uploadType = isVideo ? 'video' : 'model';

          const destinationMissing = item.storage_path && item.storage_path.startsWith(targetPrefix)
            ? !(await assetExists(targetBucket, item.storage_path))
            : false;

          const isStagedInVault = Boolean(
            destinationMissing ||
            !item.storage_path ||
            !item.storage_path.startsWith(targetPrefix) ||
            item.public_url.includes('atelier-vault') ||
            item.public_url.includes('token=') ||
            item.storage_path.includes('atelier-vault') ||
            item.storage_path.startsWith('drafts/') ||
            (isVideo && item.storage_path.startsWith('videos/')) ||
            (isGlb && item.storage_path.startsWith('models/'))
          );

          if (isStagedInVault) {
            const vaultSource = (item.metadata as any)?.draft_vault_path || 
                                (item.storage_path && !item.storage_path.startsWith('http') ? item.storage_path : null) || 
                                extractVaultPathFromUrl(item.public_url);

            if (!vaultSource) {
              errors.push(`Product "${prod.name}" (${item.type}): Could not extract vault source for URL "${item.public_url}"`);
              continue;
            }

            // Promote to permanent showroom bucket while PRESERVING original staged file in atelier-vault
            const res = await promoteDraftToPublic(vaultSource, uploadType, {
              deleteSourceAfterVerification: false
            });

            if (res.success && res.publicUrl && res.publicPath) {
              // Also promote thumbnail poster if stored in vault
              let newPosterUrl: string | undefined = item.thumbnail_url || (item.metadata as any)?.posterUrl;
              if (isVideo && newPosterUrl) {
                const posterVaultSource = (item.metadata as any)?.posterStoragePath || 
                                          extractVaultPathFromUrl(newPosterUrl);
                if (posterVaultSource && !posterVaultSource.startsWith('published/') && !posterVaultSource.startsWith('http')) {
                  const posterRes = await promoteDraftToPublic(posterVaultSource, 'image', {
                    deleteSourceAfterVerification: false
                  });
                  if (posterRes.success && posterRes.publicUrl) {
                    newPosterUrl = posterRes.publicUrl;
                  }
                }
              }

              const { error: updErr } = await supabase
                .from('product_media')
                .update({
                  public_url: res.publicUrl,
                  storage_path: res.publicPath,
                  thumbnail_url: newPosterUrl || null,
                  metadata: {
                    ...((item.metadata as Record<string, unknown>) || {}),
                    repaired_at: new Date().toISOString(),
                    previous_vault_path: res.vaultPath || vaultSource,
                    safe_recovery: true
                  }
                })
                .eq('id', item.id);

              if (updErr) {
                errors.push(`Product "${prod.name}" (${item.type}): Failed to update product_media: ${updErr.message}`);
                continue;
              }

              repaired++;
              details.push({
                productId: prod.id,
                productName: prod.name,
                mediaId: item.id,
                type: item.type,
                oldUrl: item.public_url,
                newUrl: res.publicUrl,
                storagePath: res.publicPath
              });
            } else {
              errors.push(`Product "${prod.name}" (${item.type}): Promotion failed - ${res.error || 'Unknown error'}`);
            }
          }
        }
      }

      return {
        success: errors.length === 0,
        scanned,
        repaired,
        errors,
        details
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Recovery routine failed';
      return { success: false, scanned: 0, repaired: 0, errors: [msg], details: [] };
    }
  },

  /**
   * TARGETED SAFE REPAIR ACTION:
   * Processes strictly the 3 affected products:
   * 1. Aurelia Monolith Curved Sofa
   * 2. Brera Sculpted Velvet Barrel Lounge Chair
   * 3. Tivoli Travertine Cantilever Coffee Table
   *
   * Idempotent: Skips rows that have already been cleanly promoted to showroom-videos/published/videos/.
   * Strictly verifies source file exists and is readable in atelier-vault.
   * Never overwrites unrelated media.
   * If a legacy signed URL has expired or source is missing, reports clearly and asks for re-upload without fabricating URLs.
   */
  async repairTargetedProductVideos(): Promise<MediaRepairResult> {
    if (!isSupabaseConfigured) {
      return { success: false, scanned: 0, repaired: 0, alreadyRepaired: 0, errors: ['Supabase is not configured'], details: [] };
    }

    const targetSlugs = TARGETED_AFFECTED_PRODUCTS.map((p) => p.slug);

    try {
      // Query target products specifically with their product_media
      const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('id, name, slug, status, product_media(*)')
        .in('slug', targetSlugs);

      if (prodErr || !products) {
        return { success: false, scanned: 0, repaired: 0, alreadyRepaired: 0, errors: [prodErr?.message || 'Failed to fetch targeted products'], details: [] };
      }

      let repaired = 0;
      let alreadyRepaired = 0;
      let scanned = 0;
      const errors: string[] = [];
      const details: MediaRepairDetail[] = [];

      for (const prod of products) {
        const videoRows = (prod.product_media || []).filter((m: { type: string }) => m.type === 'video');

        for (const item of videoRows) {
          scanned++;
          const targetBucket = 'showroom-videos';
          const targetPrefix = 'published/videos/';

          // Check if already cleanly repaired & verified (Idempotency)
          const isAlreadyCleanlyPublished = Boolean(
            item.storage_path &&
            item.storage_path.startsWith(targetPrefix) &&
            !item.public_url.includes('atelier-vault') &&
            !item.public_url.includes('token=') &&
            (await assetExists(targetBucket, item.storage_path))
          );

          if (isAlreadyCleanlyPublished) {
            alreadyRepaired++;
            continue; // Idempotent skip
          }

          // 1. Resolve draft object path from saved storage_path or legacy signed URL
          const vaultSource = (item.metadata as any)?.draft_vault_path ||
                              (item.storage_path && !item.storage_path.startsWith('http') ? item.storage_path : null) ||
                              extractVaultPathFromUrl(item.public_url);

          if (!vaultSource) {
            errors.push(
              `"${prod.name}": Cannot resolve draft source path from legacy URL "${item.public_url}". Please re-upload the video.`
            );
            continue;
          }

          const cleanVaultPath = vaultSource.replace(/^atelier-vault\//, '').replace(/^\/+/, '');
          const rawFileName = cleanVaultPath.split('/').pop() || `${Date.now()}_video.mp4`;
          const fileName = rawFileName.split('?')[0];

          // 2. Verify source object exists and is readable in atelier-vault before attempting promotion
          const candidatePaths = [
            cleanVaultPath,
            `drafts/videos/${fileName}`,
            `videos/${fileName}`,
            fileName
          ];

          let sourceBlob: Blob | null = null;
          let confirmedSourcePath: string | null = null;

          for (const cPath of candidatePaths) {
            try {
              const { data, error } = await supabase.storage.from(VAULT_BUCKET).download(cPath);
              if (!error && data && data.size > 0) {
                sourceBlob = data;
                confirmedSourcePath = cPath;
                break;
              }
            } catch {
              // try next candidate
            }
          }

          if (!sourceBlob || !confirmedSourcePath) {
            errors.push(
              `"${prod.name}": Staged draft video "${cleanVaultPath}" was not found or is unreadable in atelier-vault. Signed token has expired and source file is missing. Please re-upload this video.`
            );
            continue; // NEVER fabricate a URL!
          }

          // 3. Upload to showroom-videos under published/videos/<unique-filename>.mp4
          const destStoragePath = `published/videos/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(targetBucket)
            .upload(destStoragePath, sourceBlob, {
              cacheControl: '3600',
              contentType: sourceBlob.type || 'video/mp4',
              upsert: true
            });

          if (uploadError) {
            errors.push(`"${prod.name}": Upload to "${targetBucket}" failed: ${uploadError.message}. Source file preserved.`);
            continue;
          }

          // 4. Verify destination object exists in showroom-videos
          const destinationVerified = Boolean(uploadData) || (await assetExists(targetBucket, destStoragePath));
          if (!destinationVerified) {
            errors.push(`"${prod.name}": Destination verification failed for "${destStoragePath}" in "${targetBucket}". Source file preserved.`);
            continue;
          }

          // 5. Generate permanent public CDN URL
          const { data: { publicUrl } } = supabase.storage
            .from(targetBucket)
            .getPublicUrl(destStoragePath);

          if (!publicUrl) {
            errors.push(`"${prod.name}": Failed to generate public URL for "${destStoragePath}".`);
            continue;
          }

          // 6. Update existing product_media row by ID (preserves row ID & product ID, zero duplicates)
          const { error: dbErr } = await supabase
            .from('product_media')
            .update({
              storage_path: destStoragePath,
              public_url: publicUrl,
              metadata: {
                ...((item.metadata as Record<string, unknown>) || {}),
                repaired_at: new Date().toISOString(),
                previous_vault_path: confirmedSourcePath,
                source_verified: true,
                repair_action: 'targeted_video_repair'
              }
            })
            .eq('id', item.id);

          if (dbErr) {
            errors.push(`"${prod.name}": Failed to update database record ${item.id}: ${dbErr.message}. Source file preserved.`);
            continue;
          }

          repaired++;
          details.push({
            productId: prod.id,
            productName: prod.name,
            mediaId: item.id,
            type: item.type,
            oldUrl: item.public_url,
            newUrl: publicUrl,
            storagePath: destStoragePath
          });
        }
      }

      return {
        success: errors.length === 0,
        scanned,
        repaired,
        alreadyRepaired,
        errors,
        details
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Targeted video repair failed';
      return { success: false, scanned: 0, repaired: 0, alreadyRepaired: 0, errors: [msg], details: [] };
    }
  },

  async repairPublishedProductVideos(): Promise<MediaRepairResult> {
    return this.repairTargetedProductVideos();
  },

  // ===================== CATEGORIES =====================
  async getCategories(): Promise<ProductCategory[]> {
    if (!isSupabaseConfigured) return [];
    const { data } = await supabase
      .from('categories')
      .select('*, products(id)')
      .order('sort_order', { ascending: true });
    if (!data) return [];
    return data.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description || undefined,
      coverImageUrl: c.cover_image_url || null,
      sortOrder: c.sort_order ?? 0,
      productCount: Array.isArray(c.products) ? c.products.length : 0
    }));
  },

  async getCategoryProductCount(categoryId: string): Promise<number> {
    if (!isSupabaseConfigured) return 0;
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);
    if (error) return 0;
    return count || 0;
  },

  async saveCategory(cat: {
    id?: string;
    name: string;
    slug: string;
    description?: string;
    coverImageUrl?: string | null;
    sortOrder?: number;
  }): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Database unconfigured' };
    const payload: any = {
      name: cat.name.trim(),
      slug: cat.slug.trim(),
      description: cat.description || null,
      sort_order: cat.sortOrder ?? 0,
      updated_at: new Date().toISOString()
    };
    if (cat.coverImageUrl !== undefined) {
      payload.cover_image_url = cat.coverImageUrl || null;
    }
    if (cat.id) {
      const { error } = await supabase.from('categories').update(payload).eq('id', cat.id);
      return { success: !error, error: error?.message };
    } else {
      const { error } = await supabase.from('categories').insert([payload]);
      return { success: !error, error: error?.message };
    }
  },

  async reorderCategories(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase.from('categories').update({ sort_order: i }).eq('id', orderedIds[i]);
      }
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to reorder' };
    }
  },

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };
    // Safety check: Prevent deletion if products are assigned
    const count = await this.getCategoryProductCount(id);
    if (count > 0) {
      return {
        success: false,
        error: `Cannot delete category: ${count} product(s) are currently assigned. Please reassign those products first.`
      };
    }
    const { error } = await supabase.from('categories').delete().eq('id', id);
    return { success: !error, error: error?.message };
  },

  // ===================== COLLECTIONS =====================
  async getCollections(): Promise<Collection[]> {
    if (!isSupabaseConfigured) return [];
    const { data } = await supabase
      .from('collections')
      .select('*, products(id)')
      .order('sort_order', { ascending: true });
    if (!data) return [];
    return data.map((c: any) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      headline: c.headline,
      description: c.description,
      coverImageUrl: c.cover_image_url || null,
      videoUrl: c.video_url || null,
      videoPosterUrl: c.video_poster_url || null,
      featuredProductIds: Array.isArray(c.products) ? c.products.map((p: any) => p.id) : [],
      sortOrder: c.sort_order ?? 0,
      isPublished: c.is_published,
      createdAt: c.created_at
    }));
  },

  async getCollectionProductCount(collectionId: string): Promise<number> {
    if (!isSupabaseConfigured) return 0;
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collectionId);
    if (error) return 0;
    return count || 0;
  },

  async saveCollection(col: {
    id?: string;
    name: string;
    slug: string;
    headline: string;
    description: string;
    coverImageUrl?: string | null;
    videoUrl?: string | null;
    videoPosterUrl?: string | null;
    sortOrder?: number;
    isPublished: boolean;
    productIds?: string[];
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Database unconfigured' };
    const payload: any = {
      name: col.name.trim(),
      slug: col.slug.trim(),
      headline: col.headline.trim(),
      description: col.description.trim(),
      cover_image_url: col.coverImageUrl || null,
      video_url: col.videoUrl || null,
      video_poster_url: col.videoPosterUrl || null,
      sort_order: col.sortOrder ?? 0,
      is_published: col.isPublished,
      updated_at: new Date().toISOString()
    };
    let savedId = col.id;
    if (col.id) {
      const { error } = await supabase.from('collections').update(payload).eq('id', col.id);
      if (error) return { success: false, error: error.message };
    } else {
      const { data, error } = await supabase.from('collections').insert([payload]).select('id').single();
      if (error || !data) return { success: false, error: error?.message || 'Failed to insert collection' };
      savedId = data.id;
    }

    // Sync product assignments if provided
    if (savedId && col.productIds !== undefined) {
      await this.assignProductsToCollection(savedId, col.productIds);
    }

    return { success: true, id: savedId };
  },

  async assignProductsToCollection(collectionId: string, productIds: string[]): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: false, error: 'Database unconfigured' };
    try {
      // 1. Unassign products that are currently in this collection but not in productIds
      await supabase.from('products').update({ collection_id: null }).eq('collection_id', collectionId);
      // 2. Assign the chosen productIds
      if (productIds.length > 0) {
        const { error } = await supabase.from('products').update({ collection_id: collectionId }).in('id', productIds);
        if (error) return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to assign products' };
    }
  },

  async reorderCollections(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase.from('collections').update({ sort_order: i }).eq('id', orderedIds[i]);
      }
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to reorder' };
    }
  },

  async deleteCollection(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };
    // Safety check: Prevent deletion if products are assigned
    const count = await this.getCollectionProductCount(id);
    if (count > 0) {
      return {
        success: false,
        error: `Cannot delete collection: ${count} product(s) are currently assigned. Please reassign or remove products from this collection first.`
      };
    }
    const { error } = await supabase.from('collections').delete().eq('id', id);
    return { success: !error, error: error?.message };
  },

  // ===================== ENQUIRIES =====================
  async getEnquiries(): Promise<CustomerEnquiry[]> {
    if (!isSupabaseConfigured) return [];
    const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    if (!data) return [];
    return data.map((e) => ({
      id: e.id,
      type: e.type,
      fullName: e.full_name,
      email: e.email,
      phone: e.phone || undefined,
      preferredContact: e.preferred_contact,
      productId: e.product_id || undefined,
      productName: e.product_name || undefined,
      message: e.message,
      status: e.status,
      createdAt: e.created_at
    }));
  },

  async updateEnquiryStatus(id: string, status: 'new' | 'reviewed' | 'contacted' | 'archived'): Promise<{ success: boolean }> {
    if (!isSupabaseConfigured) return { success: true };
    const { error } = await supabase.from('enquiries').update({ status }).eq('id', id);
    return { success: !error };
  },

  async deleteEnquiry(id: string): Promise<{ success: boolean }> {
    if (!isSupabaseConfigured) return { success: true };
    const { error } = await supabase.from('enquiries').delete().eq('id', id);
    return { success: !error };
  },

  // ===================== SITE SETTINGS =====================
  async saveSiteSettings(key: 'hero' | 'showroom_media' | 'brand', value: unknown): Promise<{ success: boolean; error?: string }> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('villexa_site_config_' + key, JSON.stringify(value));
      }
    } catch {
      // Local cache error non-blocking
    }

    if (!isSupabaseConfigured) {
      return { success: true };
    }

    const { error } = await supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    return { success: !error, error: error?.message };
  }
};
