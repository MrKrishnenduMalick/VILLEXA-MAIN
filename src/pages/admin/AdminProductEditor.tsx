import React, { useEffect, useState, useRef } from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Trash2, 
  Check, 
  Box, 
  RotateCw, 
  Image as ImageIcon,
  AlertCircle,
  Eye,
  Film
} from 'lucide-react';
import { adminService, ProductFormData } from '../../services/adminService';
import { uploadAsset, validateFile } from '../../services/storageService';
import { ProductCategory, ProductViewerMode } from '../../types/product';
import { Collection } from '../../types/collection';
import { ThreeViewerEngine } from '../../services/viewer/threeViewerEngine';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const AdminProductEditor: React.FC = () => {
  const [, params] = useRoute('/admin/products/:id');
  const [, setLocation] = useLocation();
  const isNew = !params?.id || params.id === 'new';
  const productId = params?.id && params.id !== 'new' ? params.id : undefined;

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeTab, setActiveTab] = useState<'details' | 'media' | 'video' | 'viewer3d' | 'viewer360'>('details');
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    sku: '',
    categoryId: '',
    collectionId: '',
    regularPrice: null,
    salePrice: null,
    currency: 'USD',
    showPricePublicly: true,
    isEnquiryOnly: false,
    shortDescription: '',
    fullDescription: '',
    materials: '',
    careInstructions: '',
    dimensions: { width: 0, depth: 0, height: 0, seatHeight: 0, unit: 'cm' },
    primaryImageUrl: null,
    preferredViewer: 'gallery',
    tags: [],
    isFeatured: false,
    sortOrder: 0,
    seoTitle: '',
    seoDescription: '',
    status: 'draft'
  });

  // Media Management State
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; storagePath?: string; metadata?: Record<string, unknown> }>>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Product Video State
  const [productVideoUrl, setProductVideoUrl] = useState<string | null>(null);
  const [productVideoPosterUrl, setProductVideoPosterUrl] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // 3D Model State
  const [glbModelUrl, setGlbModelUrl] = useState<string | null>(null);
  const [isUploadingGlb, setIsUploadingGlb] = useState(false);
  const previewCanvasRef = useRef<HTMLDivElement>(null);
  const viewerEngineRef = useRef<ThreeViewerEngine | null>(null);

  // 360 Sequences State
  const [sequenceFrames, setSequenceFrames] = useState<string[]>([]);
  const [isUploadingSequence, setIsUploadingSequence] = useState(false);
  const [previewFrameIndex360, setPreviewFrameIndex360] = useState(0);

  useEffect(() => {
    async function loadInitial() {
      const [cats, cols] = await Promise.all([
        adminService.getCategories(),
        adminService.getCollections()
      ]);
      setCategories(cats);
      setCollections(cols);

      if (productId) {
        const allProducts = await adminService.getAllProducts();
        const found = allProducts.find((p) => p.id === productId);
        if (found) {
          setFormData({
            id: found.id,
            name: found.name,
            slug: found.slug,
            sku: found.sku,
            categoryId: found.categoryId,
            collectionId: found.collectionId,
            regularPrice: found.regularPrice,
            salePrice: found.salePrice || null,
            currency: found.currency,
            showPricePublicly: found.showPricePublicly,
            isEnquiryOnly: found.isEnquiryOnly,
            shortDescription: found.shortDescription,
            fullDescription: found.fullDescription,
            materials: found.materials,
            careInstructions: found.careInstructions || '',
            dimensions: found.dimensions || { width: 0, depth: 0, height: 0, seatHeight: 0, unit: 'cm' },
            primaryImageUrl: found.primaryImageUrl,
            preferredViewer: found.preferredViewer,
            tags: found.tags,
            isFeatured: found.isFeatured,
            sortOrder: found.sortOrder,
            seoTitle: found.seoTitle || '',
            seoDescription: found.seoDescription || '',
            status: found.status
          });
          if (found.galleryMedia && found.galleryMedia.length > 0) {
            setUploadedImages(found.galleryMedia.map((m) => ({ url: m.url, storagePath: m.storagePath, metadata: m.metadata })));
          } else {
            setUploadedImages(found.galleryImages.map((url) => ({ url })));
          }

          // Initialize 3D model if present
          if (found.glbConfig?.modelUrl) {
            setGlbModelUrl(found.glbConfig.modelUrl);
            setTimeout(() => mount3DPreview(found.glbConfig!.modelUrl), 150);
          }

          // Initialize 360 frames if present
          if (found.sequence360Config?.frameUrls) {
            setSequenceFrames(found.sequence360Config.frameUrls);
          }

          // Initialize video if present
          if (found.videoUrl) {
            setProductVideoUrl(found.videoUrl);
            setProductVideoPosterUrl(found.videoPosterUrl || null);
          }
        }
      }
    }
    loadInitial();
  }, [productId]);

  // Auto-generate slug from name if new
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: isNew ? slug : prev.slug
    }));
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setFeedbackMsg(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadAsset(file, 'image', 'drafts');
        if (res.success && res.publicUrl) {
          setUploadedImages((prev) => [
            ...prev,
            {
              url: res.publicUrl!,
              storagePath: res.storagePath,
              metadata: res.metadata
            }
          ]);
          // Auto-set as primary image if none exists
          setFormData((prev) => ({
            ...prev,
            primaryImageUrl: prev.primaryImageUrl || res.publicUrl!
          }));
        } else {
          setFeedbackMsg({ type: 'error', text: res.error || `Failed to upload "${file.name}"` });
          break;
        }
      }
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  // Reorder gallery photographs
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= uploadedImages.length) return;
    const reordered = [...uploadedImages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    setUploadedImages(reordered);
  };

  // Product Video Upload Handler
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedbackMsg(null);
    const valid = validateFile(file, 'video');
    if (!valid.valid) {
      setFeedbackMsg({ type: 'error', text: valid.error || 'Invalid video file (must be MP4 or WebM under 100MB)' });
      return;
    }

    setIsUploadingVideo(true);
    try {
      const res = await uploadAsset(file, 'video', 'drafts');
      if (res.success && res.publicUrl) {
        setProductVideoUrl(res.publicUrl);
        setFeedbackMsg({ type: 'success', text: 'Product showcase video uploaded successfully!' });
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to upload video' });
      }
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  const handleVideoPosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedbackMsg(null);
    const valid = validateFile(file, 'image');
    if (!valid.valid) {
      setFeedbackMsg({ type: 'error', text: valid.error || 'Invalid poster image file' });
      return;
    }

    setIsUploadingVideo(true);
    try {
      const res = await uploadAsset(file, 'image', 'drafts');
      if (res.success && res.publicUrl) {
        setProductVideoPosterUrl(res.publicUrl);
        setFeedbackMsg({ type: 'success', text: 'Video thumbnail poster uploaded!' });
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to upload poster' });
      }
    } finally {
      setIsUploadingVideo(false);
      e.target.value = '';
    }
  };

  // 3D GLB Model Upload Handler
  const handleGlbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingGlb(true);
    setFeedbackMsg(null);

    const validation = validateFile(file, 'model');
    if (!validation.valid) {
      setFeedbackMsg({ type: 'error', text: validation.error || 'Invalid 3D file. Only self-contained .glb binary files are accepted (max 50MB).' });
      setIsUploadingGlb(false);
      return;
    }

    try {
      const res = await uploadAsset(file, 'model', 'drafts');
      if (res.success && res.publicUrl) {
        setGlbModelUrl(res.publicUrl);
        setFormData((prev) => ({ ...prev, preferredViewer: 'glb_3d' }));

        // Mount and test in preview viewer
        mount3DPreview(res.publicUrl);
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to upload GLB model' });
      }
    } finally {
      setIsUploadingGlb(false);
      e.target.value = '';
    }
  };

  const mount3DPreview = (url: string) => {
    if (!previewCanvasRef.current) return;

    // Clean previous viewer
    if (viewerEngineRef.current) {
      viewerEngineRef.current.dispose();
      viewerEngineRef.current = null;
    }

    const engine = new ThreeViewerEngine(previewCanvasRef.current, {
      autoRotate: true,
      autoRotateSpeed: 1.5,
      backgroundColor: 0xf2ede4
    });
    viewerEngineRef.current = engine;

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        engine.frameModel(gltf.scene);
      },
      undefined,
      (err) => {
        console.error('Failed to parse GLB in preview:', err);
        setFeedbackMsg({
          type: 'error',
          text: 'WebGL Warning: The 3D model could not be rendered. Ensure the file is a valid binary .glb with embedded geometry and textures.'
        });
      }
    );
  };

  // 360 Sequences Upload Handler
  const handleSequenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingSequence(true);
    setFeedbackMsg(null);

    try {
      const uploadedUrls: string[] = [];
      // Sort alphabetically by filename (frame_01, frame_02, etc.)
      const sortedFiles = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

      for (const file of sortedFiles) {
        const res = await uploadAsset(file, 'sequence', 'drafts');
        if (res.success && res.publicUrl) {
          uploadedUrls.push(res.publicUrl);
        } else {
          setFeedbackMsg({ type: 'error', text: res.error || `Failed to upload frame "${file.name}"` });
          break;
        }
      }

      setSequenceFrames((prev) => [...prev, ...uploadedUrls]);
      setFormData((prev) => ({ ...prev, preferredViewer: 'sequence_360' }));
    } finally {
      setIsUploadingSequence(false);
      e.target.value = '';
    }
  };

  // Save / Publish
  const handleSave = async (targetStatus?: 'draft' | 'published') => {
    // Validation
    if (!formData.name.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Product name is required.' });
      return;
    }
    if (!formData.slug.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Product slug is required.' });
      return;
    }
    if (!formData.sku.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Internal SKU code is required.' });
      return;
    }

    const finalStatus = targetStatus || formData.status;

    if (finalStatus === 'published' && !formData.primaryImageUrl) {
      setFeedbackMsg({ type: 'error', text: 'A primary product image is required before publishing.' });
      return;
    }

    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const res = await adminService.saveProduct({
        ...formData,
        status: finalStatus,
        galleryImages: uploadedImages,
        glbModel: glbModelUrl ? { url: glbModelUrl } : null,
        sequenceFrames: sequenceFrames.map((url) => ({ url })),
        productVideo: productVideoUrl ? { url: productVideoUrl, posterUrl: productVideoPosterUrl || undefined } : null
      });

      if (res.success) {
        setFeedbackMsg({ type: 'success', text: `Product saved successfully as ${finalStatus}!` });
        setTimeout(() => {
          setLocation('/admin/products');
        }, 800);
      } else {
        setFeedbackMsg({ type: 'error', text: res.error || 'Failed to persist product.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <Link href="/admin/products" style={{ color: 'var(--color-text-secondary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <span className="kicker">{isNew ? 'CREATE CREATION' : 'EDIT CREATION'}</span>
            <h1 style={{ fontSize: '1.75rem', marginTop: '2px' }}>
              {formData.name || (isNew ? 'Untitled Piece' : 'Edit Product')}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {formData.slug && (
            <a
              href={`/product/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Eye size={14} />
              <span>Preview on Site</span>
            </a>
          )}
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="btn btn-secondary"
            style={{ padding: '0.6rem 1.25rem' }}
          >
            <span>Save as Draft</span>
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.25rem' }}
          >
            <Save size={14} />
            <span>Publish to Showroom</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          backgroundColor: feedbackMsg.type === 'success' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(215, 58, 73, 0.1)',
          border: `1px solid ${feedbackMsg.type === 'success' ? '#28a745' : '#b31d28'}`,
          color: feedbackMsg.type === 'success' ? '#28a745' : '#b31d28',
          fontSize: '0.875rem',
          marginBottom: 'var(--space-6)'
        }}>
          {feedbackMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Editor Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        borderBottom: '1px solid var(--color-border-subtle)',
        marginBottom: 'var(--space-8)'
      }}>
        <button
          onClick={() => setActiveTab('details')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: activeTab === 'details' ? 500 : 400,
            color: activeTab === 'details' ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'details' ? '2px solid var(--color-accent-gold)' : '2px solid transparent'
          }}
        >
          General &amp; Pricing
        </button>
        <button
          onClick={() => setActiveTab('media')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: activeTab === 'media' ? 500 : 400,
            color: activeTab === 'media' ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'media' ? '2px solid var(--color-accent-gold)' : '2px solid transparent'
          }}
        >
          Photography ({uploadedImages.length})
        </button>
        <button
          onClick={() => setActiveTab('video')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: activeTab === 'video' ? 500 : 400,
            color: activeTab === 'video' ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'video' ? '2px solid var(--color-accent-gold)' : '2px solid transparent'
          }}
        >
          Showcase Video {productVideoUrl && '✓'}
        </button>
        <button
          onClick={() => setActiveTab('viewer3d')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: activeTab === 'viewer3d' ? 500 : 400,
            color: activeTab === 'viewer3d' ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'viewer3d' ? '2px solid var(--color-accent-gold)' : '2px solid transparent'
          }}
        >
          3D GLB Model {glbModelUrl && '✓'}
        </button>
        <button
          onClick={() => setActiveTab('viewer360')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: activeTab === 'viewer360' ? 500 : 400,
            color: activeTab === 'viewer360' ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)',
            borderBottom: activeTab === 'viewer360' ? '2px solid var(--color-accent-gold)' : '2px solid transparent'
          }}
        >
          360° Sequence ({sequenceFrames.length})
        </button>
      </div>

      {/* TAB 1: DETAILS & PRICING */}
      {activeTab === 'details' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)' }}>
          {/* Column 1: Basic Information */}
          <div className="luxury-card" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-3)' }}>
              Identification &amp; Taxonomy
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Aurelia Monolith Sofa"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  SKU Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="VLX-SF-01"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.85rem' }}
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  Collection
                </label>
                <select
                  value={formData.collectionId}
                  onChange={(e) => setFormData({ ...formData, collectionId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.85rem' }}
                >
                  <option value="">None / Standalone</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Short Editorial Summary
              </label>
              <textarea
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Organic undulating sofa draped in textured Italian wool bouclé with sculpted French walnut plinth base."
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Full Architectural Description
              </label>
              <textarea
                rows={4}
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Column 2: Pricing & Specifications */}
          <div className="luxury-card" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-3)' }}>
              Pricing &amp; Dimensions
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  Regular Price (Numeric)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.regularPrice ?? ''}
                  onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="16400.00"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.85rem' }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CHF">CHF (CHF)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'var(--color-bg-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={formData.showPricePublicly}
                  onChange={(e) => setFormData({ ...formData, showPricePublicly: e.target.checked })}
                />
                <span>Display price publicly on website</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={formData.isEnquiryOnly}
                  onChange={(e) => setFormData({ ...formData, isEnquiryOnly: e.target.checked })}
                />
                <span>Enquiry-Only product (Forces "Price Upon Request")</span>
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Materials Specification *
              </label>
              <textarea
                rows={2}
                value={formData.materials}
                onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                placeholder="Textured Italian Wool Bouclé, Solid French Walnut Plinth, Roman Travertine..."
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.9rem' }}
              />
            </div>

            {/* Architectural Dimensions (Width, Depth, Height, Seat Height, Unit) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Architectural Dimensions
                </label>
                <select
                  value={formData.dimensions?.unit || 'cm'}
                  onChange={(e) => setFormData({
                    ...formData,
                    dimensions: {
                      width: formData.dimensions?.width || 0,
                      depth: formData.dimensions?.depth || 0,
                      height: formData.dimensions?.height || 0,
                      seatHeight: formData.dimensions?.seatHeight || 0,
                      unit: e.target.value as 'cm' | 'in'
                    }
                  })}
                  style={{ padding: '2px 6px', fontSize: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)' }}
                >
                  <option value="cm">Centimeters (cm)</option>
                  <option value="in">Inches (in)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Width</label>
                  <input
                    type="number"
                    value={formData.dimensions?.width || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      dimensions: {
                        ...formData.dimensions!,
                        width: parseFloat(e.target.value) || 0,
                        depth: formData.dimensions?.depth || 0,
                        height: formData.dimensions?.height || 0,
                        unit: formData.dimensions?.unit || 'cm'
                      }
                    })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border-subtle)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Depth</label>
                  <input
                    type="number"
                    value={formData.dimensions?.depth || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      dimensions: {
                        ...formData.dimensions!,
                        depth: parseFloat(e.target.value) || 0,
                        width: formData.dimensions?.width || 0,
                        height: formData.dimensions?.height || 0,
                        unit: formData.dimensions?.unit || 'cm'
                      }
                    })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border-subtle)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Height</label>
                  <input
                    type="number"
                    value={formData.dimensions?.height || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      dimensions: {
                        ...formData.dimensions!,
                        height: parseFloat(e.target.value) || 0,
                        width: formData.dimensions?.width || 0,
                        depth: formData.dimensions?.depth || 0,
                        unit: formData.dimensions?.unit || 'cm'
                      }
                    })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border-subtle)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Seat H</label>
                  <input
                    type="number"
                    value={formData.dimensions?.seatHeight || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      dimensions: {
                        ...formData.dimensions!,
                        seatHeight: parseFloat(e.target.value) || 0,
                        width: formData.dimensions?.width || 0,
                        depth: formData.dimensions?.depth || 0,
                        height: formData.dimensions?.height || 0,
                        unit: formData.dimensions?.unit || 'cm'
                      }
                    })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border-subtle)' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Preferred Primary Viewer Mode
              </label>
              <select
                value={formData.preferredViewer}
                onChange={(e) => setFormData({ ...formData, preferredViewer: e.target.value as ProductViewerMode })}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.85rem' }}
              >
                <option value="gallery">Standard High-Res Gallery</option>
                <option value="glb_3d">Interactive 3D GLB Model Viewer</option>
                <option value="sequence_360">360-Degree Photographic Turntable</option>
                <option value="video">Showcase Video</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHOTOGRAPHY & MEDIA */}
      {activeTab === 'media' && (
        <div className="luxury-card" style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Product Photography &amp; Gallery</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Upload photographs and organize frame sequence. Choose which image serves as the primary catalog card.
              </p>
            </div>
            <label className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', cursor: 'pointer' }}>
              <Upload size={14} />
              <span>{isUploadingImage ? 'Uploading...' : 'Upload Photos'}</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                disabled={isUploadingImage}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {uploadedImages.length === 0 ? (
            <div style={{ padding: 'var(--space-16)', border: '2px dashed var(--color-border-medium)', textAlign: 'center' }}>
              <ImageIcon size={36} color="var(--color-text-muted)" style={{ margin: '0 auto var(--space-3)' }} />
              <p style={{ fontSize: '0.9rem' }}>No photographs uploaded yet. Drag &amp; drop or use the upload button above.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
              {uploadedImages.map((img, idx) => {
                const isPrimary = formData.primaryImageUrl === img.url;
                return (
                  <div key={idx} style={{
                    border: isPrimary ? '2px solid var(--color-accent-gold)' : '1px solid var(--color-border-subtle)',
                    padding: 'var(--space-2)',
                    backgroundColor: 'var(--color-bg-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)'
                  }}>
                    <img src={img.url} alt={`Gallery ${idx}`} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />

                    {/* Controls Bar: Reorder left/right, set primary, delete */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, 'left')}
                          title="Move Left"
                          style={{
                            padding: '3px 6px',
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border-subtle)',
                            cursor: idx === 0 ? 'default' : 'pointer',
                            opacity: idx === 0 ? 0.3 : 1
                          }}
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          disabled={idx === uploadedImages.length - 1}
                          onClick={() => moveImage(idx, 'right')}
                          title="Move Right"
                          style={{
                            padding: '3px 6px',
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border-subtle)',
                            cursor: idx === uploadedImages.length - 1 ? 'default' : 'pointer',
                            opacity: idx === uploadedImages.length - 1 ? 0.3 : 1
                          }}
                        >
                          →
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, primaryImageUrl: img.url })}
                        className={`badge ${isPrimary ? 'badge-gold' : ''}`}
                        style={{ cursor: 'pointer', border: 'none', fontSize: '0.65rem' }}
                      >
                        {isPrimary ? 'Primary Card' : 'Set Primary'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
                          if (isPrimary) {
                            setFormData({ ...formData, primaryImageUrl: uploadedImages[1]?.url || null });
                          }
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#b31d28', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SHOWCASE VIDEO */}
      {activeTab === 'video' && (
        <div className="luxury-card" style={{ padding: 'var(--space-8)' }}>
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Product Showcase Video</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Attach a cinematic short clip showing the joinery details, mechanism, or spatial presence of this piece.
            </p>
          </div>

          {productVideoUrl ? (
            <div style={{ marginBottom: 'var(--space-6)', maxWidth: '640px' }}>
              <video
                src={productVideoUrl}
                poster={productVideoPosterUrl || undefined}
                controls
                playsInline
                style={{ width: '100%', maxHeight: '360px', backgroundColor: '#000', border: '1px solid var(--color-border-subtle)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                  {productVideoUrl}
                </span>
                <button
                  type="button"
                  onClick={() => { setProductVideoUrl(null); setProductVideoPosterUrl(null); }}
                  style={{ background: 'transparent', border: 'none', color: '#b31d28', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Trash2 size={13} />
                  <span>Remove Video</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: 'var(--space-12)', border: '2px dashed var(--color-border-medium)', textAlign: 'center', marginBottom: 'var(--space-6)', maxWidth: '640px' }}>
              <Film size={36} color="var(--color-text-muted)" style={{ margin: '0 auto var(--space-3)' }} />
              <p style={{ fontSize: '0.9rem' }}>No showcase video uploaded for this piece.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Supported formats: MP4, WebM (Max 100MB).
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)', maxWidth: '640px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Upload Showcase Video
              </label>
              <label className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                <Upload size={14} />
                <span>{isUploadingVideo ? 'Uploading...' : 'Choose MP4 / WebM'}</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  disabled={isUploadingVideo}
                  onChange={handleVideoUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Upload Video Poster
              </label>
              <label className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                <Upload size={14} />
                <span>{isUploadingVideo ? 'Uploading...' : 'Choose Poster Image'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isUploadingVideo}
                  onChange={handleVideoPosterUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 3D GLB VIEWER */}
      {activeTab === 'viewer3d' && (
        <div className="luxury-card" style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Genuine 3D GLB Architectural Model</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Upload a self-contained binary .glb model (max 50MB). Standalone .gltf with external .bin buffers is rejected to guarantee complete scene assets.
              </p>
            </div>
            <label className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', cursor: 'pointer' }}>
              <Box size={14} />
              <span>{isUploadingGlb ? 'Uploading Model...' : 'Upload .GLB Model'}</span>
              <input
                type="file"
                accept=".glb,model/gltf-binary"
                disabled={isUploadingGlb}
                onChange={handleGlbUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {glbModelUrl ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)' }}>
              <div>
                <div
                  ref={previewCanvasRef}
                  style={{ width: '100%', height: '420px', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px', textAlign: 'center' }}>
                  Interactive WebGL Preview: Drag to rotate • Scroll to zoom
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-secondary)', fontSize: '0.85rem' }}>
                  <strong>Verified Model Source:</strong>
                  <div style={{ fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.75rem', marginTop: '4px' }}>
                    {glbModelUrl}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGlbModelUrl(null);
                    if (viewerEngineRef.current) viewerEngineRef.current.dispose();
                  }}
                  className="btn btn-secondary"
                  style={{ color: '#b31d28', borderColor: '#b31d28', alignSelf: 'flex-start' }}
                >
                  <Trash2 size={14} />
                  <span>Remove 3D Model</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: 'var(--space-16)', border: '2px dashed var(--color-border-medium)', textAlign: 'center' }}>
              <Box size={36} color="var(--color-text-muted)" style={{ margin: '0 auto var(--space-3)' }} />
              <p style={{ fontSize: '0.9rem' }}>No finished 3D model uploaded for this creation yet.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                When absent, the public site falls back gracefully to the standard product photography gallery.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: 360° SEQUENCE VIEWER */}
      {activeTab === 'viewer360' && (
        <div className="luxury-card" style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>360-Degree Photographic Turntable Sequence</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Upload ordered series of photographs (e.g. frame_01.webp to frame_24.webp).
              </p>
            </div>
            <label className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', cursor: 'pointer' }}>
              <RotateCw size={14} />
              <span>{isUploadingSequence ? 'Uploading Frames...' : 'Upload Sequence Frames'}</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/webp,image/png"
                disabled={isUploadingSequence}
                onChange={handleSequenceUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {sequenceFrames.length === 0 ? (
            <div style={{ padding: 'var(--space-16)', border: '2px dashed var(--color-border-medium)', textAlign: 'center' }}>
              <RotateCw size={36} color="var(--color-text-muted)" style={{ margin: '0 auto var(--space-3)' }} />
              <p style={{ fontSize: '0.9rem' }}>No 360-degree turntable frames uploaded for this piece.</p>
            </div>
          ) : (
            <div>
              {/* Interactive Scrubber Test Stage */}
              <div style={{ marginBottom: 'var(--space-6)', maxWidth: '520px' }}>
                <span className="kicker" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>
                  Interactive 360° Scrub Preview ({previewFrameIndex360 + 1}/{sequenceFrames.length})
                </span>
                <div style={{ height: '340px', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={sequenceFrames[previewFrameIndex360] || sequenceFrames[0]}
                    alt={`Scrub Frame ${previewFrameIndex360 + 1}`}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <input
                    type="range"
                    min={0}
                    max={sequenceFrames.length - 1}
                    value={previewFrameIndex360}
                    onChange={(e) => setPreviewFrameIndex360(parseInt(e.target.value, 10))}
                    style={{ width: '100%', cursor: 'ew-resize' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <span>Frame 1</span>
                    <span>Drag slider to test rotation</span>
                    <span>Frame {sequenceFrames.length}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <span className="badge badge-gold">{sequenceFrames.length} Ordered Frames</span>
                <button
                  type="button"
                  onClick={() => setSequenceFrames([])}
                  style={{ background: 'transparent', border: 'none', color: '#b31d28', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Clear All Frames
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 'var(--space-3)' }}>
                {sequenceFrames.map((url, idx) => (
                  <div key={idx} style={{
                    border: previewFrameIndex360 === idx ? '2px solid var(--color-accent-gold)' : '1px solid var(--color-border-subtle)',
                    padding: '4px',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => setPreviewFrameIndex360(idx)}
                  >
                    <img src={url} alt={`Frame ${idx + 1}`} style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>#{idx + 1}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSequenceFrames((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#b31d28', cursor: 'pointer', fontSize: '10px' }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
