import React, { useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Play } from 'lucide-react';
import { useCinematicHero } from '../../context/CinematicHeroContext';

export const CinematicHeroScroll: React.FC = () => {
  const { heroConfig, setScrollProgress } = useCinematicHero();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const textContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollCueRef = useRef<HTMLDivElement | null>(null);

  // Monitor scroll progression within the pinned hero track (Preserving exact engine math)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const track = trackRef.current;
          if (!track) {
            ticking = false;
            return;
          }

          const trackHeight = track.offsetHeight;
          const windowHeight = window.innerHeight;
          const totalScrollable = trackHeight - windowHeight;

          if (totalScrollable <= 0) {
            ticking = false;
            return;
          }

          const scrolled = window.scrollY;
          const progress = Math.min(Math.max(scrolled / totalScrollable, 0), 1);

          setScrollProgress(progress);

          // Progressive typography fade & drift:
          // 0.0 -> 0.22: Smoothly dissolves over the first ~22% of scroll progression
          const opacity = progress <= 0.22 ? Math.max(1 - (progress / 0.22) * 1.15, 0) : 0;
          const translateY = progress <= 0.22 ? -(progress / 0.22) * 36 : -36;

          if (textContainerRef.current) {
            textContainerRef.current.style.opacity = String(opacity);
            textContainerRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
            textContainerRef.current.style.pointerEvents = opacity > 0.15 ? 'auto' : 'none';
          }

          if (scrollCueRef.current) {
            scrollCueRef.current.style.opacity = String(opacity);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [setScrollProgress]);

  if (!heroConfig) return null;

  return (
    <div
      ref={trackRef}
      id="cinematic-hero-track"
      style={{
        position: 'relative',
        height: '300vh', // Preserved comfortable cinematic scroll distance
        width: '100%'
      }}
    >
      {/* Pinned Full-Screen Viewport Scene */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflow: 'hidden',
          zIndex: 2
        }}
      >
        {/* Full-Screen Minimalist Editorial Opening */}
        <div
          ref={textContainerRef}
          className="container"
          style={{
            position: 'relative',
            zIndex: 10,
            opacity: 1,
            transform: 'translate3d(0, 0px, 0)',
            willChange: 'opacity, transform',
            pointerEvents: 'auto'
          }}
        >
          <div
            style={{
              maxWidth: '760px',
              position: 'relative'
            }}
          >
            {/* Vertical Step Counter (01, 02, 03, 04) on left */}
            <div
              style={{
                position: 'absolute',
                left: '-48px',
                top: '12px',
                display: 'none',
                flexDirection: 'column',
                gap: '14px',
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                fontFamily: 'var(--font-sans)'
              }}
              className="step-indicator"
            >
              <span style={{ color: 'var(--color-accent-gold)', fontWeight: 600 }}>01</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.35)' }}>02</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.35)' }}>03</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.35)' }}>04</span>
            </div>

            {/* Architectural Kicker */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: 'var(--space-4)',
                color: 'var(--color-accent-gold)',
                fontSize: '0.75rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontWeight: 500,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)'
              }}
            >
              <span>{heroConfig.kicker || 'TIMELESS SPACES'}</span>
            </div>

            {/* Display Title */}
            <h1
              className="display-title"
              style={{
                marginBottom: 'var(--space-5)',
                color: '#ffffff',
                textShadow: '0 4px 30px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.9)',
                fontWeight: 300,
                lineHeight: 1.08,
                letterSpacing: '-0.015em',
                fontSize: 'clamp(2.8rem, 5.5vw, 4.6rem)'
              }}
            >
              Where Design<br />Meets Living
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 'clamp(1rem, 1.6vw, 1.25rem)',
                lineHeight: 1.7,
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: 'var(--space-8)',
                maxWidth: '620px',
                textShadow: '0 2px 16px rgba(0, 0, 0, 0.9)'
              }}
            >
              Handcrafted furniture for modern living spaces, inspired by nature, crafted for generations.
            </p>

            {/* CTA Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 'var(--space-4)'
              }}
            >
              <Link
                href="/catalogue"
                className="btn btn-gold"
                style={{
                  padding: '0.9rem 2.4rem',
                  fontSize: '0.82rem',
                  letterSpacing: '0.14em'
                }}
              >
                <span>Explore Catalogue</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/craftsmanship"
                className="btn btn-frosted"
                style={{
                  padding: '0.9rem 2rem',
                  fontSize: '0.82rem',
                  letterSpacing: '0.14em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Our Craftsmanship</span>
                <Play size={12} fill="#ffffff" stroke="none" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Pill Scroll Cue "(8) SCROLL TO EXPLORE" */}
        <div
          ref={scrollCueRef}
          style={{
            position: 'absolute',
            bottom: '36px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 20px',
            backgroundColor: 'rgba(20, 17, 14, 0.65)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '9999px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
            opacity: 1,
            willChange: 'opacity',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: '1px solid var(--color-accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent-gold)',
              fontSize: '0.62rem',
              fontWeight: 600
            }}
          >
            8
          </div>
          <span
            style={{
              fontSize: '0.68rem',
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-gold)',
              fontWeight: 500,
              textShadow: '0 2px 10px rgba(0,0,0,0.8)'
            }}
          >
            Scroll to Explore
          </span>
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .step-indicator {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
