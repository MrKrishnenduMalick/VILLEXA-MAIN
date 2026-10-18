import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCinematicHero } from '../../context/CinematicHeroContext';

const MAX_CACHE_SIZE = 60; // Bounded in-memory frame cache (keeps ~5-6 MB decoded memory)
const LOOKAHEAD_FRAMES = 16;
const LOOKBEHIND_FRAMES = 6;

export const CinematicShowroomBackground: React.FC = () => {
  const { heroConfig, scrollProgress, isHomePage, isHeroCompleted, setIsVideoReady } = useCinematicHero();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastRenderedImageRef = useRef<HTMLImageElement | null>(null);
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const pendingRequestsRef = useRef<Set<number>>(new Set());
  const activeTargetIndexRef = useRef<number>(1);

  const [isReady, setIsReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const frameSeq = heroConfig?.frameSequence;
  const frameCount = frameSeq?.frameCount || 384;

  // Compute frame URL for a given 1-based frame index
  const getFrameUrl = useCallback((index: number): string => {
    const clampedIndex = Math.min(Math.max(Math.round(index), 1), frameCount);
    if (frameSeq?.framePattern && frameSeq.framePattern.includes('{index}')) {
      const padded = String(clampedIndex).padStart(5, '0');
      return frameSeq.framePattern.replace('{index}', padded);
    }
    const padded = String(clampedIndex).padStart(5, '0');
    return `/hero-frames/frame-${padded}.webp`;
  }, [frameCount, frameSeq]);

  // 1. Accessibility: prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    media.addEventListener?.('change', listener);
    return () => media.removeEventListener?.('change', listener);
  }, []);

  // 2. High-DPI Canvas Resizing and object-fit cover rendering
  const drawImageToCanvas = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1600;
    const ih = img.naturalHeight || 900;

    const canvasRatio = cw / ch;
    const imageRatio = iw / ih;
    let renderW = cw;
    let renderH = ch;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imageRatio) {
      renderH = cw / imageRatio;
      offsetY = (ch - renderH) / 2;
    } else {
      renderW = ch * imageRatio;
      offsetX = (cw - renderW) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
    lastRenderedImageRef.current = img;
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    // Re-draw last valid frame or initial frame
    if (lastRenderedImageRef.current && lastRenderedImageRef.current.complete) {
      drawImageToCanvas(lastRenderedImageRef.current);
    }
  }, [drawImageToCanvas]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // 3. Image Preloader & Sliding Window Cache Management
  const loadFrame = useCallback((index: number): Promise<HTMLImageElement> => {
    const cache = imageCacheRef.current;
    const existing = cache.get(index);
    if (existing && existing.complete && existing.naturalWidth > 0) {
      return Promise.resolve(existing);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = getFrameUrl(index);

      img.onload = () => {
        pendingRequestsRef.current.delete(index);
        cache.set(index, img);

        // Enforce cache bound - evict furthest frames from current position
        if (cache.size > MAX_CACHE_SIZE) {
          const keys = Array.from(cache.keys());
          // Never evict frame 1 or finalFrame
          const candidates = keys.filter(k => k !== 1 && k !== frameCount);
          if (candidates.length > 0) {
            const evictKey = candidates[0];
            cache.delete(evictKey);
          }
        }

        resolve(img);
      };

      img.onerror = () => {
        pendingRequestsRef.current.delete(index);
        // Do not reject hard; fall back to last rendered frame to guarantee canvas never goes black
        if (lastRenderedImageRef.current) {
          resolve(lastRenderedImageRef.current);
        } else {
          reject(new Error(`Failed to load frame ${index}`));
        }
      };
    });
  }, [frameCount, getFrameUrl]);

  // 4. Initial Frame Load & Route Change Handling
  useEffect(() => {
    let isMounted = true;

    // Determine target initial frame based on route only
    const initialIndex = !isHomePage ? frameCount : 1;
    activeTargetIndexRef.current = initialIndex;

    loadFrame(initialIndex)
      .then((img) => {
        if (!isMounted || activeTargetIndexRef.current !== initialIndex) return;
        drawImageToCanvas(img);
        setIsReady(true);
        setIsVideoReady(true);
      })
      .catch(() => {
        // Fallback gracefully
        if (!isMounted) return;
        setIsReady(true);
      });

    // Also prime frame 1 and finalFrame in background
    loadFrame(1);
    loadFrame(frameCount);

    return () => {
      isMounted = false;
    };
  }, [isHomePage, frameCount, loadFrame, drawImageToCanvas, setIsVideoReady]);

  // 5. Scroll-Mapped Frame Rendering with Sliding Window Lookahead
  useEffect(() => {
    if (!isReady) return;

    // Determine active target frame index
    let targetIndex: number;

    if (!isHomePage || (isHeroCompleted && scrollProgress >= 0.99)) {
      targetIndex = frameCount; // Hold final frame behind all public pages and completed post-hero sections
    } else {
      // Linear mapping of scroll progress (0.0 -> 1.0) to frame (1 -> frameCount)
      const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1);
      targetIndex = Math.min(Math.max(Math.round(clampedProgress * (frameCount - 1)) + 1, 1), frameCount);
    }

    activeTargetIndexRef.current = targetIndex;
    let isCurrent = true;

    // Try drawing immediately if cached
    const cached = imageCacheRef.current.get(targetIndex);
    if (cached && cached.complete && cached.naturalWidth > 0) {
      drawImageToCanvas(cached);
    } else {
      // Frame not yet cached: request it, but DO NOT CLEAR CANVAS TO BLACK.
      // Retain last valid frame until new frame finishes decoding.
      loadFrame(targetIndex).then((img) => {
        if (!isCurrent || activeTargetIndexRef.current !== targetIndex) return;
        drawImageToCanvas(img);
      }).catch(() => {
        // Keep lastRenderedImageRef unchanged
      });
    }

    // Progressive lookahead & lookbehind sliding window preloading
    if (!prefersReducedMotion) {
      for (let offset = 1; offset <= LOOKAHEAD_FRAMES; offset++) {
        const ahead = targetIndex + offset;
        if (ahead <= frameCount && !imageCacheRef.current.has(ahead)) {
          loadFrame(ahead);
        }
      }
      for (let offset = 1; offset <= LOOKBEHIND_FRAMES; offset++) {
        const behind = targetIndex - offset;
        if (behind >= 1 && !imageCacheRef.current.has(behind)) {
          loadFrame(behind);
        }
      }
    }

    return () => {
      isCurrent = false;
    };
  }, [scrollProgress, isHomePage, isHeroCompleted, frameCount, isReady, prefersReducedMotion, drawImageToCanvas, loadFrame]);

  const fallbackPoster = (!isHomePage || (isHeroCompleted && scrollProgress >= 0.99))
    ? (frameSeq?.finalFrame || `/hero-frames/frame-${String(frameCount).padStart(5, '0')}.webp`)
    : (frameSeq?.firstFrame || '/hero-frames/frame-00001.webp');

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundColor: '#141210' // Warm architectural stone fallback (never stark empty black)
      }}
    >
      {/* 1. First Frame Instant Poster (Protects against flash before first render) */}
      {!isReady && (
        <img
          src={fallbackPoster}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            opacity: 0.95
          }}
        />
      )}

      {/* 2. Hardware-Accelerated Cinematic Frame Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'block',
          position: 'absolute',
          inset: 0,
          objectFit: 'cover'
        }}
      />

      {/* 3. Luxury Architectural Scrim Overlay (Delicate lighting, warm stone balance) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isHomePage && scrollProgress < 0.2
            ? 'radial-gradient(circle at 50% 35%, rgba(20, 18, 16, 0.28) 0%, rgba(20, 18, 16, 0.70) 100%)'
            : 'radial-gradient(circle at 50% 30%, rgba(20, 18, 16, 0.38) 0%, rgba(20, 18, 16, 0.82) 100%)',
          transition: 'background 0.4s ease'
        }}
      />

      {/* 4. Subtle Vignette Depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 140px rgba(0, 0, 0, 0.65)'
        }}
      />
    </div>
  );
};
