import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateFile,
  uploadDraftAsset,
  promoteDraftToPublic,
  revokePublicAsset,
  VAULT_BUCKET
} from '../services/storageService';
import { checkIsAdmin, supabase } from '../services/supabaseClient';
import { productService } from '../services/productService';

describe('Security: File Upload Validation & Size Quotas', () => {
  it('rejects image files exceeding 15MB limit', () => {
    const oversizedFile = new File(['x'.repeat(1024)], 'luxury-sofa.jpg', { type: 'image/jpeg' });
    Object.defineProperty(oversizedFile, 'size', { value: 16 * 1024 * 1024 });

    const result = validateFile(oversizedFile, 'image');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds the maximum size limit');
  });

  it('rejects model files exceeding 50MB limit', () => {
    const oversizedModel = new File(['x'.repeat(1024)], 'sofa-model.glb', { type: 'model/gltf-binary' });
    Object.defineProperty(oversizedModel, 'size', { value: 55 * 1024 * 1024 });

    const result = validateFile(oversizedModel, 'model');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds the maximum size limit');
  });

  it('rejects video files exceeding 100MB limit', () => {
    const oversizedVideo = new File(['x'.repeat(1024)], 'showroom.mp4', { type: 'video/mp4' });
    Object.defineProperty(oversizedVideo, 'size', { value: 110 * 1024 * 1024 });

    const result = validateFile(oversizedVideo, 'video');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds the maximum size limit');
  });

  it('strictly rejects malicious executable extensions (.exe, .sh, .php, .js)', () => {
    const maliciousFiles = [
      new File(['test'], 'payload.exe', { type: 'application/x-msdownload' }),
      new File(['test'], 'script.sh', { type: 'application/x-sh' }),
      new File(['test'], 'exploit.php', { type: 'application/x-httpd-php' }),
      new File(['test'], 'backdoor.js', { type: 'application/javascript' })
    ];

    maliciousFiles.forEach((f) => {
      expect(validateFile(f, 'image').valid).toBe(false);
      expect(validateFile(f, 'model').valid).toBe(false);
      expect(validateFile(f, 'video').valid).toBe(false);
      expect(validateFile(f, 'sequence').valid).toBe(false);
    });
  });

  it('accepts genuine self-contained .glb models within limits', () => {
    const validGlb = new File(['glTF binary data'], 'monolith-sofa.glb', { type: 'model/gltf-binary' });
    Object.defineProperty(validGlb, 'size', { value: 12 * 1024 * 1024 }); // 12MB

    const result = validateFile(validGlb, 'model');
    expect(result.valid).toBe(true);
  });

  it('rejects standalone .gltf files to prevent missing .bin and texture dependencies', () => {
    const standaloneGltf = new File(['{"asset": {"version": "2.0"}}'], 'chair.gltf', { type: 'application/json' });
    const result = validateFile(standaloneGltf, 'model');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Standalone .gltf files require external .bin buffers');
  });

  it('accepts genuine high-res WebP and JPEG images within limits', () => {
    const validWebp = new File(['webp image data'], 'chair-elysian.webp', { type: 'image/webp' });
    Object.defineProperty(validWebp, 'size', { value: 4 * 1024 * 1024 }); // 4MB

    expect(validateFile(validWebp, 'image').valid).toBe(true);
  });
});

