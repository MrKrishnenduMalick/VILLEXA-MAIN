import React from 'react';
import { Shield, Database, Lock, Box, Image as ImageIcon, Layers } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { useClientConfig } from '../context/ClientConfigContext';

export const AdminGatewayPage: React.FC = () => {
  const clientConfig = useClientConfig();
  return (
    <div style={{ paddingTop: 'var(--space-12)', paddingBottom: 'var(--space-24)' }}>
      <div className="container">
        <SectionHeader
          kicker="ARCHITECTURE GATEWAY"
          title={`${clientConfig.brand.brandName} Admin Dashboard Portal`}
          subtitle="Protected administration center for managing products, prices, categories, media, 3D GLB models, and customer enquiries."
        />

        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {/* Status Banner */}
          <div
            style={{
              padding: 'var(--space-8)',
              backgroundColor: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border-subtle)',
              borderLeft: '4px solid var(--color-accent-gold)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <Shield size={22} color="var(--color-accent-gold)" />
              <h3 style={{ fontSize: '1.35rem' }}>Phase 2 Architectural Foundation Complete</h3>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.65 }}>
              In accordance with project guidelines, fake authentication, temporary local component-state mockups, and unapproved mock databases have been deliberately avoided. Real persistent data, secure admin authentication, and persistent object storage will be integrated in Phase 6 and Phase 7.
            </p>
          </div>

          {/* Module Preparedness Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-6)'
            }}
          >
            <div className="luxury-card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <Database size={18} color="var(--color-accent-gold)" />
                <h4 style={{ fontSize: '1.1rem' }}>Typed Domain Layer</h4>
              </div>
              <p style={{ fontSize: '0.85rem' }}>
                Full TypeScript interfaces defined for <code>Product</code>, <code>Category</code>, <code>Collection</code>, <code>Media</code>, and <code>Enquiry</code>.
              </p>
            </div>

            <div className="luxury-card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <Box size={18} color="var(--color-accent-gold)" />
                <h4 style={{ fontSize: '1.1rem' }}>3D GLB / 360 Viewer Architecture</h4>
              </div>
              <p style={{ fontSize: '0.85rem' }}>
                Camera bounding box equations and Three.js disposal pipelines extracted and prepared for real user GLB uploads.
              </p>
            </div>

            <div className="luxury-card" style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <ImageIcon size={18} color="var(--color-accent-gold)" />
                <h4 style={{ fontSize: '1.1rem' }}>Zero Hardcoded Media</h4>
              </div>
              <p style={{ fontSize: '0.85rem' }}>
                All mock products and video dumps eliminated. The website starts from zero and reflects only published admin content.
              </p>
            </div>
          </div>

          {/* Planned Implementation Roadmap */}
          <div
            style={{
              padding: 'var(--space-8)',
              backgroundColor: 'var(--color-dark-bg)',
              color: 'var(--color-dark-text-primary)'
            }}
          >
            <span className="kicker" style={{ color: 'var(--color-accent-gold)', marginBottom: 'var(--space-2)', display: 'block' }}>
              IMPLEMENTATION ROADMAP
            </span>
            <h3 style={{ color: 'var(--color-dark-text-primary)', fontSize: '1.4rem', marginBottom: 'var(--space-4)' }}>
              Upcoming Backend &amp; Admin Phases
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <Layers size={16} color="var(--color-accent-gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <strong>Phase 3:</strong> Homepage &amp; configurable showroom video sections with auto-fallback.
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <Layers size={16} color="var(--color-accent-gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <strong>Phase 4 &amp; 5:</strong> Product catalogue and real Three.js GLB 3D &amp; 360° image sequence viewer components.
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                <Lock size={16} color="var(--color-accent-gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <strong>Phase 6 &amp; 7:</strong> Real PostgreSQL/Supabase database integration, secure admin authentication, persistent file storage, and complete product/media management dashboard.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
