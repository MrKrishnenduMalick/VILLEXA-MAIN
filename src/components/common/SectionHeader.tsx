import React from 'react';

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  kicker,
  title,
  subtitle,
  align = 'center',
  className = ''
}) => {
  const isCenter = align === 'center';

  return (
    <div className={`section-header ${className}`} style={{
      textAlign: isCenter ? 'center' : 'left',
      maxWidth: isCenter ? '760px' : '100%',
      marginLeft: isCenter ? 'auto' : 0,
      marginRight: isCenter ? 'auto' : 0,
      marginBottom: 'var(--space-12)'
    }}>
      {kicker && (
        <span className="kicker" style={{ display: 'block', marginBottom: 'var(--space-3)' }}>
          {kicker}
        </span>
      )}
      <h2 className="section-title" style={{ marginBottom: subtitle ? 'var(--space-4)' : 0 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{
          fontSize: '1.05rem',
          maxWidth: '640px',
          marginLeft: isCenter ? 'auto' : 0,
          marginRight: isCenter ? 'auto' : 0
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
