import React from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Shield } from 'lucide-react';
import { useClientConfig } from '../../context/ClientConfigContext';

export const Footer: React.FC = () => {
  const config = useClientConfig();

  return (
    <footer
      style={{
        backgroundColor: 'rgba(14, 12, 10, 0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: 'var(--color-dark-text-primary)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: 'var(--space-12)',
        paddingBottom: 'var(--space-8)',
        marginTop: 'auto',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-8)',
            paddingBottom: 'var(--space-10)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          {/* Brand Column */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.65rem',
                letterSpacing: '0.12em',
                fontWeight: 300,
                color: 'var(--color-dark-text-primary)',
                display: 'block',
                marginBottom: 'var(--space-2)'
              }}
            >
              {config.brand.brandName}
            </span>
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.65)',
                fontSize: '0.82rem',
                lineHeight: 1.6,
                maxWidth: '280px',
                marginBottom: 'var(--space-4)'
              }}
            >
              {config.brand.description}
            </p>
            <div className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
              {config.brand.badge}
            </div>
          </div>

          {/* Navigation Column */}
          <div>
            <h4
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-accent-gold)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                marginBottom: 'var(--space-4)'
              }}
            >
              Exhibition &amp; Works
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <li>
                <Link
                  href="/catalogue"
                  style={{
                    color: 'rgba(255, 255, 255, 0.72)',
                    fontSize: '0.82rem',
                    transition: 'color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)')}
                >
                  Master Catalogue
                </Link>
              </li>
              {config.features.enableCollections && (
                <li>
                  <Link
                    href="/collections"
                    style={{
                      color: 'rgba(255, 255, 255, 0.72)',
                      fontSize: '0.82rem',
                      transition: 'color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)')}
                  >
                    Architectural Collections
                  </Link>
                </li>
              )}
              {config.features.enableCraftsmanshipStory && (
                <li>
                  <Link
                    href="/craftsmanship"
                    style={{
                      color: 'rgba(255, 255, 255, 0.72)',
                      fontSize: '0.82rem',
                      transition: 'color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)')}
                  >
                    Materiality &amp; Craftsmanship
                  </Link>
                </li>
              )}
              {config.features.enableInspirationRooms && (
                <li>
                  <Link
                    href="/inspiration"
                    style={{
                      color: 'rgba(255, 255, 255, 0.72)',
                      fontSize: '0.82rem',
                      transition: 'color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)')}
                  >
                    Room Inspirations
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Showroom & Concierge Column */}
          <div>
            <h4
              style={{
                fontSize: '0.75rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--color-accent-gold)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                marginBottom: 'var(--space-4)'
              }}
            >
              Atelier &amp; Showroom
            </h4>
            <div style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '0.82rem', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 'var(--space-1)' }}>
                {config.contact.showroomAddress}
              </p>
              <p style={{ marginBottom: 'var(--space-3)' }}>
                {config.contact.visitingHours}
              </p>
              <Link
                href="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  color: 'var(--color-accent-gold)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}
              >
                <span>Request Appointment</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            paddingTop: 'var(--space-6)',
            fontSize: '0.75rem',
            color: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          <div>
            &copy; {new Date().getFullYear()} {config.brand.brandName} {config.brand.tagline}. All architectural rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
            <Link
              href="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.72rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              <Shield size={11} />
              <span>Admin Portal Area</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
