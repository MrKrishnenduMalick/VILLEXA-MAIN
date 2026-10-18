import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { collectionService } from '../services/collectionService';
import { RoomInspiration } from '../types/collection';

interface Vignette {
  id: string;
  title: string;
  room: string;
  imageUrl: string;
  description: string;
}

const INAUGURAL_VIGNETTES: Vignette[] = [
  {
    id: 'v1',
    title: 'The Solarium Salon',
    room: 'Penthouse Salon',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80',
    description: 'Natural southern illumination caressing organic bouclé curved lounge seating and honed roman travertine.'
  },
  {
    id: 'v2',
    title: 'Atelier Botanical Study',
    room: 'Private Library',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
    description: 'Deep French walnut shelving paired with a single sculptural ficus and brushed brass ambient glow.'
  },
  {
    id: 'v3',
    title: 'Minimalist Dining Haven',
    room: 'Formal Dining',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80',
    description: 'Monolithic Calacatta Viola table anchored beneath hand-blown smoked Murano glass pendants.'
  },
  {
    id: 'v4',
    title: 'Terrace at Twilight',
    room: 'Outdoor Loggia',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
    description: 'Low-slung teakwood daybeds framing panoramic metropolitan skyline vistas.'
  }
];

const DEFAULT_VIGNETTE_FALLBACK = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80';

export const InspirationPage: React.FC = () => {
  const [inspirations, setInspirations] = useState<RoomInspiration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInspirations() {
      try {
        const loaded = await collectionService.getRoomInspirations();
        setInspirations(loaded);
      } finally {
        setIsLoading(false);
      }
    }
    loadInspirations();
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-24) 0', textAlign: 'center' }}>
        <span className="kicker">PREPARING SPATIAL ARCHIVE...</span>
      </div>
    );
  }

  // Combine DB inspirations with inaugural reference vignettes
  const allVignettes: Vignette[] = [
    ...inspirations
      .filter((i) => Boolean(i.imageUrl))
      .map((i) => ({
        id: i.id,
        title: i.title,
        room: i.roomType.toUpperCase(),
        imageUrl: i.imageUrl as string,
        description: i.description
      })),
    ...INAUGURAL_VIGNETTES
  ];

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-24)' }}>
      <div className="container">
        
        {/* Main Reference Banner (matching bottom-middle quadrant of reference) */}
        <div
          className="luxury-glass-card"
          style={{
            borderRadius: '24px',
            padding: 'var(--space-12) var(--space-10)',
            marginBottom: 'var(--space-16)',
            position: 'relative',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 'var(--space-10)',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Editorial Headline & Copy */}
          <div>
            <span className="kicker" style={{ color: 'var(--color-accent-gold)', marginBottom: 'var(--space-3)', display: 'block' }}>
              INSPIRATION
            </span>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.4rem, 4vw, 3.5rem)',
              fontWeight: 400,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: 'var(--space-5)'
            }}>
              Ideas for a<br />Beautiful Tomorrow
            </h1>
            <p style={{
              fontSize: '1.05rem',
              lineHeight: 1.65,
              color: 'rgba(255, 255, 255, 0.85)',
              marginBottom: 'var(--space-8)',
              maxWidth: '460px'
            }}>
              Explore spaces, materials and stories that inspire thoughtful, timeless living. Each spatial composition is conceived by our Milanese architectural studio.
            </p>
            <Link
              href="/catalogue"
              className="glass-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: '10px 24px',
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#ffffff',
                textDecoration: 'none'
              }}
            >
              <span>Discover Inspiration</span>
              <ArrowRight size={14} color="var(--color-accent-gold)" />
            </Link>
          </div>

          {/* Right Column: Overlapping Vignette Cards (matching reference) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', position: 'relative' }}>
            <div
              style={{
                height: '280px',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255, 255, 255, 0.16)'
              }}
            >
              <img
                src={INAUGURAL_VIGNETTES[0].imageUrl}
                alt={INAUGURAL_VIGNETTES[0].title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(16, 13, 11, 0.85) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
                <span className="kicker" style={{ fontSize: '0.65rem', color: 'var(--color-accent-gold)' }}>VIGNETTE 01</span>
                <div style={{ color: '#ffffff', fontSize: '0.9rem', fontFamily: 'var(--font-serif)' }}>{INAUGURAL_VIGNETTES[0].title}</div>
              </div>
            </div>

            <div
              style={{
                height: '280px',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                marginTop: 'var(--space-6)'
              }}
            >
              <img
                src={INAUGURAL_VIGNETTES[1].imageUrl}
                alt={INAUGURAL_VIGNETTES[1].title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(16, 13, 11, 0.85) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
                <span className="kicker" style={{ fontSize: '0.65rem', color: 'var(--color-accent-gold)' }}>VIGNETTE 02</span>
                <div style={{ color: '#ffffff', fontSize: '0.9rem', fontFamily: 'var(--font-serif)' }}>{INAUGURAL_VIGNETTES[1].title}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Grid of Vignettes */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <SectionHeader
            kicker="SPATIAL COMPOSITIONS"
            title="Curated Architectural Studies"
            subtitle="Explore how light, volume, and material texture coalesce within private residences."
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)' }}>
            {allVignettes.map((vig) => (
              <div
                key={vig.id}
                className="luxury-glass-card"
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <div style={{ height: '240px', borderRadius: '14px', overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(28, 24, 20, 0.6)' }}>
                  <img
                    src={vig.imageUrl}
                    alt={vig.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== DEFAULT_VIGNETTE_FALLBACK) {
                        target.src = DEFAULT_VIGNETTE_FALLBACK;
                      } else {
                        target.style.opacity = '0';
                      }
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(16, 13, 11, 0.70) 0%, transparent 50%)' }} />
                  <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{vig.room}</span>
                  </div>
                </div>
                <div style={{ padding: 'var(--space-4) var(--space-2) var(--space-2)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: '#ffffff', margin: '0 0 var(--space-2)' }}>
                    {vig.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.5, margin: '0 0 var(--space-4)' }}>
                    {vig.description}
                  </p>
                  <Link
                    href="/catalogue"
                    className="glass-pill"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '6px 14px'
                    }}
                  >
                    <span>View Suite In Catalogue</span>
                    <ArrowRight size={12} color="var(--color-accent-gold)" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
