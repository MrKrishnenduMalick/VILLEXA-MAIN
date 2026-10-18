import { supabase, isSupabaseConfigured } from './supabaseClient';
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
  sequenceFrames?: Array<{ url: string; storagePath?: string; metadata?: Record<string, unknown> }>;
}

export const adminService = {
  // ===================== PRODUCT CRUD =====================
  async getAllProducts(): Promise<Product[]> {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), collections(*), product_media(*), product_sequences_360(*)')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching admin products:', error);
      return [];
    }

    // Collect all draft vault storage paths across products to batch generate fresh signed preview URLs
    const vaultPathsToSign: string[] = [];
    data.forEach((item) => {
      (item.product_media || []).forEach((m: { storage_path?: string }) => {
        if (m.storage_path && !m.storage_path.startsWith('published/') && !m.storage_path.startsWith('http')) {
          vaultPathsToSign.push(m.storage_path);
        }
      });
      (item.product_sequences_360 || []).forEach((s: { storage_path?: string }) => {
        if (s.storage_path && !s.storage_path.startsWith('published/') && !s.storage_path.startsWith('http')) {
          vaultPathsToSign.push(s.storage_path);
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
      const seqItems = (item.product_sequences_360 || []).sort((a: { frame_index: number }, b: { frame_index: number }) => a.frame_index - b.frame_index);

      // Resolve gallery images with fresh signed URLs if in private vault, or existing permanent URL
      const galleryMedia: Array<{ url: string; storagePath?: string; metadata?: Record<string, unknown> }> = imageItems.map((m: { public_url: string; storage_path?: string; metadata?: any }) => {
        const signed = m.storage_path ? signedUrlMap.get(m.storage_path) : undefined;
        const isVault = m.storage_path && !m.storage_path.startsWith('published/') && !m.storage_path.startsWith('http');
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

      // Resolve 3D GLB Model URL
      let glbUrl = glbItem?.public_url;
      if (isDraft && glbItem?.storage_path && signedUrlMap.get(glbItem.storage_path)) {
        glbUrl = signedUrlMap.get(glbItem.storage_path);
      }

      // Resolve 360 Sequence frame URLs
      const frameUrls = seqItems.map((s: { public_url: string; storage_path: string }) => {
        if (isDraft && s.storage_path && signedUrlMap.get(s.storage_path)) {
          return signedUrlMap.get(s.storage_path)!;
        }
        return s.public_url;
      });

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
        videoUrl: videoItem?.public_url || null,
        videoPosterUrl: (videoItem?.metadata as any)?.posterUrl || null,
        preferredViewer: (item.preferred_viewer === 'video' || (videoItem?.metadata as any)?.is_preferred_viewer) ? 'video' : (item.preferred_viewer || 'gallery'),
        glbConfig: glbItem ? { modelUrl: glbUrl || glbItem.public_url } : undefined,
        sequence360Config: seqItems.length > 0 ? {
          frameCount: seqItems.length,
          initialFrame: 0,
          rotationDirection: 'clockwise' as const,
          frameUrls
        } : undefined,
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

  async saveProduct(form: ProductFormData): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Database is unconfigured. Connect Supabase to persist products.' };
    }

    let finalPrimaryImageUrl = form.primaryImageUrl;
    let finalGalleryImages = form.galleryImages ? [...form.galleryImages] : undefined;
    let finalGlbModel = form.glbModel ? { ...form.glbModel } : form.glbModel;
    let finalSequenceFrames = form.sequenceFrames ? [...form.sequenceFrames] : undefined;


    // PUBLICATION WORKFLOW:
    // If saving as published, promote assets from private vault to public showroom buckets
    if (form.status === 'published') {
      if (finalGalleryImages) {
        const promoted: Array<{ url: string; storagePath?: string; metadata?: Record<string, unknown> }> = [];
        for (const img of finalGalleryImages) {
          const alreadyExists = img.storagePath?.startsWith('published/') && await assetExists('product-images', img.storagePath);
          if (!alreadyExists) {
            const vaultSource = (img.metadata as any)?.draft_vault_path || img.storagePath;
            if (vaultSource) {
              const res = await promoteDraftToPublic(vaultSource, 'image');
              if (res.success && res.publicUrl) {
                promoted.push({
                  url: res.publicUrl,
                  storagePath: res.publicPath,
                  metadata: {
                    ...(img.metadata || {}),
                    draft_vault_path: res.vaultPath || vaultSource
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

      if (finalGlbModel?.storagePath) {
        const alreadyExists = finalGlbModel.storagePath.startsWith('published/') && await assetExists('product-models', finalGlbModel.storagePath);
        if (!alreadyExists) {
          const vaultSource = (finalGlbModel.metadata as any)?.draft_vault_path || finalGlbModel.storagePath;
          const res = await promoteDraftToPublic(vaultSource, 'model');
          if (res.success && res.publicUrl) {
            finalGlbModel = {
              url: res.publicUrl,
              storagePath: res.publicPath,
              metadata: {
                ...(finalGlbModel.metadata || {}),
                draft_vault_path: res.vaultPath || vaultSource
              }
            };
          } else {
            return {
              success: false,
              error: `Failed to promote 3D GLB model to public showroom: ${res.error || 'Unknown error'}. Product remains in draft status.`
            };
          }
        }
      }

      if (finalSequenceFrames) {
        const promoted: Array<{ url: string; storagePath?: string; metadata?: Record<string, unknown> }> = [];
        for (const frame of finalSequenceFrames) {
          const alreadyExists = frame.storagePath?.startsWith('published/') && await assetExists('360-sequences', frame.storagePath);
          if (!alreadyExists && frame.storagePath) {
            const vaultSource = (frame.metadata as any)?.draft_vault_path || frame.storagePath;
            const res = await promoteDraftToPublic(vaultSource, 'sequence');
            if (res.success && res.publicUrl) {
              promoted.push({
                url: res.publicUrl,
                storagePath: res.publicPath,
                metadata: {
                  ...(frame.metadata || {}),
                  draft_vault_path: res.vaultPath || vaultSource
                }
              });
            } else {
              return {
                success: false,
                error: `Failed to promote 360 sequence frame to public showroom: ${res.error || 'Unknown error'}. Product remains in draft status.`
              };
            }
          } else {
            promoted.push(frame);
          }
        }
        finalSequenceFrames = promoted;
      }
    } else {
      // DRAFT WORKFLOW:
      // If saving as draft, revoke any existing public files if this product was previously published
      if (form.id) {
        const { data: existingMedia } = await supabase.from('product_media').select('*').eq('product_id', form.id);
        if (existingMedia) {
          for (const m of existingMedia) {
            if (m.storage_path && m.storage_path.startsWith('published/')) {
              const b = m.type === 'image' ? 'product-images' : m.type === 'glb_model' ? 'product-models' : '360-sequences';
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

      // Sync 3D GLB Model into product_media
      if (savedId && finalGlbModel !== undefined) {
        const { error: delErr } = await supabase.from('product_media').delete().eq('product_id', savedId).eq('type', 'glb_model');
        if (delErr) {
          return { success: false, error: `Failed to clear existing 3D model: ${delErr.message}` };
        }
        if (finalGlbModel) {
          const { error: insErr } = await supabase.from('product_media').insert([
            {
              product_id: savedId,
              type: 'glb_model',
              storage_path: finalGlbModel.storagePath || '',
              public_url: finalGlbModel.url,
              metadata: finalGlbModel.metadata || null,
              sort_order: 0
            }
          ]);
          if (insErr) {
            return { success: false, error: `Failed to persist 3D model: ${insErr.message}` };
          }
        }
      }

      // Sync 360 Sequences into product_sequences_360
      if (savedId && finalSequenceFrames !== undefined) {
        const { error: delErr } = await supabase.from('product_sequences_360').delete().eq('product_id', savedId);
        if (delErr) {
          return { success: false, error: `Failed to clear existing 360 sequence: ${delErr.message}` };
        }
        if (finalSequenceFrames.length > 0) {
          const sequenceRows = finalSequenceFrames.map((frame, idx) => ({
            product_id: savedId,
            sequence_identifier: 'primary',
            frame_index: idx + 1,
            storage_path: frame.storagePath || '',
            public_url: frame.url
          }));
          const { error: insErr } = await supabase.from('product_sequences_360').insert(sequenceRows);
          if (insErr) {
            return { success: false, error: `Failed to persist 360 sequence frames: ${insErr.message}` };
          }
        }
      }

      // Sync Product Video into product_media
      if (savedId && form.productVideo !== undefined) {
        const { error: delErr } = await supabase.from('product_media').delete().eq('product_id', savedId).eq('type', 'video');
        if (delErr) {
          return { success: false, error: `Failed to clear existing video: ${delErr.message}` };
        }
        if (form.productVideo) {
          const { error: insErr } = await supabase.from('product_media').insert([
            {
              product_id: savedId,
              type: 'video',
              storage_path: form.productVideo.storagePath || '',
              public_url: form.productVideo.url,
              sort_order: 0,
              metadata: {
                ...(form.productVideo.metadata || {}),
                ...(form.productVideo.posterUrl ? { posterUrl: form.productVideo.posterUrl } : {}),
                is_preferred_viewer: form.preferredViewer === 'video'
              }
            }
          ]);
          if (insErr) {
            return { success: false, error: `Failed to persist showcase video: ${insErr.message}` };
          }
        }
      }

      return { success: true, id: savedId };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      return { success: false, error: msg };
    }
  },

  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };

    try {
      // 1. Clean up public showroom and private vault storage objects
      const { data: media } = await supabase.from('product_media').select('*').eq('product_id', id);
      if (media) {
        for (const m of media) {
          if (m.storage_path) {
            if (m.storage_path.startsWith('published/')) {
              const b = m.type === 'image' ? 'product-images' : m.type === 'glb_model' ? 'product-models' : m.type === 'video' ? 'showroom-videos' : '360-sequences';
              await revokePublicAsset(b, m.storage_path);
            } else {
              await deleteAsset(VAULT_BUCKET, m.storage_path);
            }
          }
        }
      }

      const { data: seq } = await supabase.from('product_sequences_360').select('*').eq('product_id', id);
      if (seq) {
        for (const s of seq) {
          if (s.storage_path) {
            if (s.storage_path.startsWith('published/')) {
              await revokePublicAsset('360-sequences', s.storage_path);
            } else {
              await deleteAsset(VAULT_BUCKET, s.storage_path);
            }
          }
        }
      }

      // 2. Delete database row (cascades to product_media, product_finishes, product_sequences_360)
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      return { success: false, error: msg };
    }
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
            const targetBucket = m.type === 'image' ? 'product-images' : m.type === 'glb_model' ? 'product-models' : m.type === 'video' ? 'showroom-videos' : '360-sequences';
            const exists = m.storage_path && m.storage_path.startsWith('published/') && await assetExists(targetBucket, m.storage_path);
            if (!exists) {
              const vaultSource = (m.metadata as any)?.draft_vault_path || m.storage_path;
              if (vaultSource) {
                const uploadType = m.type === 'glb_model' ? 'model' : m.type === 'video' ? 'video' : m.type === 'sequence_frame' ? 'sequence' : 'image';
                const res = await promoteDraftToPublic(vaultSource, uploadType);
                if (res.success && res.publicUrl) {
                  await supabase.from('product_media').update({
                    public_url: res.publicUrl,
                    storage_path: res.publicPath,
                    metadata: {
                      ...((m.metadata as Record<string, unknown>) || {}),
                      draft_vault_path: res.vaultPath || vaultSource
                    }
                  }).eq('id', m.id);
                  if (m.type === 'image' && !promotedPrimaryUrl) {
                    promotedPrimaryUrl = res.publicUrl;
                  }
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

        const { data: sequences, error: seqErr } = await supabase.from('product_sequences_360').select('*').eq('product_id', id);
        if (seqErr) return { success: false, error: seqErr.message };

        if (sequences) {
          for (const s of sequences) {
            const exists = s.storage_path && s.storage_path.startsWith('published/') && await assetExists('360-sequences', s.storage_path);
            if (!exists && s.storage_path) {
              const res = await promoteDraftToPublic(s.storage_path, 'sequence');
              if (res.success && res.publicUrl) {
                await supabase.from('product_sequences_360').update({
                  public_url: res.publicUrl,
                  storage_path: res.publicPath
                }).eq('id', s.id);
              } else {
                return {
                  success: false,
                  error: `Failed to promote 360 sequence frame "${s.storage_path}": ${res.error || 'Unknown error'}. Product remains in draft status.`
                };
              }
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
              const b = m.type === 'image' ? 'product-images' : m.type === 'glb_model' ? 'product-models' : m.type === 'video' ? 'showroom-videos' : '360-sequences';
              await revokePublicAsset(b, m.storage_path);
              const draftVaultPath = (m.metadata as any)?.draft_vault_path || `drafts/${m.type === 'image' ? 'images' : m.type === 'glb_model' ? 'models' : m.type === 'video' ? 'videos' : 'sequences'}/${m.storage_path.split('/').pop()}`;
              await supabase.from('product_media').update({
                storage_path: draftVaultPath
              }).eq('id', m.id);
            }
          }
        }

        const { data: sequences } = await supabase.from('product_sequences_360').select('*').eq('product_id', id);
        if (sequences) {
          for (const s of sequences) {
            if (s.storage_path && s.storage_path.startsWith('published/')) {
              await revokePublicAsset('360-sequences', s.storage_path);
              const draftVaultPath = `drafts/sequences/${s.storage_path.split('/').pop()}`;
              await supabase.from('product_sequences_360').update({
                storage_path: draftVaultPath
              }).eq('id', s.id);
            }
          }
        }

        const { error } = await supabase
          .from('products')
          .update({ status: 'draft', updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Toggle publish failed';
      return { success: false, error: msg };
    }
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