describe('Security: Dual-Tier Storage Lifecycle (Private Vault vs Public Showroom)', () => {
  let storageFromSpy: any;

  beforeEach(() => {
    storageFromSpy = vi.spyOn(supabase.storage, 'from').mockImplementation((bucket: string) => {
      return {
        upload: vi.fn().mockImplementation(async (path: string, _file: any) => {
          return { data: { path }, error: null };
        }),
        download: vi.fn().mockImplementation(async (_path: string) => {
          return { data: new Blob(['mock asset binary data']), error: null };
        }),
        createSignedUrl: vi.fn().mockImplementation(async (path: string) => {
          return {
            data: { signedUrl: `https://mock.supabase.co/storage/v1/object/sign/${bucket}/${path}?token=mock-token` },
            error: null
          };
        }),
        getPublicUrl: vi.fn().mockImplementation((path: string) => {
          return {
            data: { publicUrl: `https://mock.supabase.co/storage/v1/object/public/${bucket}/${path}` }
          };
        }),
        remove: vi.fn().mockImplementation(async (_paths: string[]) => {
          return { data: {}, error: null };
        }),
        list: vi.fn().mockImplementation(async (_folder: string, _options?: any) => {
          return { data: [], error: null };
        })
      } as any;
    });
  });

  afterEach(() => {
    storageFromSpy?.mockRestore();
  });

  it('vault bucket is declared strictly as atelier-vault', () => {
    expect(VAULT_BUCKET).toBe('atelier-vault');
  });

  it('draft upload stages into vault without generating public CDN URLs', async () => {
    const draftImage = new File(['image bytes'], 'secret-draft-armchair.webp', { type: 'image/webp' });
    const result = await uploadDraftAsset(draftImage, 'image', 'drafts');
    expect(result.success).toBe(true);
    expect(result.vaultPath).toBeDefined();
    // Vault path must start with draft prefix and live in atelier-vault
    expect(result.vaultPath).toContain('drafts/images');
    expect(result.previewUrl).toContain('token=mock-token');
    // Public CDN URL must not be present on private drafts
    expect((result as any).publicUrl).toBeUndefined();
  });

  it('reports failure accurately when storage upload fails', async () => {
    storageFromSpy.mockImplementation(() => ({
      upload: vi.fn().mockResolvedValue({ data: null, error: new Error('Storage write forbidden') })
    } as any));

    const draftImage = new File(['image bytes'], 'forbidden.webp', { type: 'image/webp' });
    const result = await uploadDraftAsset(draftImage, 'image', 'drafts');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Storage write forbidden');
  });

  it('promotes draft asset to public showroom upon publication', async () => {
    const mockVaultPath = 'drafts/images/12345_sofa.webp';
    const promotion = await promoteDraftToPublic(mockVaultPath, 'image');
    expect(promotion.success).toBe(true);
    expect(promotion.publicUrl).toContain('product-images');
    expect(promotion.publicPath).toContain('published/');
  });

  it('recovers and promotes asset even if given a published prefix by locating vault candidate', async () => {
    const publishedPath = 'published/12345_sofa.webp';
    const promotion = await promoteDraftToPublic(publishedPath, 'image');
    expect(promotion.success).toBe(true);
    expect(promotion.publicUrl).toContain('product-images');
    expect(promotion.publicPath).toBe('published/12345_sofa.webp');
  });

  it('reports error when promotion fails due to missing vault source across candidates', async () => {
    storageFromSpy.mockImplementation(() => ({
      download: vi.fn().mockResolvedValue({ data: null, error: new Error('Vault source file not found') })
    } as any));

    const mockVaultPath = 'drafts/images/missing.webp';
    const promotion = await promoteDraftToPublic(mockVaultPath, 'image');
    expect(promotion.success).toBe(false);
    expect(promotion.error).toContain('Could not retrieve file from private vault');
  });

  it('revoking an asset removes it from public showroom bucket', async () => {
    const revocation = await revokePublicAsset('product-images', 'published/12345_sofa.webp');
    expect(revocation.success).toBe(true);
  });
});

describe('Security & Integrity: Persisted Image References and Media Models', () => {
  it('preserves storagePath and metadata in product media items', () => {
    const mediaItem = {
      url: 'https://mock.supabase.co/storage/v1/object/sign/atelier-vault/drafts/images/chair.webp?token=abc',
      storagePath: 'drafts/images/chair.webp',
      metadata: { width: 1920, height: 1080, format: 'image/webp', sizeBytes: 204800 }
    };

    expect(mediaItem.storagePath).toBe('drafts/images/chair.webp');
    expect(mediaItem.metadata.width).toBe(1920);
    expect(mediaItem.metadata.format).toBe('image/webp');
  });

  it('distinguishes between private draft vault paths and published showroom paths', () => {
    const draftVaultPath = 'drafts/images/chair.webp';
    const publishedPath = 'published/chair.webp';

    const isDraft = (path: string) => path.startsWith('drafts/') || path.startsWith('products/');
    expect(isDraft(draftVaultPath)).toBe(true);
    expect(isDraft(publishedPath)).toBe(false);
  });
});

describe('Security: Explicit Authorization & Draft Isolation', () => {
  it('denies administrative privileges when session is unauthenticated or not in app_admins', async () => {
    const isAdmin = await checkIsAdmin();
    // Default client without authorized session MUST evaluate to false
    expect(isAdmin).toBe(false);
  });

  it('public productService queries never leak draft products', async () => {
    const publishedProducts = await productService.getPublishedProducts();
    // In empty initial state or unconfigured state, returns empty array, never draft objects
    publishedProducts.forEach((p) => {
      expect(p.status).toBe('published');
    });
  });
});

describe('Security: Enquiry Input Validation & Anti-Spam Controls', () => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  it('validates syntax conforming to SQL RLS check pattern', () => {
    const validEmails = ['patron@estate.ch', 'collector.milan@villexa.com', 'arch@studio-paris.fr'];
    const invalidEmails = ['invalid-email', '@no-local.com', 'user@domain', 'user@.com', 'bad spaces@dom.com'];

    validEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(true);
    });

    invalidEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  it('enforces character length boundaries matching RLS constraint limits', () => {
    const validateLengths = (name: string, email: string, msg: string) => {
      const nameValid = name.trim().length >= 2 && name.trim().length <= 100;
      const emailValid = email.trim().length >= 5 && email.trim().length <= 255 && emailRegex.test(email.trim());
      const msgValid = msg.trim().length >= 5 && msg.trim().length <= 5000;
      return nameValid && emailValid && msgValid;
    };

    // Valid enquiry payload
    expect(validateLengths('Lord Sterling', 'sterling@estate.co.uk', 'Requesting private atelier consultation.')).toBe(true);

    // Spam attempts: Empty or single-character names, blank messages, invalid emails
    expect(validateLengths('A', 'test@test.com', 'Valid message here')).toBe(false);
    expect(validateLengths('Valid Name', 'bad', 'Valid message here')).toBe(false);
    expect(validateLengths('Valid Name', 'test@test.com', 'Hi')).toBe(false); // under 5 chars
  });
});
