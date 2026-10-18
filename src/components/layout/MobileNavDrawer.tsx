import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { X, ArrowRight, Shield } from 'lucide-react';
import { useClientConfig } from '../../context/ClientConfigContext';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{ href: string; label: string; desc?: string }>;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  links
}) => {
  const config = useClientConfig();
  const [location] = useLocation();

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(19, 18, 17, 0.65)',
          backdropFilter: 'blur(8px)',
          transition: 'opacity var(--transition-normal)'
        }}
      />

      {/* Drawer Panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          height: '100%',
          background: 'rgba(248, 246, 241, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-elevated)',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--color-border-subtle)',
          marginBottom: 'var(--space-6)'
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4rem',
              letterSpacing: '0.12em',
              fontWeight: 400
            }}>
              {config.brand.logoText}
            </div>
            <div style={{
              fontSize: '0.65rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)'
            }}>
              {config.brand.logoSubtext}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Navigation"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              padding: 'var(--space-2)'
            }}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
          {links.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-4) var(--space-2)',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  color: isActive ? 'var(--color-accent-gold)' : 'var(--color-text-primary)',
                  transition: 'color var(--transition-fast)'
                }}
              >
                <div>
                  <div style={{
                    fontSize: '1.15rem',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 400
                  }}>
                    {link.label}
                  </div>
                  {link.desc && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      marginTop: '2px'
                    }}>
                      {link.desc}
                    </div>
                  )}
                </div>
                <ArrowRight size={14} strokeWidth={1.5} color={isActive ? 'var(--color-accent-gold)' : 'var(--color-text-muted)'} />
              </Link>
            );
          })}
        </nav>

        {/* Admin Gateway Footer Link */}
        <div style={{
          paddingTop: 'var(--space-6)',
          borderTop: '1px solid var(--color-border-subtle)',
          marginTop: 'var(--space-6)'
        }}>
          <Link
            href="/admin"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-3) var(--space-2)'
            }}
          >
            <Shield size={14} strokeWidth={1.5} />
            <span>Admin Gateway</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
