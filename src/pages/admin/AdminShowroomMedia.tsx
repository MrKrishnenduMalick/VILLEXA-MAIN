import React, { useEffect, useState } from 'react';
import { Film, Upload, Save, Check, Trash2, AlertCircle, Sparkles, Package } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { siteConfigService } from '../../services/siteConfigService';
import { uploadAsset, uploadPublicAsset, validateFile } from '../../services/storageService';
import { HeroConfig } from '../../types/content';
import { Collection } from '../../types/collection';
import { Product } from '../../types/product';

type VideoSection = 'hero' | 'collections' | 'products';

export const AdminShowroomMedia: React.FC = () => {
  const [activeSection, setActiveSection] = useState<VideoSection>('hero');

  // 2. Homepage Hero Video State
  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    kicker: 'HAUTE ÉBÉNISTERIE & ARCHITECTURE',
    title: 'Pure Architectural Form Meets Bespoke Craftsmanship',
    subtitle: 'Curated interior masterworks crafted for refined living spaces.',
    primaryCtaLabel: 'Explore Catalogue',
    primaryCtaLink: '/catalogue',
    secondaryCtaLabel: 'Request Commission',
    secondaryCtaLink: '/contact',
    mediaType: 'none',
    mediaUrl: null,
    posterUrl: null
  });

  // 3. Collection Video State
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [colVideoUrl, setColVideoUrl] = useState<string | null>(null);
  const [colPosterUrl, setColPosterUrl] = useState<string | null>(null);

  // 4. Product Video State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [prodVideoUrl, setProdVideoUrl] = useState<string | null>(null);
  const [prodVideoStoragePath, setProdVideoStoragePath] = useState<string | null>(null);
  const [prodPosterUrl, setProdPosterUrl] = useState<string | null>(null);
  const [prodPosterStoragePath, setProdPosterStoragePath] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadAll() {
      setIsLoading(true);
      try {
        const [siteConfig, cols, prods] = await Promise.all([
          siteConfigService.getSiteConfig(),
          adminService.getCollections(),
          adminService.getAllProducts()
        ]);
        if (siteConfig) {
          setHeroConfig(siteConfig.hero);
        }
        setCollections(cols);
        setProducts(prods);

        if (cols.length > 0) {
          setSelectedCollectionId(cols[0].id);
          setColVideoUrl(cols[0].videoUrl || null);
          setColPosterUrl(cols[0].videoPosterUrl || null);
        }
        if (prods.length > 0) {
          setSelectedProductId(prods[0].id);
          setProdVideoUrl(prods[0].videoUrl || null);
          setProdVideoStoragePath(prods[0].videoMedia?.storagePath || null);
          setProdPosterUrl(prods[0].videoPosterUrl || null);
          setProdPosterStoragePath((prods[0].videoMedia?.metadata as any)?.posterStoragePath || null);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadAll();
  }, []);

  // When selected collection changes
  const handleCollectionSelect = (colId: string) => {
    setSelectedCollectionId(colId);
    const col = collections.find((c) => c.id === colId);
    setColVideoUrl(col?.videoUrl || null);
    setColPosterUrl(col?.videoPosterUrl || null);
    setFeedback(null);
  };

  // When selected product changes
  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    setProdVideoUrl(prod?.videoUrl || null);
    setProdVideoStoragePath(prod?.videoMedia?.storagePath || null);
    setProdPosterUrl(prod?.videoPosterUrl || null);
    setProdPosterStoragePath((prod?.videoMedia?.metadata as any)?.posterStoragePath || null);
    setFeedback(null);
  };

  // Generic video upload helper
  const handleUploadVideo = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string, storagePath?: string) => void,
    folder: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedback(null);
    const valid = validateFile(file, 'video');
    if (!valid.valid) {
      setFeedback({ type: 'error', text: valid.error || 'Invalid video file (must be MP4 or WebM under 100MB).' });
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadAsset(file, 'video', folder);
      if (res.success && res.publicUrl) {
        onSuccess(res.publicUrl, res.storagePath);
        setFeedback({ type: 'success', text: 'Video uploaded and verified successfully!' });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to upload video.' });
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Dedicated Hero Video upload via public showroom storage
  const handleUploadHeroVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedback(null);
    const valid = validateFile(file, 'video');
    if (!valid.valid) {
      setFeedback({ type: 'error', text: valid.error || 'Invalid video file (must be MP4 or WebM under 100MB).' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(`Uploading "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) to Showroom CDN...`);
    try {
      const res = await uploadPublicAsset(file, 'video', 'hero/videos');
      if (res.success && res.publicUrl) {
        setHeroConfig((prev) => ({
          ...prev,
          mediaUrl: res.publicUrl!,
          mediaType: 'video'
        }));
        setFeedback({
          type: 'success',
          text: `Hero video "${file.name}" uploaded successfully! Click "Save Homepage Hero Configuration" below to apply to the live showroom.`
        });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to upload hero video.' });
      }
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  // Dedicated Hero Poster upload via public showroom storage
  const handleUploadHeroPoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedback(null);
    const valid = validateFile(file, 'image');
    if (!valid.valid) {
      setFeedback({ type: 'error', text: valid.error || 'Invalid image file for hero poster.' });
      return;
    }

    setIsUploading(true);
    setUploadStatus(`Uploading hero poster thumbnail (${(file.size / (1024 * 1024)).toFixed(1)}MB)...`);
    try {
      const res = await uploadPublicAsset(file, 'image', 'hero/posters');
      if (res.success && res.publicUrl) {
        setHeroConfig((prev) => ({
          ...prev,
          posterUrl: res.publicUrl!
        }));
        setFeedback({ type: 'success', text: 'Hero poster thumbnail uploaded and attached successfully!' });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to upload hero poster.' });
      }
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  // Generic poster upload helper for collections and products
  const handleUploadPoster = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string, storagePath?: string) => void,
    folder: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedback(null);
    const valid = validateFile(file, 'image');
    if (!valid.valid) {
      setFeedback({ type: 'error', text: valid.error || 'Invalid image file for thumbnail.' });
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadAsset(file, 'image', folder);
      if (res.success && res.publicUrl) {
        onSuccess(res.publicUrl, res.storagePath);
        setFeedback({ type: 'success', text: 'Video thumbnail uploaded successfully!' });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to upload thumbnail.' });
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Save 2: Homepage Hero Video
  const handleSaveHero = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await adminService.saveSiteSettings('hero', heroConfig);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Homepage hero video configuration saved!' });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to persist hero settings.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Save 3: Collection Video
  const handleSaveCollectionVideo = async () => {
    const col = collections.find((c) => c.id === selectedCollectionId);
    if (!col) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await adminService.saveCollection({
        id: col.id,
        name: col.name,
        slug: col.slug,
        headline: col.headline,
        description: col.description,
        coverImageUrl: col.coverImageUrl,
        videoUrl: colVideoUrl,
        videoPosterUrl: colPosterUrl,
        isPublished: col.isPublished,
        sortOrder: col.sortOrder
      });

      if (res.success) {
        setFeedback({ type: 'success', text: `Video configuration saved for collection "${col.name}"!` });
        // Update local state
        setCollections((prev) =>
          prev.map((c) => (c.id === col.id ? { ...c, videoUrl: colVideoUrl, videoPosterUrl: colPosterUrl } : c))
        );
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to save collection video.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Save 4: Product Video
  const handleSaveProductVideo = async () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await adminService.saveProduct({
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        regularPrice: prod.regularPrice,
        salePrice: prod.salePrice || null,
        currency: prod.currency,
        showPricePublicly: prod.showPricePublicly,
        isEnquiryOnly: prod.isEnquiryOnly,
        shortDescription: prod.shortDescription,
        fullDescription: prod.fullDescription,
        materials: prod.materials,
        primaryImageUrl: prod.primaryImageUrl,
        preferredViewer: prod.preferredViewer,
        tags: prod.tags,
        isFeatured: prod.isFeatured,
        sortOrder: prod.sortOrder,
        status: prod.status,
        galleryImages: prod.galleryMedia || prod.galleryImages?.map((url) => ({ url })),
        glbModel: prod.glbMedia || (prod.glbConfig?.modelUrl ? { url: prod.glbConfig.modelUrl } : null),
        productVideo: prodVideoUrl ? {
          url: prodVideoUrl,
          storagePath: prodVideoStoragePath || undefined,
          posterUrl: prodPosterUrl || undefined,
          metadata: {
            ...(prodPosterStoragePath ? { posterStoragePath: prodPosterStoragePath } : {})
          }
        } : null
      });

      if (res.success) {
        setFeedback({ type: 'success', text: `Showcase video saved for product "${prod.name}"!` });
        // Update local state
        setProducts((prev) =>
          prev.map((p) => (p.id === prod.id ? {
            ...p,
            videoUrl: prodVideoUrl,
            videoPosterUrl: prodPosterUrl,
            videoMedia: prodVideoUrl ? {
              url: prodVideoUrl,
              storagePath: prodVideoStoragePath || undefined,
              posterUrl: prodPosterUrl || undefined
            } : null
          } : p))
        );
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to save product video.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <span className="kicker">CINEMATIC ASSETS</span>
        <h1 style={{ fontSize: '2rem', marginTop: '4px' }}>Videos &amp; Showroom Media</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Manage video walkthroughs, hero atmosphere, and collection showcases across your showroom.
        </p>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          backgroundColor: feedback.type === 'success' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(215, 58, 73, 0.1)',
          border: `1px solid ${feedback.type === 'success' ? '#28a745' : '#b31d28'}`,
          color: feedback.type === 'success' ? '#28a745' : '#b31d28',
          fontSize: '0.875rem',
          marginBottom: 'var(--space-6)'
        }}>
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Section Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        borderBottom: '1px solid var(--color-border-subtle)',
        marginBottom: 'var(--space-8)'
      }}>
        <button
          onClick={() => { setActiveSection('hero'); setFeedback(null); }}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: activeSection === 'hero' ? 600 : 400,
            color: activeSection === 'hero' ? '#856404' : 'var(--color-text-secondary)',
            borderBottom: activeSection === 'hero' ? '2px solid var(--color-accent-gold)' : '2px solid transparent'
          }}
        >
          Homepage Hero Video
        </button>
        <button
          onClick={() => { setActiveSection('collections'); setFeedback(null); }}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: activeSection === 'collections' ? 600 : 400,
            color: activeSection === 'collections' ? '#856404' : 'var(--color-text-secondary)',
            borderBottom: activeSection === 'collections' ? '2px solid var(--color-accent-gold)' : '2px solid transparent'
          }}
        >
          Collection Videos ({collections.length})
        </button>
        <button
          onClick={() => { setActiveSection('products'); setFeedback(null); }}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: activeSection === 'products' ? 600 : 400,
            color: activeSection === 'products' ? '#856404' : 'var(--color-text-secondary)',
            borderBottom: activeSection === 'products' ? '2px solid var(--color-accent-gold)' : '2px solid transparent'
          }}
        >
          Product Showcase Videos ({products.length})
        </button>
      </div>

      {isLoading ? (
        <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
          <span className="kicker">LOADING VIDEO REPOSITORY...</span>
        </div>
      ) : (
        <>

          {/* 2. HOMEPAGE HERO VIDEO (OPTIONAL OVERRIDE) */}
          {activeSection === 'hero' && (
            <div className="luxury-card" style={{ padding: 'var(--space-8)', maxWidth: '900px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>Homepage Hero Video Configuration</h3>
                    <span
                      className={`badge ${heroConfig.mediaType === 'video' && heroConfig.mediaUrl ? 'badge-gold' : ''}`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {heroConfig.mediaType === 'frames' ? 'Frames Engine Active (Recommended)' : heroConfig.mediaType === 'video' ? 'Video Mode' : 'Typographic Mode'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', maxWidth: '640px', lineHeight: 1.6 }}>
                    Configure an optional continuous or scrubbed HTML5 video for the homepage hero background. Note: The primary 384-frame showroom sequence is managed in the dedicated Homepage Cinematic Frames manager.
                  </p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', padding: '6px 12px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)' }}>
                  <input
                    type="checkbox"
                    checked={heroConfig.mediaType === 'video'}
                    onChange={(e) => setHeroConfig({ ...heroConfig, mediaType: e.target.checked ? 'video' : 'frames' })}
                  />
                  <span>Enable Video Override</span>
                </label>
              </div>

              {/* Upload Status Banner */}
              {isUploading && uploadStatus && (
                <div style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'rgba(195, 158, 92, 0.1)',
                  border: '1px solid var(--color-accent-gold)',
                  marginBottom: 'var(--space-6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-primary)'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid var(--color-accent-gold)',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>{uploadStatus}</span>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              )}

              {/* Video Player Preview */}
              {heroConfig.mediaUrl ? (
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <video
                    src={heroConfig.mediaUrl}
                    poster={heroConfig.posterUrl || undefined}
                    controls
                    playsInline
                    style={{ width: '100%', maxHeight: '380px', backgroundColor: '#000', border: '1px solid var(--color-border-subtle)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {heroConfig.mediaUrl}
                    </span>
                    <button
                      onClick={() => setHeroConfig({ ...heroConfig, mediaUrl: null, mediaType: 'none' })}
                      style={{ background: 'transparent', border: 'none', color: '#b31d28', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={13} />
                      <span>Remove Hero Video</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 'var(--space-12)', border: '2px dashed var(--color-border-medium)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                  <Film size={36} color="var(--color-text-muted)" style={{ margin: '0 auto var(--space-3)' }} />
                  <p style={{ fontSize: '0.9rem', fontWeight: 400 }}>No video currently assigned to the homepage hero.</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Supported formats: MP4 (H.264), WebM. Maximum size: 100MB.
                  </p>
                </div>
              )}

              {/* Upload Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                    Upload Dedicated Hero Video (MP4/WebM)
                  </label>
                  <label className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                    <Upload size={14} />
                    <span>{isUploading ? 'Uploading Hero Video...' : 'Choose Hero Video File (Max 100MB)'}</span>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      disabled={isUploading}
                      onChange={handleUploadHeroVideo}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    High-definition architectural footage (1080p / 4K recommended for smooth scrub).
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                    Upload Hero Poster Thumbnail (Optional)
                  </label>
                  <label className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', cursor: isUploading ? 'not-allowed' : 'pointer' }}>
                    <Upload size={14} />
                    <span>{isUploading ? 'Uploading Poster...' : 'Choose Poster Image (Max 15MB)'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isUploading}
                      onChange={handleUploadHeroPoster}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Displayed instantly before the video finishes buffering.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <button
                  onClick={handleSaveHero}
                  disabled={isSaving || isUploading}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.75rem' }}
                >
                  <Save size={14} />
                  <span>{isSaving ? 'Saving Settings...' : 'Save Homepage Hero Configuration'}</span>
                </button>
                {heroConfig.mediaUrl && (
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '0.75rem 1.25rem', fontSize: '0.78rem' }}
                  >
                    <span>Preview Public Showroom</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 3. COLLECTION VIDEOS */}
          {activeSection === 'collections' && (
            <div className="luxury-card" style={{ padding: 'var(--space-8)', maxWidth: '900px' }}>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Collection &amp; Suite Walkthroughs</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Attach a video atmosphere walkthrough to individual collection suites.
                </p>
              </div>

              {collections.length === 0 ? (
                <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <Sparkles size={36} style={{ margin: '0 auto var(--space-3)' }} />
                  <p>No collections created yet. Create a collection in the Collections tab first.</p>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                      Select Target Collection
                    </label>
                    <select
                      value={selectedCollectionId}
                      onChange={(e) => handleCollectionSelect(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.9rem' }}
                    >
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.isPublished ? 'Published' : 'Draft'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {colVideoUrl ? (
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                      <video
                        src={colVideoUrl}
                        poster={colPosterUrl || undefined}
                        controls
                        playsInline
                        style={{ width: '100%', maxHeight: '380px', backgroundColor: '#000', border: '1px solid var(--color-border-subtle)' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          {colVideoUrl}
                        </span>
                        <button
                          onClick={() => { setColVideoUrl(null); setColPosterUrl(null); }}
                          style={{ background: 'transparent', border: 'none', color: '#b31d28', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={13} />
                          <span>Remove Video from Collection</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 'var(--space-12)', border: '2px dashed var(--color-border-medium)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                      <Film size={36} color="var(--color-text-muted)" style={{ margin: '0 auto var(--space-3)' }} />
                      <p style={{ fontSize: '0.9rem' }}>No video attached to this collection.</p>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                        Upload Video (MP4/WebM)
                      </label>
                      <label className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                        <Upload size={14} />
                        <span>{isUploading ? 'Uploading Video...' : 'Choose Collection Video'}</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          disabled={isUploading}
                          onChange={(e) => handleUploadVideo(e, (url) => setColVideoUrl(url), 'collections/videos')}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                        Upload Poster Thumbnail
                      </label>
                      <label className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                        <Upload size={14} />
                        <span>{isUploading ? 'Uploading Poster...' : 'Choose Poster Thumbnail'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={isUploading}
                          onChange={(e) => handleUploadPoster(e, (url) => setColPosterUrl(url), 'collections/posters')}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveCollectionVideo}
                    disabled={isSaving}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    <Save size={14} />
                    <span>{isSaving ? 'Saving...' : 'Save Collection Video'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. PRODUCT VIDEOS */}
          {activeSection === 'products' && (
            <div className="luxury-card" style={{ padding: 'var(--space-8)', maxWidth: '900px' }}>
              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Product Showcase Videos</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Attach a cinematic material joinery or detailing clip to a specific creation.
                </p>
              </div>

              {products.length === 0 ? (
                <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <Package size={36} style={{ margin: '0 auto var(--space-3)' }} />
                  <p>No products in catalogue yet. Create a product first.</p>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 'var(--space-6)' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                      Select Target Product
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductSelect(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.9rem' }}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} [{p.sku}] ({p.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {prodVideoUrl ? (
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                      <video
                        src={prodVideoUrl}
                        poster={prodPosterUrl || undefined}
                        controls
                        playsInline
                        style={{ width: '100%', maxHeight: '380px', backgroundColor: '#000', border: '1px solid var(--color-border-subtle)' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          {prodVideoUrl}
                        </span>
                        <button
                          onClick={() => { setProdVideoUrl(null); setProdPosterUrl(null); }}
                          style={{ background: 'transparent', border: 'none', color: '#b31d28', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={13} />
                          <span>Remove Video from Product</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 'var(--space-12)', border: '2px dashed var(--color-border-medium)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                      <Film size={36} color="var(--color-text-muted)" style={{ margin: '0 auto var(--space-3)' }} />
                      <p style={{ fontSize: '0.9rem' }}>No showcase video attached to this product.</p>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                        Upload Product Video (MP4/WebM)
                      </label>
                      <label className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                        <Upload size={14} />
                        <span>{isUploading ? 'Uploading Video...' : 'Choose Product Video'}</span>
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          disabled={isUploading}
                          onChange={(e) => handleUploadVideo(e, (url, storagePath) => {
                            setProdVideoUrl(url);
                            setProdVideoStoragePath(storagePath || null);
                          }, 'products/videos')}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                        Upload Poster Thumbnail
                      </label>
                      <label className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', cursor: 'pointer' }}>
                        <Upload size={14} />
                        <span>{isUploading ? 'Uploading Poster...' : 'Choose Poster Thumbnail'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={isUploading}
                          onChange={(e) => handleUploadPoster(e, (url, storagePath) => {
                            setProdPosterUrl(url);
                            setProdPosterStoragePath(storagePath || null);
                          }, 'products/posters')}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProductVideo}
                    disabled={isSaving}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    <Save size={14} />
                    <span>{isSaving ? 'Saving...' : 'Save Product Showcase Video'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
