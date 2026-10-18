import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { Play, Pause, Film, Image as ImageIcon, Heart } from 'lucide-react';
import { Product } from '../../types/product';
import { productService } from '../../services/productService';
import { useClientConfig } from '../../context/ClientConfigContext';

interface CatalogueProductCardProps {
  product: Product;
}

export const CatalogueProductCard: React.FC<CatalogueProductCardProps> = ({ product }) => {
  const clientConfig = useClientConfig();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState<boolean>(false);
  const [hasVideoError, setHasVideoError] = useState<boolean>(false);
  const [hasImageError, setHasImageError] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  const hasVideo = Boolean(product.videoUrl && product.videoUrl.trim() !== '' && !hasVideoError);
  const posterUrl = product.videoPosterUrl || product.primaryImageUrl || undefined;

  // 1. Detect user preference for reduced motion
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    motionQuery.addEventListener?.('change', handleMotionChange);
    return () => {
      motionQuery.removeEventListener?.('change', handleMotionChange);
    };
  }, []);

  // 2. IntersectionObserver: Play video only while visible in viewport, pause when off-screen
  useEffect(() => {
    if (!hasVideo) return;

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = entry ? entry.isIntersecting : false;
        const video = videoRef.current;
        if (!video) return;

        if (isVisible && !isManuallyPaused && !prefersReducedMotion) {
          video.muted = true;
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => setIsPlaying(true))
              .catch(() => {
                setIsPlaying(false);
              });
          }
        } else {
          if (!video.paused) {
            video.pause();
          }
          setIsPlaying(false);
        }
      },
      {
        threshold: 0.25,
        rootMargin: '60px 0px 60px 0px'
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasVideo, isManuallyPaused, prefersReducedMotion]);

  // 3. Accessible toggle for manual play / pause
  const handleTogglePlayback = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.muted = true;
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsManuallyPaused(false);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    } else {
      video.pause();
      setIsPlaying(false);
      setIsManuallyPaused(true);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  return (
    <Link
      href={`/product/${product.slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
    >
      <div
        className="luxury-glass-card"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          borderRadius: '18px',
          backgroundColor: 'rgba(24, 20, 17, 0.65)',
          backdropFilter: 'blur(20px) saturate(135%)',
          WebkitBackdropFilter: 'blur(20px) saturate(135%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.28)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Favorite Heart Button Matching Reference Image */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={`Favorite ${product.name}`}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(20, 17, 14, 0.55)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: isFavorited ? 'var(--color-accent-gold)' : 'rgba(255, 255, 255, 0.7)',
            zIndex: 4,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-accent-gold)';
            e.currentTarget.style.borderColor = 'var(--color-accent-gold)';
          }}
          onMouseLeave={(e) => {
            if (!isFavorited) {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }
          }}
        >
          <Heart size={14} fill={isFavorited ? 'var(--color-accent-gold)' : 'none'} />
        </button>

        {/* Media Presentation Stage */}
        <div
          ref={containerRef}
          style={{
            height: '280px',
            background: 'radial-gradient(circle at 50% 55%, rgba(42, 35, 30, 0.55) 0%, rgba(18, 15, 13, 0.85) 100%)',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)'
          }}
        >
          {hasVideo ? (
            <>
              <video
                ref={videoRef}
                src={product.videoUrl!}
                poster={posterUrl}
                muted
                playsInline
                loop
                preload="none"
                onError={() => {
                  setHasVideoError(true);
                  setIsPlaying(false);
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  pointerEvents: 'none'
                }}
              />

              {/* Showcase Video Indicator Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 9px',
                  fontSize: '0.65rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  backgroundColor: 'rgba(18, 15, 13, 0.8)',
                  backdropFilter: 'blur(8px)',
                  color: 'var(--color-accent-gold)',
                  border: '1px solid rgba(197, 160, 89, 0.35)',
                  borderRadius: '9999px',
                  pointerEvents: 'none',
                  zIndex: 2
                }}
              >
                <Film size={11} strokeWidth={2} />
                <span>Motion</span>
              </div>

              {/* Accessible Pause / Play Overlay Control */}
              <button
                type="button"
                onClick={handleTogglePlayback}
                aria-label={isPlaying ? `Pause showcase video for ${product.name}` : `Play showcase video for ${product.name}`}
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(18, 15, 13, 0.75)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 3,
                  transition: 'all 0.2s ease'
                }}
              >
                {isPlaying ? <Pause size={12} strokeWidth={2.2} /> : <Play size={12} strokeWidth={2.2} style={{ marginLeft: '1px' }} />}
              </button>
            </>
          ) : product.primaryImageUrl && !hasImageError ? (
            <img
              src={product.primaryImageUrl}
              alt={product.name}
              onError={() => setHasImageError(true)}
              style={{
                maxHeight: '92%',
                maxWidth: '92%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.6))',
                transition: 'transform 0.5s ease'
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)'
              }}
            >
              <ImageIcon size={28} strokeWidth={1.2} color="var(--color-accent-gold)" />
              <span className="kicker" style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem' }}>
                Atelier Piece
              </span>
            </div>
          )}
        </div>

        {/* Product Information Body Matching Reference */}
        <div
          style={{
            padding: 'var(--space-5) var(--space-6)',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.52)',
                display: 'block',
                marginBottom: '4px'
              }}
            >
              {product.categoryName || 'LIVING ROOM'}
            </span>
            <h3
              style={{
                fontSize: '1.25rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                color: '#ffffff',
                marginBottom: '8px',
                lineHeight: 1.2
              }}
            >
              {product.name}
            </h3>
          </div>

          <div
            style={{
              marginTop: 'var(--space-3)',
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span
              style={{
                fontSize: '1.2rem',
                fontFamily: 'var(--font-serif)',
                color: 'var(--color-accent-gold)',
                fontWeight: 500
              }}
            >
              {clientConfig.features.enablePriceDisplay ? productService.formatPrice(product) : 'Price Upon Request'}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.65)',
                transition: 'color 0.2s ease'
              }}
            >
              View Piece →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
