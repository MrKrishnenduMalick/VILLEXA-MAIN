import { supabase } from './supabaseClient';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const VAULT_BUCKET = 'atelier-vault';

// Strictly allowed extensions, MIME types, and destination public buckets
export const UPLOAD_LIMITS = {
  image: {
    maxBytes: 15 * 1024 * 1024, // 15MB
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
    bucket: 'product-images'
  },
  model: {
    maxBytes: 50 * 1024 * 1024, // 50MB
    allowedExtensions: ['.glb'],
    allowedMimes: ['model/gltf-binary', 'application/octet-stream'],
    bucket: 'product-models'
  },
  video: {
    maxBytes: 100 * 1024 * 1024, // 100MB
    allowedExtensions: ['.mp4', '.webm'],
    allowedMimes: ['video/mp4', 'video/webm'],
    bucket: 'showroom-videos'
  },
  sequence: {
    maxBytes: 10 * 1024 * 1024, // 10MB per frame
    allowedExtensions: ['.jpg', '.jpeg', '.webp'],
    allowedMimes: ['image/jpeg', 'image/webp'],
    bucket: '360-sequences'
  }
};

/**
 * Validates a file before upload against strict quotas, MIME signatures, and extensions.
 */
export function validateFile(
  file: File,
  type: 'image' | 'model' | 'video' | 'sequence'
): FileValidationResult {
  const rules = UPLOAD_LIMITS[type];
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();

  if (file.size > rules.maxBytes) {
    const maxMb = Math.round(rules.maxBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File "${file.name}" exceeds the maximum size limit of ${maxMb}MB.`
    };
  }

  if (type === 'model' && extension === '.gltf') {
    return {
      valid: false,
      error: 'Standalone .gltf files require external .bin buffers and textures that cannot be served as a single file. Please upload a self-contained .glb (binary glTF) file.'
    };
  }

  if (!rules.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension "${extension}" is not allowed. Supported: ${rules.allowedExtensions.join(', ')}`
    };
  }

  // Cross-check browser MIME type if present
  if (file.type && !rules.allowedMimes.includes(file.type) && file.type !== 'application/octet-stream') {
    return {
      valid: false,
      error: `Detected file type "${file.type}" does not match permitted formats for ${type}.`
    };
  }

  return { valid: true };
}

