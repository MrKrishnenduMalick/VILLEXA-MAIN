import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Hammer, Feather, Leaf } from 'lucide-react';
import { CatalogueProductCard } from '../components/common/CatalogueProductCard';
import { productService } from '../services/productService';
import { Product } from '../types/product';
import { CinematicHeroScroll } from '../components/home/CinematicHeroScroll';
import { INAUGURAL_CATALOGUE } from '../config/inauguralCatalogue';

const INAUGURAL_FEATURED: Product[] = INAUGURAL_CATALOGUE.slice(0, 4);

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(INAUGURAL_FEATURED);

  useEffect(() => {
    async function loadData() {
      try {
        const products = await productService.getFeaturedProducts();
        if (products && products.length > 0) {
          setFeaturedProducts(products.slice(0, 4));
        }
      } catch {
        // Retain initial fallbacks safely
      }
    }
    loadData();
  }, []);

  const signaturePieces = featuredProducts.length > 0 ? featuredProducts : INAUGURAL_FEATURED;

  return (
    <div>
      {/* 1. SCROLL-CONTROLLED CINEMATIC HERO SEQUENCE */}
      <CinematicHeroScroll />

      {/* 2. SECTION A — COLLECTION INTRODUCTION */}
      <section
        id="collection-intro"
        className="section scroll-reveal"
        style={{
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 10,
          paddingTop: 'var(--space-20)',
          paddingBottom: 'var(--space-12)'
        }}
      >
        <div className="container-narrow">
          <div
            className="luxury-glass-card"
            style={{
              padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1.8rem, 4vw, 3.5rem)',
              textAlign: 'center',
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Luminous Inner Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-80px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '320px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(197, 160, 89, 0.22) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />

            <span
              className="kicker"
              style={{
                display: 'block',
                marginBottom: 'var(--space-4)',
                letterSpacing: '0.24em',
                color: 'var(--color-accent-gold)'
              }}
            >
              VILLEXA — THE COLLECTION
            </span>

            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                fontWeight: 300,
                color: '#ffffff',
                lineHeight: 1.14,
                marginBottom: 'var(--space-5)',
                letterSpacing: '-0.01em'
              }}
            >
              Spaces, Shaped by Craft.
            </h2>

            <p
              style={{
                fontSize: 'clamp(1.02rem, 1.4vw, 1.18rem)',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.75,
                maxWidth: '640px',
                margin: '0 auto var(--space-8)'
              }}
            >
              A considered collection of furniture, materials and forms for distinctive interiors.
            </p>

            <Link
              href="/catalogue"
              className="btn btn-gold"
              style={{
                padding: '0.9rem 2.4rem',
                fontSize: '0.82rem',
                letterSpacing: '0.14em'
              }}
            >
              <span>EXPLORE THE COLLECTION</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. SECTION B — EXPLORE BY CATEGORY */}
      <section
        id="explore-categories"
        className="section scroll-reveal"
        style={{
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 10,
          paddingTop: 'var(--space-8)',
          paddingBottom: 'var(--space-16)'
        }}
      >
        <div className="container">
          <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
            <span className="kicker" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
              CURATED DISCIPLINES
            </span>
            <h2 className="section-title">
              Explore by Category
            </h2>
            <p style={{ maxWidth: '540px', margin: '6px auto 0' }}>
              Architectural furniture tailored for distinct zones of contemporary living.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {/* Category 1: Seating */}
            <Link
              href="/catalogue?category=seating"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div
                className="luxury-glass-card category-card"
                style={{
                  height: '340px',
                  borderRadius: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 'var(--space-6)'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=85"
                  alt="Seating"
                  className="category-bg-img"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.62,
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(16, 14, 12, 0.95) 0%, rgba(16, 14, 12, 0.35) 55%, transparent 100%)'
                  }}
                />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <span style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    ZONE 01
                  </span>
                  <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', fontWeight: 300, color: '#ffffff', marginBottom: '6px' }}>
                    Seating
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.76)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
                    Sculptural armchairs, lounge seating and tailored benches for repose.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent-gold)', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
                    <span>View Seating</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </Link>

            {/* Category 2: Living */}
            <Link
              href="/catalogue?category=living"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div
                className="luxury-glass-card category-card"
                style={{
                  height: '340px',
                  borderRadius: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 'var(--space-6)'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85"
                  alt="Living"
                  className="category-bg-img"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.62,
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(16, 14, 12, 0.95) 0%, rgba(16, 14, 12, 0.35) 55%, transparent 100%)'
                  }}
                />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <span style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    ZONE 02
                  </span>
                  <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', fontWeight: 300, color: '#ffffff', marginBottom: '6px' }}>
                    Living
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.76)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
                    Low tables, monolithic credenzas and architectural centerpieces.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent-gold)', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
                    <span>View Living</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </Link>

            {/* Category 3: Bedroom */}
            <Link
              href="/catalogue?category=bedroom"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div
                className="luxury-glass-card category-card"
                style={{
                  height: '340px',
                  borderRadius: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: 'var(--space-6)'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=85"
                  alt="Bedroom"
                  className="category-bg-img"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.62,
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(16, 14, 12, 0.95) 0%, rgba(16, 14, 12, 0.35) 55%, transparent 100%)'
                  }}
                />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <span style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    ZONE 03
                  </span>
                  <h3 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-serif)', fontWeight: 300, color: '#ffffff', marginBottom: '6px' }}>
                    Bedroom
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.76)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
                    Sensorial bouclé platform beds, nightstands and sanctuary forms.
                  </p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent-gold)', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
                    <span>View Bedroom</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SECTION C — SIGNATURE PIECES */}
      <section
        id="signature-pieces"
        className="section scroll-reveal"
        style={{
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 10,
          paddingTop: 'var(--space-8)',
          paddingBottom: 'var(--space-16)'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 'var(--space-10)',
              flexWrap: 'wrap',
              gap: 'var(--space-4)'
            }}
          >
            <div>
              <span className="kicker" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                CURATED EDITIONS
              </span>
              <h2 className="section-title">
                Signature Pieces
              </h2>
              <p style={{ maxWidth: '580px', marginTop: '6px' }}>
                Handcrafted architectural masterworks using actual atelier specifications and noble materials.
              </p>
            </div>
            <Link
              href="/catalogue"
              className="btn btn-frosted"
              style={{ fontSize: '0.78rem', padding: '0.65rem 1.5rem' }}
            >
              <span>Explore All Pieces</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            {signaturePieces.map((p) => (
              <CatalogueProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECTION D — MATERIALITY AND CRAFTSMANSHIP */}
      <section
        id="materiality-craftsmanship"
        className="section scroll-reveal"
        style={{
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 10,
          paddingTop: 'var(--space-8)',
          paddingBottom: 'var(--space-16)'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(280px, 420px) 1fr',
              gap: 'var(--space-12)',
              alignItems: 'center'
            }}
            className="craftsmanship-grid-wrap"
          >
            {/* Left Narrative */}
            <div>
              <span className="kicker" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>
                THE ATELIER PHILOSOPHY
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                  fontWeight: 300,
                  color: '#ffffff',
                  lineHeight: 1.15,
                  marginBottom: 'var(--space-4)'
                }}
              >
                Materiality &amp;<br />Craftsmanship
              </h2>
              <p style={{ marginBottom: 'var(--space-8)', color: 'rgba(255, 255, 255, 0.82)', lineHeight: 1.7 }}>
                We believe true luxury is tactile. Every silhouette is conceived with deliberate proportion, executed in noble materials, and finished to age with dignity.
              </p>
              <Link href="/craftsmanship" className="btn btn-frosted">
                <span>Discover Our Process</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Three Concise Themes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Theme 1: Natural Materials */}
              <div
                className="luxury-glass-card"
                style={{
                  padding: 'var(--space-6)',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-5)'
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(197, 160, 89, 0.15)',
                    border: '1px solid rgba(197, 160, 89, 0.35)',
                    color: 'var(--color-accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Leaf size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '4px', fontWeight: 400 }}>
                    Natural Materials
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.74)', lineHeight: 1.6, margin: 0 }}>
                    Sourced from sustainable European forests, vein-matched Italian quarries, and virgin wool bouclé looms for authentic grain and tactile depth.
                  </p>
                </div>
              </div>

              {/* Theme 2: Considered Proportions */}
              <div
                className="luxury-glass-card"
                style={{
                  padding: 'var(--space-6)',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-5)'
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(197, 160, 89, 0.15)',
                    border: '1px solid rgba(197, 160, 89, 0.35)',
                    color: 'var(--color-accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Feather size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '4px', fontWeight: 400 }}>
                    Considered Proportions
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.74)', lineHeight: 1.6, margin: 0 }}>
                    Balancing monumental presence with airy lightness. Each curve and negative space is engineered to anchor architectural volumes with serenity.
                  </p>
                </div>
              </div>

              {/* Theme 3: Made to Last */}
              <div
                className="luxury-glass-card"
                style={{
                  padding: 'var(--space-6)',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-5)'
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(197, 160, 89, 0.15)',
                    border: '1px solid rgba(197, 160, 89, 0.35)',
                    color: 'var(--color-accent-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Hammer size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#ffffff', marginBottom: '4px', fontWeight: 400 }}>
                    Made to Last
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.74)', lineHeight: 1.6, margin: 0 }}>
                    Artisanal mortise joinery, reinforced internal frames, and hand-rubbed organic wax finishes designed to mature into a rich generational patina.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION E — INTERIOR INSPIRATION */}
      <section
        id="interior-inspiration"
        className="section scroll-reveal"
        style={{
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 10,
          paddingTop: 'var(--space-8)',
          paddingBottom: 'var(--space-16)'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(280px, 420px) 1fr',
              gap: 'var(--space-12)',
              alignItems: 'center'
            }}
            className="inspiration-grid-wrap"
          >
            {/* Left Narrative */}
            <div>
              <span className="kicker" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>
                CURATED SPACES
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                  fontWeight: 300,
                  color: '#ffffff',
                  lineHeight: 1.15,
                  marginBottom: 'var(--space-4)'
                }}
              >
                Interior<br />Inspiration
              </h2>
              <p style={{ marginBottom: 'var(--space-8)', color: 'rgba(255, 255, 255, 0.82)', lineHeight: 1.7 }}>
                Explore curated rooms and architectural compositions designed to foster calm, light, and enduring beauty.
              </p>
              <Link href="/inspiration" className="btn btn-frosted">
                <span>Explore All Rooms</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right Vignettes with Valid Routes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 'var(--space-5)'
              }}
            >
              <Link href="/collections" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  className="luxury-glass-card inspiration-tile"
                  style={{
                    height: '280px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=85"
                    alt="The Warm Salon"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(16, 14, 12, 0.9) 0%, transparent 60%)'
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '18px', left: '18px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-accent-gold)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
                      VIGNETTE 01
                    </span>
                    <h4 style={{ fontSize: '1.1rem', color: '#ffffff', margin: '3px 0 0', fontWeight: 400 }}>
                      The Warm Salon
                    </h4>
                  </div>
                </div>
              </Link>

              <Link href="/collections" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  className="luxury-glass-card inspiration-tile"
                  style={{
                    height: '280px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=85"
                    alt="The Atrium Lounge"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(16, 14, 12, 0.9) 0%, transparent 60%)'
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '18px', left: '18px' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-accent-gold)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>
                      VIGNETTE 02
                    </span>
                    <h4 style={{ fontSize: '1.1rem', color: '#ffffff', margin: '3px 0 0', fontWeight: 400 }}>
                      The Atrium Lounge
                    </h4>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION F — BESPOKE COMMISSIONS */}
      <section
        id="bespoke-commissions"
        className="section scroll-reveal"
        style={{
          backgroundColor: 'transparent',
          position: 'relative',
          zIndex: 10,
          paddingTop: 'var(--space-8)',
          paddingBottom: 'var(--space-20)'
        }}
      >
        <div className="container-narrow">
          <div
            className="glass-panel-elevated"
            style={{
              padding: 'clamp(2.5rem, 5vw, 3.5rem) clamp(1.8rem, 4vw, 3rem)',
              textAlign: 'center',
              borderRadius: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Ambient Gold Scrim */}
            <div
              style={{
                position: 'absolute',
                top: '-60px',
                right: '15%',
                width: '240px',
                height: '150px',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(197, 160, 89, 0.2) 0%, transparent 70%)',
                pointerEvents: 'none'
              }}
            />

            <span className="kicker" style={{ marginBottom: 'var(--space-3)', display: 'block', letterSpacing: '0.22em' }}>
              BESPOKE ATELIER
            </span>

            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#ffffff',
                marginBottom: 'var(--space-4)',
                fontWeight: 300,
                fontFamily: 'var(--font-serif)'
              }}
            >
              Made for Your Space.
            </h2>

            <p
              style={{
                fontSize: '1.05rem',
                color: 'rgba(255, 255, 255, 0.84)',
                maxWidth: '600px',
                margin: '0 auto var(--space-8)',
                lineHeight: 1.7
              }}
            >
              We collaborate directly with architects, interior curators, and discerning private patrons to tailor proportions, custom wood selections, and exclusive upholstery for unique spaces.
            </p>

            <Link href="/contact" className="btn btn-gold" style={{ padding: '0.9rem 2.4rem' }}>
              <span>Request Bespoke Commission</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .category-card:hover .category-bg-img {
          transform: scale(1.05);
          opacity: 0.75 !important;
        }
        .inspiration-tile:hover img {
          transform: scale(1.05);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @media (max-width: 900px) {
          .craftsmanship-grid-wrap,
          .inspiration-grid-wrap {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
