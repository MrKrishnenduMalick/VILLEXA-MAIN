import React from 'react';
import { Link } from 'wouter';
import { ArrowRight, Compass, Leaf, Award } from 'lucide-react';

export const CraftsmanshipPage: React.FC = () => {
  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-24)' }}>
      <div className="container">
        
        {/* Main Reference Hero Section (matching bottom-left quadrant) */}
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
            gap: 'var(--space-12)',
            alignItems: 'center',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(26, 22, 19, 0.90) 0%, rgba(18, 15, 13, 0.96) 100%)'
          }}
        >
          {/* Subtle background craftsman hands texture watermark */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '50%',
              backgroundImage: 'url(https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.18,
              maskImage: 'linear-gradient(to right, transparent 0%, black 80%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 80%)',
              pointerEvents: 'none'
            }}
          />

          {/* Left Column: Editorial Narrative matching Reference Image */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span className="kicker" style={{ color: 'var(--color-accent-gold)', marginBottom: 'var(--space-3)', display: 'block' }}>
              OUR CRAFTSMANSHIP
            </span>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.4rem, 4vw, 3.5rem)',
              fontWeight: 400,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: 'var(--space-5)'
            }}>
              Heritage in<br />Every Detail
            </h1>
            <p style={{
              fontSize: '1.05rem',
              lineHeight: 1.65,
              color: 'rgba(255, 255, 255, 0.85)',
              marginBottom: 'var(--space-8)',
              maxWidth: '480px'
            }}>
              We believe true luxury lies in the details. Each piece is a result of skilled craftsmanship, premium materials and a deep respect for timeless design.
            </p>
            <Link
              href="/contact?type=bespoke_commission"
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
              <span>Discover Our Process</span>
              <ArrowRight size={14} color="var(--color-accent-gold)" />
            </Link>
          </div>

          {/* Right Column: 3 Floating Smoked Glass Cards (Matching Reference Image) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', position: 'relative', zIndex: 2 }}>
            
            {/* Card 1: Premium Materials */}
            <div
              className="glass-panel"
              style={{
                padding: 'var(--space-5) var(--space-6)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                background: 'rgba(28, 24, 20, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.16)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(197, 160, 89, 0.15)',
                  border: '1px solid rgba(197, 160, 89, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Compass size={20} color="var(--color-accent-gold)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff', fontFamily: 'var(--font-sans)', fontWeight: 600, margin: '0 0 3px' }}>
                  Premium Materials
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.70)', margin: 0 }}>
                  Sourced from nature, built to last.
                </p>
              </div>
            </div>

            {/* Card 2: Handcrafted Excellence */}
            <div
              className="glass-panel"
              style={{
                padding: 'var(--space-5) var(--space-6)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                background: 'rgba(28, 24, 20, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.16)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(197, 160, 89, 0.15)',
                  border: '1px solid rgba(197, 160, 89, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Award size={20} color="var(--color-accent-gold)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff', fontFamily: 'var(--font-sans)', fontWeight: 600, margin: '0 0 3px' }}>
                  Handcrafted Excellence
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.70)', margin: 0 }}>
                  By skilled artisans, with passion.
                </p>
              </div>
            </div>

            {/* Card 3: Sustainable Approach */}
            <div
              className="glass-panel"
              style={{
                padding: 'var(--space-5) var(--space-6)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                background: 'rgba(28, 24, 20, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.16)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(197, 160, 89, 0.15)',
                  border: '1px solid rgba(197, 160, 89, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Leaf size={20} color="var(--color-accent-gold)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', color: '#ffffff', fontFamily: 'var(--font-sans)', fontWeight: 600, margin: '0 0 3px' }}>
                  Sustainable Approach
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.70)', margin: 0 }}>
                  For a better tomorrow.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Narrative Section 2: Mortise & Tenon Timeless Joinery */}
        <div
          className="luxury-glass-card"
          style={{
            padding: 'var(--space-12) var(--space-8)',
            borderRadius: '24px',
            textAlign: 'center'
          }}
        >
          <span className="kicker" style={{ color: 'var(--color-accent-gold)', marginBottom: 'var(--space-3)', display: 'block' }}>
            02 / TIMELESS JOINERY
          </span>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            color: '#ffffff',
            fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)',
            fontWeight: 400,
            maxWidth: '720px',
            margin: '0 auto var(--space-5)'
          }}>
            Mortise, Tenon, and Hidden Dovetails
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.82)', maxWidth: '640px', margin: '0 auto var(--space-8)', fontSize: '1.05rem', lineHeight: 1.6 }}>
            Each joint is hand-fitted to tolerate seasonal timber movement. We reject rapid fastener shortcuts, building heirlooms engineered to outlast generations.
          </p>
          <Link href="/contact?type=bespoke_commission" className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', fontWeight: 600 }}>
            <span>Inquire About Bespoke Craftsmanship</span>
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
};
