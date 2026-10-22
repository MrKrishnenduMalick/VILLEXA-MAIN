import { supabase, isSupabaseConfigured, checkIsAdmin } from './supabaseClient';
import {
  parseStorageBucketAndPath,
  normalizeStoragePath,
  isForbiddenStorageTarget
} from './adminService';

export const AUDIT_BUCKETS = [
  'product-images',
  'product-models',
  'showroom-videos',
  '360-sequences',
  'atelier-vault'
] as const;

export type AuditBucketName = typeof AUDIT_BUCKETS[number];

export type StorageItemClassification = 'REFERENCED_KEEP' | 'UNREFERENCED_CANDIDATE' | 'NEEDS_REVIEW';

export interface StorageAuditedItem {
  id: string; // Key: `${bucket}:::${path}`
  bucket: string;
  path: string;
  name: string;
  size: number;
  contentType: string;
  updatedAt: string | null;
  classification: StorageItemClassification;
  reason: string;
  matchedReference?: {
    entityType: 'product' | 'product_media' | 'category' | 'collection' | 'sequence_360' | 'site_settings' | 'system_asset';
    identifier: string;
    field: string;
  };
}

export interface BucketAuditStats {
  bucket: string;
  totalObjects: number;
  totalBytes: number;
  keepObjects: number;
  keepBytes: number;
  candidateObjects: number;
  candidateBytes: number;
  reviewObjects: number;
  reviewBytes: number;
  error?: string;
}

export interface StorageAuditReport {
  timestamp: string;
  isComplete: boolean;
  referenceChecks: {
    products: { success: boolean; count: number; error?: string };
    productMedia: { success: boolean; count: number; error?: string };
    sequences: { success: boolean; count: number; error?: string };
    categories: { success: boolean; count: number; error?: string };
    collections: { success: boolean; count: number; error?: string };
    siteSettings: { success: boolean; count: number; error?: string };
  };
  bucketStats: Record<string, BucketAuditStats>;
  totalObjects: number;
  totalBytes: number;
  reclaimableBytes: number;
  items: StorageAuditedItem[];
  missingProtectedAssets: Array<{
    bucket: string;
    path: string;
    referencedBy: string;
    notes: string;
  }>;
}

export interface BatchDeletionItemResult {
  bucket: string;
  path: string;
  success: boolean;
  error?: string;
}

export interface BatchDeletionResult {
  totalRequested: number;
  successCount: number;
  failedCount: number;
  reclaimedBytes: number;
  results: BatchDeletionItemResult[];
}

/**
 * Known system assets that must NEVER be flagged as deletion candidates.
 */
export const KNOWN_PROTECTED_ASSETS = [
  {
    bucket: 'showroom-videos',
    path: 'hero/videos/1792270227821_5nt5cz_villexa-hero.mp4',
    reason: 'Active cinematic hero video referenced by site settings'
  },
  {
    bucket: 'atelier-vault',
    path: 'showroom/videos/videos/1791981350785_9964ft_villexa-hero.mp4',
    reason: 'Showroom atmosphere video referenced by site settings'
  }
];

/**
 * Recursively lists all objects in a Supabase storage bucket, handling pagination.
 */
export async function listBucketObjectsRecursive(
  bucket: string,
  folder = '',
  pageSize = 100
): Promise<{ objects: Array<{ name: string; path: string; metadata?: any; updated_at?: string }>; error?: string }> {
  const allObjects: Array<{ name: string; path: string; metadata?: any; updated_at?: string }> = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit: pageSize,
      offset,
      sortBy: { column: 'name', order: 'asc' }
    });

    if (error) {
      return { objects: allObjects, error: error.message };
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const item of data) {
      const fullPath = folder ? `${folder}/${item.name}` : item.name;
      // In Supabase Storage, directory entries have id === null and metadata === null
      if (item.id === null && !item.metadata) {
        const sub = await listBucketObjectsRecursive(bucket, fullPath, pageSize);
        if (sub.error) {
          return { objects: allObjects, error: sub.error };
        }
        allObjects.push(...sub.objects);
      } else {
        allObjects.push({
          name: item.name,
          path: fullPath,
          metadata: item.metadata,
          updated_at: item.updated_at || undefined
        });
      }
    }

    if (data.length < pageSize) {
      hasMore = false;
    } else {
      offset += pageSize;
    }
  }

  return { objects: allObjects };
}

