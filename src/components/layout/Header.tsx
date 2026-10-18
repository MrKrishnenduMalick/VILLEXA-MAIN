import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, Search, User } from 'lucide-react';
import { MobileNavDrawer } from './MobileNavDrawer';
import { useClientConfig } from '../../context/ClientConfigContext';

export const Header: React.FC = () => {
  const config = useClientConfig();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', show: true },
    { href: '/catalogue', label: 'Catalogue', show: true },
    { href: '/collections', label: 'Collections', show: config.features.enableCollections },
    { href: '/craftsmanship', label: 'Craftsmanship', show: config.features.enableCraftsmanshipStory },
    { href: '/inspiration', label: 'Inspiration', show: config.features.enableInspirationRooms },
    { href: '/contact', label: 'Contact', show: true }
  ].filter((l) => l.show);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          width: '100%',
          backgroundColor: isScrolled
            ? 'rgba(16, 13, 11, 0.82)'
            : 'rgba(20, 17, 14, 0.65)',
          backdropFilter: 'blur(24px) saturate(140%)',
          WebkitBackdropFilter: 'blur(24px) saturate(140%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: isScrolled
            ? '0 12px 36px 0 rgba(0, 0, 0, 0.60), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
            : '0 4px 20px 0 rgba(0, 0, 0, 0.35)',
          transition: 'all var(--transition-normal)'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '76px'
          }}
        >
          {/* Brand Logo Matching Reference */}
          <Link
            href="/"
            style={{
              display: 'flex',
              flexDirection: 'column',
              textDecoration: 'none'
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.75rem',
                letterSpacing: '0.14em',
                fontWeight: 400,
                color: '#ffffff',
                lineHeight: 1,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}
            >
              VILLEXA
            </span>
            <span
              style={{
                fontSize: '0.58rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'var(--color-accent-gold)',
                fontWeight: 500,
                marginTop: '4px'
              }}
            >
              EDIZIONI ARCHITETTONICHE
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 'var(--space-8)'
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => {
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.78rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                    fontWeight: isActive ? 500 : 400,
                    position: 'relative',
                    padding: 'var(--space-2) 0',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)';
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '2px',
                        backgroundColor: 'var(--color-accent-gold)',
                        boxShadow: '0 0 8px rgba(197, 160, 89, 0.6)'
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons Matching Reference Image */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {/* Search Icon */}
            <Link
              href="/catalogue"
              aria-label="Search Catalogue"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.85)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-accent-gold)';
                e.currentTarget.style.borderColor = 'var(--color-accent-gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <Search size={16} />
            </Link>

            {/* Admin / Profile Icon */}
            <Link
              href="/admin"
              aria-label="Admin Portal"
              title="Admin Portal"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.85)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-accent-gold)';
                e.currentTarget.style.borderColor = 'var(--color-accent-gold)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <User size={16} />
            </Link>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open Navigation Menu"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                cursor: 'pointer',
                color: '#ffffff'
              }}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        <style>{`
          @media (min-width: 992px) {
            .desktop-nav {
              display: flex !important;
            }
          }
        `}</style>
      </header>

      {/* Accessible Mobile Drawer */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        links={navLinks}
      />
    </>
  );
};