export interface AssetMetadata {
  [key: string]: unknown;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface UploadDraftAssetResult {
  success: boolean;
  vaultPath?: string;
  previewUrl?: string;
  metadata?: AssetMetadata;
  error?: string;
}

/**
 * Uploads an asset directly to the private atelier-vault (public = false).
 * Generates a short-lived signed URL (3600s) for administrative preview.
 * This guarantees draft assets NEVER land in a publicly readable bucket.
 */
export async function uploadDraftAsset(
  file: File,
  type: 'image' | 'model' | 'video' | 'sequence',
  prefix = 'drafts'
): Promise<UploadDraftAssetResult> {
  const metadata: AssetMetadata = {
    originalName: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    uploadedAt: new Date().toISOString()
  };

  const validation = validateFile(file, type);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueKey = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const folder = type === 'image' ? 'images' : type === 'model' ? 'models' : type === 'video' ? 'videos' : 'sequences';
  const vaultPath = `${prefix}/${folder}/${uniqueKey}_${cleanFileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from(VAULT_BUCKET)
      .upload(vaultPath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Generate short-lived signed preview URL (1 hour) for the authorized administrator
    const { data: signedData, error: signError } = await supabase.storage
      .from(VAULT_BUCKET)
      .createSignedUrl(vaultPath, 3600);

    if (signError || !signedData?.signedUrl) {
      return { success: false, error: signError?.message || 'Failed to generate signed preview token' };
    }

    return {
      success: true,
      vaultPath,
      previewUrl: signedData.signedUrl,
      metadata
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Draft upload failed';
    return { success: false, error: msg };
  }
}

/**
 * Creates a signed preview URL for an existing asset in the private vault.
 */
export async function createSignedPreviewUrl(
  vaultPath: string,
  expiresInSeconds = 3600
): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(VAULT_BUCKET)
      .createSignedUrl(vaultPath, expiresInSeconds);

    if (error || !data?.signedUrl) {
      return { success: false, error: error?.message || 'Failed to sign vault URL' };
    }

    return { success: true, previewUrl: data.signedUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Signing failed';
    return { success: false, error: msg };
  }
}

/**
 * Checks whether an asset physically exists in a storage bucket.
 */
export async function assetExists(bucket: string, path: string): Promise<boolean> {
  try {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const folder = cleanPath.includes('/') ? cleanPath.substring(0, cleanPath.lastIndexOf('/')) : '';
    const name = cleanPath.includes('/') ? cleanPath.substring(cleanPath.lastIndexOf('/') + 1) : cleanPath;
    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      search: name,
      limit: 10
    });
    if (error || !data) return false;
    return data.some((item) => item.name === name);
  } catch {
    return false;
  }
}

/**
 * Promotes an asset from the private atelier-vault to a published showroom bucket.
 * This is called ONLY when a product is explicitly published.
 * Returns the permanent public CDN URL for published visitors.
 */
export async function promoteDraftToPublic(
  vaultPath: string,
  type: 'image' | 'model' | 'video' | 'sequence'
): Promise<{ success: boolean; publicUrl?: string; publicPath?: string; vaultPath?: string; error?: string }> {
  const rules = UPLOAD_LIMITS[type];
  const fileName = vaultPath.split('/').pop() || `${Date.now()}_asset`;
  const publicPath = `published/${fileName}`;
  const folder = type === 'image' ? 'images' : type === 'model' ? 'models' : type === 'video' ? 'videos' : 'sequences';

  try {
    // 1. Resolve and download binary data from private vault
    // Build candidate paths in atelier-vault to locate the staged asset
    const candidatePaths: string[] = [];
    if (!vaultPath.startsWith('published/') && !vaultPath.startsWith('http')) {
      candidatePaths.push(vaultPath);
    }
    candidatePaths.push(`drafts/${folder}/${fileName}`);
    candidatePaths.push(`products/${folder}/${fileName}`);
    candidatePaths.push(`products/images/image/${fileName}`);
    candidatePaths.push(`${folder}/${fileName}`);
    candidatePaths.push(fileName);
    if (vaultPath.startsWith('published/')) {
      candidatePaths.push(vaultPath);
    }

    let blob: Blob | null = null;
    let actualVaultPath = vaultPath;
    let lastDownloadError: string | undefined;

    for (const testPath of Array.from(new Set(candidatePaths))) {
      const { data, error } = await supabase.storage
        .from(VAULT_BUCKET)
        .download(testPath);
      if (!error && data) {
        blob = data;
        actualVaultPath = testPath;
        break;
      }
      if (error) {
        lastDownloadError = error.message;
      }
    }

    if (!blob) {
      return {
        success: false,
        error: `Could not retrieve file from private vault (${VAULT_BUCKET}): ${lastDownloadError || 'File not found in vault'}`
      };
    }

    // Determine strict MIME content-type matching showroom bucket allowed_mime_types
    const ext = ('.' + fileName.split('.').pop()?.toLowerCase());
    let contentType = blob.type;
    if (!contentType || contentType === 'application/octet-stream') {
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.glb') contentType = 'model/gltf-binary';
      else if (ext === '.mp4') contentType = 'video/mp4';
      else if (ext === '.webm') contentType = 'video/webm';
    }

    // 2. Upload to public showroom bucket with explicit content type
    const { error: uploadError } = await supabase.storage
      .from(rules.bucket)
      .upload(publicPath, blob, {
        cacheControl: '3600',
        contentType,
        upsert: true
      });

    if (uploadError) {
      return { success: false, error: `Upload to showroom bucket "${rules.bucket}" failed: ${uploadError.message}` };
    }

    // 3. Obtain permanent CDN public URL
    const { data: { publicUrl } } = supabase.storage
      .from(rules.bucket)
      .getPublicUrl(publicPath);

    if (!publicUrl) {
      return { success: false, error: `Failed to generate public URL for ${publicPath} in ${rules.bucket}` };
    }

    return {
      success: true,
      publicUrl,
      publicPath,
      vaultPath: actualVaultPath
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Promotion failed';
    return { success: false, error: msg };
  }
}

/**
 * Revokes an asset from the public showroom bucket.
 * Called when a product is unpublished (moved back to draft) or deleted.
 * Once removed, direct public CDN requests immediately return 404.
 */
export async function revokePublicAsset(
  bucket: string,
  publicPath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([publicPath]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Revocation failed';
    return { success: false, error: msg };
  }
}

/**
 * Backwards-compatible general uploadAsset utility
 */
export async function uploadAsset(
  file: File,
  type: 'image' | 'model' | 'video' | 'sequence',
  prefix = 'drafts'
): Promise<{ 
  success: boolean; 
  storagePath?: string; 
  publicUrl?: string; 
  previewUrl?: string;
  metadata?: AssetMetadata;
  error?: string;
}> {
  const result = await uploadDraftAsset(file, type, prefix);
  if (!result.success) return { success: false, error: result.error };
  return {
    success: true,
    storagePath: result.vaultPath,
    publicUrl: result.previewUrl,
    previewUrl: result.previewUrl,
    metadata: result.metadata
  };
}

/**
 * Uploads an asset directly to a public showroom bucket (e.g. showroom-videos or product-images)
 * and returns the permanent public CDN URL.
 * Used for public hero videos, showroom media, and video posters.
 */
export async function uploadPublicAsset(
  file: File,
  type: 'image' | 'video',
  prefix = 'hero'
): Promise<{
  success: boolean;
  storagePath?: string;
  publicUrl?: string;
  error?: string;
}> {
  const validation = validateFile(file, type);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const rules = UPLOAD_LIMITS[type];
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueKey = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const publicPath = `${prefix}/${uniqueKey}_${cleanFileName}`;

  const ext = ('.' + cleanFileName.split('.').pop()?.toLowerCase());
  let contentType = file.type;
  if (!contentType || contentType === 'application/octet-stream') {
    if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  }

  try {
    const { error: uploadError } = await supabase.storage
      .from(rules.bucket)
      .upload(publicPath, file, {
        cacheControl: '31536000',
        contentType,
        upsert: true
      });

    if (uploadError) {
      // Fallback: if direct showroom bucket upload fails, try draft-and-promote flow
      const draftRes = await uploadDraftAsset(file, type, prefix);
      if (draftRes.success && draftRes.vaultPath) {
        const promoteRes = await promoteDraftToPublic(draftRes.vaultPath, type);
        if (promoteRes.success && promoteRes.publicUrl) {
          return {
            success: true,
            storagePath: promoteRes.publicPath,
            publicUrl: promoteRes.publicUrl
          };
        }
      }
      return { success: false, error: `Upload to showroom bucket "${rules.bucket}" failed: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(rules.bucket)
      .getPublicUrl(publicPath);

    if (!publicUrl) {
      return { success: false, error: `Failed to generate public URL for ${publicPath} in ${rules.bucket}` };
    }

    return {
      success: true,
      storagePath: publicPath,
      publicUrl
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return { success: false, error: msg };
  }
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteAsset(
  bucket: string,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([storagePath]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Delete failed';
    return { success: false, error: msg };
  }
}