/**
 * Extracts all storage references from any arbitrary JSON value (e.g. site_settings JSONB).
 */
export function extractReferencesFromJson(
  val: unknown,
  sink: (raw: string) => void
): void {
  if (!val) return;
  if (typeof val === 'string') {
    sink(val);
    return;
  }
  if (Array.isArray(val)) {
    val.forEach(v => extractReferencesFromJson(v, sink));
    return;
  }
  if (typeof val === 'object') {
    Object.values(val as Record<string, unknown>).forEach(v => extractReferencesFromJson(v, sink));
  }
}

export const storageAuditService = {
  /**
   * Performs an authoritative, read-only audit of all storage buckets vs database references.
   * Never mutates or deletes any data.
   */
  async runAudit(): Promise<StorageAuditReport> {
    const timestamp = new Date().toISOString();

    const report: StorageAuditReport = {
      timestamp,
      isComplete: true,
      referenceChecks: {
        products: { success: false, count: 0 },
        productMedia: { success: false, count: 0 },
        sequences: { success: false, count: 0 },
        categories: { success: false, count: 0 },
        collections: { success: false, count: 0 },
        siteSettings: { success: false, count: 0 }
      },
      bucketStats: {},
      totalObjects: 0,
      totalBytes: 0,
      reclaimableBytes: 0,
      items: [],
      missingProtectedAssets: []
    };

    if (!isSupabaseConfigured) {
      return report;
    }

    // Step 1: Reference Gathering across Database
    // Map key format: `${bucket}:::${normalizedPath}`
    const referenceMap = new Map<string, {
      entityType: 'product' | 'product_media' | 'category' | 'collection' | 'sequence_360' | 'site_settings' | 'system_asset';
      identifier: string;
      field: string;
      description: string;
    }>();

    const addRef = (
      rawUrlOrPath: string | null | undefined,
      hintBucket: string | undefined,
      refData: {
        entityType: 'product' | 'product_media' | 'category' | 'collection' | 'sequence_360' | 'site_settings' | 'system_asset';
        identifier: string;
        field: string;
        description: string;
      }
    ) => {
      const parsed = parseStorageBucketAndPath(rawUrlOrPath, hintBucket);
      if (parsed) {
        const key = `${parsed.bucket}:::${parsed.path}`;
        if (!referenceMap.has(key)) {
          referenceMap.set(key, refData);
        }
      }
    };

    // 1a. Products
    try {
      const { data: prods, error } = await supabase.from('products').select('id, name, sku, primary_image_url');
      if (error) {
        report.referenceChecks.products = { success: false, count: 0, error: error.message };
        report.isComplete = false;
      } else {
        report.referenceChecks.products = { success: true, count: prods?.length || 0 };
        (prods || []).forEach(p => {
          if (p.primary_image_url) {
            addRef(p.primary_image_url, 'product-images', {
              entityType: 'product',
              identifier: p.sku || p.id,
              field: 'primary_image_url',
              description: `Primary image of product "${p.name}" (${p.sku})`
            });
          }
        });
      }
    } catch (err) {
      report.referenceChecks.products = { success: false, count: 0, error: err instanceof Error ? err.message : String(err) };
      report.isComplete = false;
    }

    // 1b. Product Media
    try {
      const { data: media, error } = await supabase.from('product_media').select('id, product_id, type, storage_path, public_url, thumbnail_url, metadata');
      if (error) {
        report.referenceChecks.productMedia = { success: false, count: 0, error: error.message };
        report.isComplete = false;
      } else {
        report.referenceChecks.productMedia = { success: true, count: media?.length || 0 };
        (media || []).forEach(m => {
          const hint = m.type === 'video' ? 'showroom-videos' : m.type === 'glb_model' ? 'product-models' : 'product-images';
          if (m.storage_path) {
            addRef(m.storage_path, hint, {
              entityType: 'product_media',
              identifier: m.product_id,
              field: 'storage_path',
              description: `Gallery ${m.type} storage path for product ${m.product_id}`
            });
          }
          if (m.public_url) {
            addRef(m.public_url, hint, {
              entityType: 'product_media',
              identifier: m.product_id,
              field: 'public_url',
              description: `Gallery ${m.type} public URL for product ${m.product_id}`
            });
          }
          if (m.thumbnail_url) {
            addRef(m.thumbnail_url, 'product-images', {
              entityType: 'product_media',
              identifier: m.product_id,
              field: 'thumbnail_url',
              description: `Video thumbnail poster for product ${m.product_id}`
            });
          }
          if (m.metadata && typeof m.metadata === 'object') {
            extractReferencesFromJson(m.metadata, (str) => {
              addRef(str, undefined, {
                entityType: 'product_media',
                identifier: m.product_id,
                field: 'metadata',
                description: `Staged metadata asset reference for product ${m.product_id}`
              });
            });
          }
        });
      }
    } catch (err) {
      report.referenceChecks.productMedia = { success: false, count: 0, error: err instanceof Error ? err.message : String(err) };
      report.isComplete = false;
    }

    // 1c. 360 Sequences
    try {
      const { data: seqs, error } = await supabase.from('product_sequences_360').select('id, product_id, storage_path, public_url');
      if (error) {
        report.referenceChecks.sequences = { success: false, count: 0, error: error.message };
        report.isComplete = false;
      } else {
        report.referenceChecks.sequences = { success: true, count: seqs?.length || 0 };
        (seqs || []).forEach(s => {
          if (s.storage_path) {
            addRef(s.storage_path, '360-sequences', {
              entityType: 'sequence_360',
              identifier: s.product_id,
              field: 'storage_path',
              description: `360 turntable frame for product ${s.product_id}`
            });
          }
          if (s.public_url) {
            addRef(s.public_url, '360-sequences', {
              entityType: 'sequence_360',
              identifier: s.product_id,
              field: 'public_url',
              description: `360 frame public URL for product ${s.product_id}`
            });
          }
        });
      }
    } catch (err) {
      report.referenceChecks.sequences = { success: false, count: 0, error: err instanceof Error ? err.message : String(err) };
      report.isComplete = false;
    }

    // 1d. Categories
    try {
      const { data: cats, error } = await supabase.from('categories').select('id, name, slug, cover_image_url');
      if (error) {
        report.referenceChecks.categories = { success: false, count: 0, error: error.message };
        report.isComplete = false;
      } else {
        report.referenceChecks.categories = { success: true, count: cats?.length || 0 };
        (cats || []).forEach(c => {
          if (c.cover_image_url) {
            addRef(c.cover_image_url, 'product-images', {
              entityType: 'category',
              identifier: c.slug || c.id,
              field: 'cover_image_url',
              description: `Taxonomy cover banner for category "${c.name}"`
            });
          }
        });
      }
    } catch (err) {
      report.referenceChecks.categories = { success: false, count: 0, error: err instanceof Error ? err.message : String(err) };
      report.isComplete = false;
    }

    // 1e. Collections
    try {
      const { data: cols, error } = await supabase.from('collections').select('id, name, slug, cover_image_url, video_url, video_poster_url');
      if (error) {
        report.referenceChecks.collections = { success: false, count: 0, error: error.message };
        report.isComplete = false;
      } else {
        report.referenceChecks.collections = { success: true, count: cols?.length || 0 };
        (cols || []).forEach(col => {
          if (col.cover_image_url) {
            addRef(col.cover_image_url, 'product-images', {
              entityType: 'collection',
              identifier: col.slug || col.id,
              field: 'cover_image_url',
              description: `Cover image for collection "${col.name}"`
            });
          }
          if (col.video_url) {
            addRef(col.video_url, 'showroom-videos', {
              entityType: 'collection',
              identifier: col.slug || col.id,
              field: 'video_url',
              description: `Curated showcase video for collection "${col.name}"`
            });
          }
          if (col.video_poster_url) {
            addRef(col.video_poster_url, 'product-images', {
              entityType: 'collection',
              identifier: col.slug || col.id,
              field: 'video_poster_url',
              description: `Video poster thumbnail for collection "${col.name}"`
            });
          }
        });
      }
    } catch (err) {
      report.referenceChecks.collections = { success: false, count: 0, error: err instanceof Error ? err.message : String(err) };
      report.isComplete = false;
    }

    // 1f. Site Settings
    try {
      const { data: settings, error } = await supabase.from('site_settings').select('key, value');
      if (error) {
        report.referenceChecks.siteSettings = { success: false, count: 0, error: error.message };
        report.isComplete = false;
      } else {
        report.referenceChecks.siteSettings = { success: true, count: settings?.length || 0 };
        (settings || []).forEach(s => {
          extractReferencesFromJson(s.value, (str) => {
            addRef(str, undefined, {
              entityType: 'site_settings',
              identifier: s.key,
              field: 'value',
              description: `Site setting configuration asset (${s.key})`
            });
          });
        });
      }
    } catch (err) {
      report.referenceChecks.siteSettings = { success: false, count: 0, error: err instanceof Error ? err.message : String(err) };
      report.isComplete = false;
    }

    // 1g. Protect Hardcoded Known Assets
    KNOWN_PROTECTED_ASSETS.forEach(k => {
      const key = `${k.bucket}:::${normalizeStoragePath(k.path)}`;
      if (!referenceMap.has(key)) {
        referenceMap.set(key, {
          entityType: 'system_asset',
          identifier: k.path,
          field: 'protected_path',
          description: k.reason
        });
      }
    });

    // Step 2: Bucket Scans & Object Inventory
    const auditedItems: StorageAuditedItem[] = [];
    const discoveredKeys = new Set<string>();

    for (const bucket of AUDIT_BUCKETS) {
      const stats: BucketAuditStats = {
        bucket,
        totalObjects: 0,
        totalBytes: 0,
        keepObjects: 0,
        keepBytes: 0,
        candidateObjects: 0,
        candidateBytes: 0,
        reviewObjects: 0,
        reviewBytes: 0
      };

      const listResult = await listBucketObjectsRecursive(bucket);

      if (listResult.error) {
        stats.error = listResult.error;
        report.isComplete = false;
        report.bucketStats[bucket] = stats;
        continue;
      }

      for (const obj of listResult.objects) {
        const normPath = normalizeStoragePath(obj.path);
        const itemKey = `${bucket}:::${normPath}`;
        discoveredKeys.add(itemKey);

        const size = Number(obj.metadata?.size || obj.metadata?.contentLength || 0);
        const contentType = String(obj.metadata?.mimetype || obj.metadata?.contentType || 'application/octet-stream');
        const updatedAt = obj.updated_at || obj.metadata?.lastModified || null;

        stats.totalObjects += 1;
        stats.totalBytes += size;

        // Classification Logic
        let classification: StorageItemClassification;
        let reason: string;
        let matchedReference: StorageAuditedItem['matchedReference'];

        const ref = referenceMap.get(itemKey);

        if (ref) {
          classification = 'REFERENCED_KEEP';
          reason = ref.description;
          matchedReference = {
            entityType: ref.entityType,
            identifier: ref.identifier,
            field: ref.field
          };
          stats.keepObjects += 1;
          stats.keepBytes += size;
        } else if (isForbiddenStorageTarget(normPath)) {
          classification = 'NEEDS_REVIEW';
          reason = 'Protected system root folder or reserved staging structure.';
          stats.reviewObjects += 1;
          stats.reviewBytes += size;
        } else if (!report.isComplete) {
          // If any reference check or bucket scan failed, conservatively mark as Needs Review
          classification = 'NEEDS_REVIEW';
          reason = 'Database reference check encountered partial failure; flagged safely for manual review.';
          stats.reviewObjects += 1;
          stats.reviewBytes += size;
        } else {
          // Genuinely unreferenced candidate
          classification = 'UNREFERENCED_CANDIDATE';
          reason = 'No active database or configuration references point to this object.';
          stats.candidateObjects += 1;
          stats.candidateBytes += size;
        }

        auditedItems.push({
          id: itemKey,
          bucket,
          path: normPath,
          name: obj.name,
          size,
          contentType,
          updatedAt,
          classification,
          reason,
          matchedReference
        });
      }

      report.bucketStats[bucket] = stats;
    }

    // Step 3: Check for missing protected assets that are referenced but not found in storage
    referenceMap.forEach((ref, key) => {
      if (!discoveredKeys.has(key)) {
        const [bucket, path] = key.split(':::');
        report.missingProtectedAssets.push({
          bucket,
          path,
          referencedBy: `${ref.entityType} (${ref.identifier}.${ref.field})`,
          notes: ref.description
        });
      }
    });

    // Step 4: Aggregate Global Metrics
    report.items = auditedItems;
    report.totalObjects = auditedItems.length;
    report.totalBytes = auditedItems.reduce((acc, it) => acc + it.size, 0);
    report.reclaimableBytes = auditedItems
      .filter(it => it.classification === 'UNREFERENCED_CANDIDATE')
      .reduce((acc, it) => acc + it.size, 0);

    return report;
  },

  /**
   * Executes safe, manual deletion of selected candidate storage objects in small batches.
   * Strictly enforces that only UNREFERENCED_CANDIDATE items can be deleted.
   * Referenced or Needs Review items are strictly protected and rejected.
   */
  async deleteSelectedCandidates(
    candidatesToDelete: Array<{ bucket: string; path: string; size?: number }>
  ): Promise<BatchDeletionResult> {
    const isAdmin = await checkIsAdmin();
    if (!isAdmin) {
      throw new Error('Unauthorized: Only authorized administrators can delete storage objects.');
    }

    const results: BatchDeletionItemResult[] = [];
    let successCount = 0;
    let failedCount = 0;
    let reclaimedBytes = 0;

    // Filter out forbidden paths & ensure safe objects
    const safeCandidates = candidatesToDelete.filter(item => {
      const normPath = normalizeStoragePath(item.path);
      if (isForbiddenStorageTarget(normPath)) {
        results.push({
          bucket: item.bucket,
          path: item.path,
          success: false,
          error: 'Protected system path cannot be deleted.'
        });
        failedCount += 1;
        return false;
      }
      return true;
    });

    // Process in small batches of 5 to ensure reliable network execution and fine-grained status
    const batchSize = 5;
    for (let i = 0; i < safeCandidates.length; i += batchSize) {
      const batch = safeCandidates.slice(i, i + batchSize);

      for (const item of batch) {
        try {
          const { error } = await supabase.storage.from(item.bucket).remove([item.path]);
          if (error) {
            results.push({
              bucket: item.bucket,
              path: item.path,
              success: false,
              error: error.message
            });
            failedCount += 1;
          } else {
            results.push({
              bucket: item.bucket,
              path: item.path,
              success: true
            });
            successCount += 1;
            reclaimedBytes += item.size || 0;
          }
        } catch (err) {
          results.push({
            bucket: item.bucket,
            path: item.path,
            success: false,
            error: err instanceof Error ? err.message : 'Unknown storage delete error'
          });
          failedCount += 1;
        }
      }
    }

    return {
      totalRequested: candidatesToDelete.length,
      successCount,
      failedCount,
      reclaimedBytes,
      results
    };
  }
};
