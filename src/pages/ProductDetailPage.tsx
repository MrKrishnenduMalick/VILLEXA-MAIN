import React, { useEffect, useState, useRef } from 'react';
import { useRoute, Link } from 'wouter';
import { ArrowLeft, Box, Image as ImageIcon, ShieldCheck, Truck, Sparkles, Film, AlertCircle } from 'lucide-react';
import { productService } from '../services/productService';
import { Product } from '../types/product';
import { EmptyState } from '../components/common/EmptyState';
import { ThreeViewerEngine } from '../services/viewer/threeViewerEngine';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useClientConfig } from '../context/ClientConfigContext';

export const ProductDetailPage: React.FC = () => {
  const clientConfig = useClientConfig();
  const [, params] = useRoute('/product/:slug');
  const slug = params?.slug || '';
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active viewer mode: 'gallery' | 'glb_3d' | 'video'
  const [activeViewer, setActiveViewer] = useState<'gallery' | 'glb_3d' | 'video'>('gallery');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  // Video playback state & error handling
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // 3D Canvas & error handling
  const [glbError, setGlbError] = useState<string | null>(null);
  const [isGlbLoading, setIsGlbLoading] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const viewerEngineRef = useRef<ThreeViewerEngine | null>(null);

  const INAUGURAL_FALLBACKS: Record<string, Product> = {
    'emerald-velvet-armchair': {
      id: 'feat-1',
      slug: 'emerald-velvet-armchair',
      name: 'Emerald Velvet Armchair',
      sku: 'VLX-CH-01',
      categoryId: 'living',
      categoryName: 'LIVING ROOM',
      regularPrice: 1200,
      currency: 'USD',
      showPricePublicly: true,
      isEnquiryOnly: false,
      shortDescription: 'A contemporary emerald velvet barrel armchair with sculpted rounded arms and a refined, comfortable silhouette. Perfect for modern living spaces.',
      fullDescription: 'Sculpted in our Brianza atelier with high-resilience memory foam, hand-upholstered in Italian emerald velvet over a kiln-dried European beech frame with tapered brushed brass legs.',
      materials: 'Italian Emerald Velvet, European Beech, Brushed Brass',
      careInstructions: 'Professional upholstery clean only. Vacuum gently with soft brush attachment. Protect from direct prolonged sunlight.',
      dimensions: {
        width: 86,
        depth: 82,
        height: 78,
        seatHeight: 44,
        unit: 'cm'
      },
      primaryImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=85',
      galleryImages: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=85'
      ],
      finishes: [],
      preferredViewer: 'gallery',
      tags: ['Living Room', 'Armchair', 'Velvet'],
      isFeatured: true,
      sortOrder: 1,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  useEffect(() => {
    async function loadProduct() {
      if (!slug) {
        setIsLoading(false);
        return;
      }
      try {
        let found = await productService.getProductBySlug(slug);
        if (!found && INAUGURAL_FALLBACKS[slug]) {
          found = INAUGURAL_FALLBACKS[slug];
        }
        setProduct(found);
        if (found) {
          setSelectedImage(found.primaryImageUrl || found.galleryImages?.[0] || null);
          const preferred = found.preferredViewer === 'video' ? 'video' : found.preferredViewer === 'glb_3d' ? 'glb_3d' : 'gallery';
          setActiveViewer(preferred);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  // Clean up 3D viewer when switching away
  useEffect(() => {
    if (activeViewer !== 'glb_3d' && viewerEngineRef.current) {
      viewerEngineRef.current.dispose();
      viewerEngineRef.current = null;
    }

    if (activeViewer === 'glb_3d' && product?.glbConfig?.modelUrl && canvasContainerRef.current) {
      if (!viewerEngineRef.current) {
        setIsGlbLoading(true);
        setGlbError(null);
        const engine = new ThreeViewerEngine(canvasContainerRef.current, {
          autoRotate: true,
          autoRotateSpeed: 1.2,
          backgroundColor: 0xf6f3ee
        });
        viewerEngineRef.current = engine;

        const loader = new GLTFLoader();
        loader.load(
          product.glbConfig.modelUrl,
          (gltf) => {
            engine.frameModel(gltf.scene);
            setIsGlbLoading(false);
          },
          undefined,
          (err) => {
            console.error('Failed to load 3D model in public viewer:', err);
            setIsGlbLoading(false);
            setGlbError('Architectural 3D model is currently unavailable or re-indexing in the showroom.');
          }
        );
      }
    }

    return () => {
      if (viewerEngineRef.current) {
        viewerEngineRef.current.dispose();
        viewerEngineRef.current = null;
      }
    };
  }, [activeViewer, product]);

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center' }}>
        <span className="kicker">LOCATING ATELIER PIECE...</span>
      </div>
    );
  }

  // Graceful empty state when product is not yet in database
  if (!product) {
    return (
      <div style={{ padding: 'var(--space-20) 0' }}>
        <div className="container-narrow">
          <Link
            href="/catalogue"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-8)'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Catalogue</span>
          </Link>

          <EmptyState
            type="generic"
            title="Piece Not Yet Published"
            description={`The product with reference "${slug}" is not currently published in the ${clientConfig.brand.brandName} catalogue. Once created and published in the Admin Dashboard, its specifications, photography, and 3D viewers will appear here.`}
            actionLabel="Return to Master Catalogue"
            actionHref="/catalogue"
          />
        </div>
      </div>
    );
  }

  const allImages = Array.from(
    new Set([
      ...(product.primaryImageUrl ? [product.primaryImageUrl] : []),
      ...(product.galleryImages || [])
    ])
  );

  const has3D = Boolean(clientConfig.features.enable3DViewer && product.glbConfig?.modelUrl);
  const hasVideo = Boolean(product.videoUrl);

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-24)' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Link
            href="/catalogue"
            className="glass-pill"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#ffffff',
              padding: '8px 20px',
              textDecoration: 'none',
              transition: 'all 0.25s ease'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Catalogue</span>
          </Link>
        </div>

        {/* Product Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-8)', alignItems: 'start' }}>
          
          {/* COLUMN 1: INTERACTIVE MEDIA SHOWCASE */}
          <div>
            {/* Viewer Mode Selector Pills (when multiple modes exist) */}
            {(has3D || hasVideo) && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveViewer('gallery')}
                  className={`btn ${activeViewer === 'gallery' ? 'btn-gold' : 'btn-frosted'}`}
                  style={{
                    padding: '0.45rem 1rem',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  <ImageIcon size={13} />
                  <span>Gallery</span>
                </button>
                {has3D && (
                  <button
                    onClick={() => setActiveViewer('glb_3d')}
                    className={`btn ${activeViewer === 'glb_3d' ? 'btn-gold' : 'btn-frosted'}`}
                    style={{
                      padding: '0.45rem 1rem',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-pill)'
                    }}
                  >
                    <Box size={13} />
                    <span>3D Model</span>
                  </button>
                )}
                {hasVideo && (
                  <button
                    onClick={() => setActiveViewer('video')}
                    className={`btn ${activeViewer === 'video' ? 'btn-gold' : 'btn-frosted'}`}
                    style={{
                      padding: '0.45rem 1rem',
                      fontSize: '0.75rem',
                      borderRadius: 'var(--radius-pill)'
                    }}
                  >
                    <Film size={13} />
                    <span>Showcase Video</span>
                  </button>
                )}
              </div>
            )}

            {/* Display Stage with Luxury Glass Effect */}
            <div
              className="luxury-glass-card"
              style={{
                minHeight: '480px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 50% 50%, rgba(35, 30, 26, 0.75) 0%, rgba(18, 15, 13, 0.90) 100%)',
                padding: 'var(--space-6)'
              }}
            >
              {/* Floating Heart Button */}
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                aria-label="Add to wishlist"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={isFavorited ? 'var(--color-accent-gold)' : 'none'} stroke={isFavorited ? 'var(--color-accent-gold)' : '#ffffff'} strokeWidth="1.8">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              {/* Mode A: Standard Photography */}
              {activeViewer === 'gallery' && (
                selectedImage ? (
                  <div style={{ width: '100%', height: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={selectedImage}
                      alt={product.name}
                      style={{
                        maxWidth: '92%',
                        maxHeight: '420px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.65))',
                        transition: 'transform 0.4s ease'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                    <span className="kicker">Photography In Atelier Production</span>
                  </div>
                )
              )}

              {/* Mode B: Genuine 3D Three.js WebGL Engine */}
              {activeViewer === 'glb_3d' && (
                <div style={{ width: '100%', height: '440px', position: 'relative' }}>
                  <div ref={canvasContainerRef} style={{ width: '100%', height: '100%' }} />

                  {isGlbLoading && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(18, 15, 13, 0.75)',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase'
                    }}>
                      Loading 3D Model...
                    </div>
                  )}

                  {glbError ? (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(18, 15, 13, 0.92)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 'var(--space-6)',
                      textAlign: 'center'
                    }}>
                      <AlertCircle size={32} color="var(--color-accent-gold)" style={{ marginBottom: 'var(--space-3)' }} />
                      <p style={{ fontSize: '0.9rem', color: '#ffffff', marginBottom: 'var(--space-2)' }}>
                        3D Architectural Model Unavailable
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', maxWidth: '360px', marginBottom: 'var(--space-4)' }}>
                        {glbError}
                      </p>
                      <button
                        onClick={() => setActiveViewer('gallery')}
                        className="btn btn-frosted"
                        style={{ padding: '0.45rem 1.2rem', fontSize: '0.75rem', borderRadius: 'var(--radius-pill)' }}
                      >
                        Return to Photography Gallery
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(18, 15, 13, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      padding: '4px 14px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(255, 255, 255, 0.85)',
                      pointerEvents: 'none'
                    }}>
                      Drag to rotate • Scroll to zoom
                    </div>
                  )}
                </div>
              )}

              {/* Mode D: Showcase Video Player */}
              {activeViewer === 'video' && product.videoUrl && (
                <div style={{ width: '100%', height: '440px', backgroundColor: '#000', borderRadius: '14px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {videoError ? (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(18, 15, 13, 0.95)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 'var(--space-6)',
                      textAlign: 'center',
                      zIndex: 2
                    }}>
                      <Film size={32} color="var(--color-accent-gold)" style={{ marginBottom: 'var(--space-3)' }} />
                      <p style={{ fontSize: '0.9rem', color: '#ffffff', marginBottom: 'var(--space-2)' }}>
                        Showcase Video Unavailable
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.65)', maxWidth: '360px', marginBottom: 'var(--space-4)' }}>
                        The video file could not be loaded or played. You may inspect the creation via the high-resolution photo gallery.
                      </p>
                      <button
                        onClick={() => {
                          setVideoError(false);
                          setActiveViewer('gallery');
                        }}
                        className="btn btn-frosted"
                        style={{ padding: '0.45rem 1.2rem', fontSize: '0.75rem', borderRadius: 'var(--radius-pill)' }}
                      >
                        Return to Photo Gallery
                      </button>
                    </div>
                  ) : (
                    <>
                      <video
                        src={product.videoUrl}
                        poster={product.videoPosterUrl || product.primaryImageUrl || undefined}
                        controls
                        autoPlay
                        muted
                        playsInline
                        loop
                        onLoadedMetadata={() => setIsVideoLoading(false)}
                        onCanPlay={() => setIsVideoLoading(false)}
                        onError={() => {
                          console.warn('Video failed to load from URL:', product.videoUrl);
                          setVideoError(true);
                          setIsVideoLoading(false);
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                      {isVideoLoading && (
                        <div style={{
                          position: 'absolute',
                          bottom: '16px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(18, 15, 13, 0.85)',
                          padding: '4px 14px',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.7rem',
                          color: '#ffffff',
                          pointerEvents: 'none'
                        }}>
                          Loading Showcase Video...
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Floating 3D Pill at Bottom Left (matching design reference) */}
              {has3D && activeViewer !== 'glb_3d' && (
                <button
                  onClick={() => setActiveViewer('glb_3d')}
                  className="glass-pill"
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    color: '#ffffff',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                >
                  <Box size={13} color="var(--color-accent-gold)" />
                  <span>3D View</span>
                </button>
              )}
            </div>

            {/* Gallery Thumbnails Strip */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', overflowX: 'auto', paddingBottom: '4px' }}>
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(imgUrl);
                      if (activeViewer !== 'gallery') setActiveViewer('gallery');
                    }}
                    style={{
                      border: selectedImage === imgUrl && activeViewer === 'gallery' ? '2px solid var(--color-accent-gold)' : '1px solid rgba(255, 255, 255, 0.16)',
                      borderRadius: '12px',
                      padding: '3px',
                      background: 'rgba(22, 19, 16, 0.65)',
                      backdropFilter: 'blur(12px)',
                      cursor: 'pointer',
                      width: '74px',
                      height: '74px',
                      flexShrink: 0,
                      overflow: 'hidden',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 2: EDITORIAL SPECIFICATIONS & ORDERING (Reference-Matched Smoked Glass) */}
          <div
            className="luxury-glass-card"
            style={{
              padding: 'var(--space-8) var(--space-10)',
              borderRadius: '22px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span className="kicker" style={{ color: 'var(--color-accent-gold)' }}>
                  {product.categoryName?.toUpperCase() || 'LIVING ROOM'}
                </span>
                {product.collectionName && (
                  <span className="badge badge-gold">{product.collectionName}</span>
                )}
              </div>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 3.2vw, 2.75rem)',
              fontWeight: 400,
              color: '#ffffff',
              marginBottom: 'var(--space-3)',
              lineHeight: 1.15
            }}>
              {product.name}
            </h1>

            {clientConfig.features.enablePriceDisplay && (
              <div style={{
                fontSize: '1.6rem',
                color: 'var(--color-accent-gold)',
                fontFamily: 'var(--font-serif)',
                marginBottom: 'var(--space-5)',
                fontWeight: 500
              }}>
                {productService.formatPrice(product)}
              </div>
            )}

            <p style={{
              fontSize: '1rem',
              lineHeight: 1.65,
              color: 'rgba(255, 255, 255, 0.82)',
              marginBottom: 'var(--space-6)'
            }}>
              {product.fullDescription || product.shortDescription || 'A bespoke contemporary piece sculpted with refined architectural contours. Handcrafted in our atelier with meticulous joinery and timeless materials.'}
            </p>

            {/* Reference Feature Badges Row (circle gold icons + text) */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-4)',
              padding: 'var(--space-4) 0',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              marginBottom: 'var(--space-6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.90)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-gold)' }} />
                <span>{product.materials?.split(',')[0] || 'Premium Velvet'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.90)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-gold)' }} />
                <span>Solid Wood Frame</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.90)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent-gold)' }} />
                <span>Handcrafted</span>
              </div>
            </div>

            {/* Reference Action Row: Quantity Selector Capsule + ADD TO ENQUIRY Gold Pill Button */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
              {/* Quantity Capsule */}
              <div
                className="glass-pill"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 14px',
                  gap: '14px',
                  fontSize: '0.95rem'
                }}
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px' }}
                >
                  −
                </button>
                <span style={{ minWidth: '16px', textAlign: 'center', fontWeight: 500, color: '#ffffff' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.7)', cursor: 'pointer', fontSize: '1.1rem', padding: '0 4px' }}
                >
                  +
                </button>
              </div>

              {/* Gold Pill CTA */}
              <Link
                href={`/contact?type=product_quotation&product=${encodeURIComponent(product.name)}&id=${product.id}&quantity=${quantity}`}
                className="btn-gold"
                style={{
                  flex: 1,
                  padding: '0.9rem 1.6rem',
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: 'var(--radius-pill)',
                  textDecoration: 'none'
                }}
              >
                <span>Add To Enquiry</span>
                <span style={{ fontSize: '1rem' }}>→</span>
              </Link>
            </div>

            {/* Architectural Specifications Table in Smoked Glass Sub-panel */}
            <div style={{
              background: 'rgba(15, 13, 11, 0.45)',
              borderRadius: '16px',
              padding: 'var(--space-6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', display: 'block', marginBottom: '3px' }}>
                  Material Composition
                </span>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.88)', margin: 0 }}>{product.materials || 'Sustainably sourced hardwood, high-resilience foam, Italian bouclé/velvet.'}</p>
              </div>

              {product.dimensions && (
                <div>
                  <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', display: 'block', marginBottom: '3px' }}>
                    Architectural Dimensions
                  </span>
                  <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.88)', margin: 0 }}>
                    {product.dimensions.width} W × {product.dimensions.depth} D × {product.dimensions.height} H {product.dimensions.unit}
                    {product.dimensions.seatHeight ? ` (Seat Height: ${product.dimensions.seatHeight} ${product.dimensions.unit})` : ''}
                  </p>
                </div>
              )}

              {product.careInstructions && (
                <div>
                  <span style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', display: 'block', marginBottom: '3px' }}>
                    Preservation &amp; Care
                  </span>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.72)', margin: 0 }}>
                    {product.careInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Atelier Assurance Badges */}
            <div style={{
              marginTop: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              fontSize: '0.82rem',
              color: 'rgba(255, 255, 255, 0.78)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Sparkles size={15} color="var(--color-accent-gold)" />
                <span>Brianza &amp; Milanese Master Joinery Guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Truck size={15} color="var(--color-accent-gold)" />
                <span>Global Insured White-Glove Architectural Delivery</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <ShieldCheck size={15} color="var(--color-accent-gold)" />
                <span>Certificate of Authenticity with Atelier Archive Registry</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
