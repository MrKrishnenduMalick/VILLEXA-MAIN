import React from 'react';
import { Link } from 'wouter';
import { Package, Film, Sparkles, Box } from 'lucide-react';

interface EmptyStateProps {
  type?: 'catalogue' | 'collections' | 'media' | 'viewer' | 'generic';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  className = ''
}) => {
  // Pre-configured deliberate luxury copy per type
  const configs = {
    catalogue: {
      icon: Package,
      defaultTitle: 'The Catalogue Is Currently Being Curated',
      defaultDesc: 'Our master artisans are finalizing the next edition of architectural creations. Check back shortly or request a private consultation for bespoke commissions.',
      defaultAction: 'Inquire with Atelier',
      defaultHref: '/contact'
    },
    collections: {
      icon: Sparkles,
      defaultTitle: 'Curated Collections in Preparation',
      defaultDesc: 'Seasonal architectural narratives are being assembled in our atelier. Explore our brand story or register for the private catalogue release.',
      defaultAction: 'View Craftsmanship',
      defaultHref: '/craftsmanship'
    },
    media: {
      icon: Film,
      defaultTitle: 'Showroom Video In Curation',
      defaultDesc: 'Cinematic showroom walkthrough footage will be premiered soon. Experience our atelier through private appointments.',
      defaultAction: 'Book Private Viewing',
      defaultHref: '/contact'
    },
    viewer: {
      icon: Box,
      defaultTitle: 'Interactive 3D Asset Pending',
      defaultDesc: 'The 3D architectural model for this piece has not been uploaded yet. High-resolution gallery photography is available above.',
      defaultAction: 'Request Dimensions & Specs',
      defaultHref: '/contact'
    },
    generic: {
      icon: Sparkles,
      defaultTitle: 'Content in Atelier Curation',
      defaultDesc: 'This section is being carefully prepared by our design directors.',
      defaultAction: 'Return Home',
      defaultHref: '/'
    }
  };

  const current = configs[type];
  const IconComponent = current.icon;
  const displayTitle = title || current.defaultTitle;
  const displayDesc = description || current.defaultDesc;
  const displayAction = actionLabel || current.defaultAction;
  const targetHref = actionHref || current.defaultHref;

  return (
    <div className={`empty-state-card ${className}`} style={{
      padding: 'var(--space-16) var(--space-8)',
      background: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border-subtle)',
      textAlign: 'center',
      maxWidth: '720px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-4)'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        color: 'var(--color-accent-gold)',
        marginBottom: 'var(--space-2)'
      }}>
        <IconComponent size={24} strokeWidth={1.5} />
      </div>

      <span className="kicker">ATELIER NOTICE</span>

      <h3 style={{
        fontSize: '1.65rem',
        fontWeight: 300,
        maxWidth: '520px',
        lineHeight: 1.25
      }}>
        {displayTitle}
      </h3>

      <p style={{
        maxWidth: '480px',
        fontSize: '0.95rem',
        lineHeight: 1.65,
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--space-4)'
      }}>
        {displayDesc}
      </p>

      {displayAction && (
        targetHref ? (
          <Link href={targetHref} className="btn btn-primary">
            {displayAction}
          </Link>
        ) : (
          <button onClick={onActionClick} className="btn btn-primary">
            {displayAction}
          </button>
        )
      )}
    </div>
  );
};
