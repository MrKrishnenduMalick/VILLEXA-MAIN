import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Save, Check, Film, ArrowRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { siteConfigService } from '../../services/siteConfigService';
import { HeroConfig, BrandSettings } from '../../types/content';

export const AdminSiteSettings: React.FC = () => {
  const [hero, setHero] = useState<HeroConfig>({
    kicker: '',
    title: '',
    subtitle: '',
    primaryCtaLabel: '',
    primaryCtaLink: '',
    secondaryCtaLabel: '',
    secondaryCtaLink: '',
    mediaType: 'none',
    mediaUrl: null
  });

  const [brand, setBrand] = useState<BrandSettings>({
    brandName: '',
    tagline: '',
    contactEmail: '',
    contactPhone: '',
    whatsappNumber: '',
    showroomAddress: '',
    visitingHours: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    async function load() {
      const cfg = await siteConfigService.getSiteConfig();
      setHero(cfg.hero);
      setBrand(cfg.brand);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(false);

    try {
      await Promise.all([
        adminService.saveSiteSettings('hero', hero),
        adminService.saveSiteSettings('brand', brand)
      ]);
      setSuccessMsg(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <span className="kicker">GLOBAL CONFIGURATION</span>
        <h1 style={{ fontSize: '2rem', marginTop: '4px' }}>Brand &amp; Hero Settings</h1>
      </div>

      {successMsg && (
        <div style={{ padding: 'var(--space-4)', background: 'rgba(40, 167, 69, 0.1)', border: '1px solid #28a745', color: '#28a745', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={16} />
          <span>Brand and Hero settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        {/* Hero Section */}
        <div className="luxury-card" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-3)' }}>
            <h3 style={{ fontSize: '1.25rem' }}>
              Homepage Hero Text &amp; CTAs
            </h3>
            <Link
              href="/admin/media"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                color: 'var(--color-accent-gold)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              <Film size={13} />
              <span>Manage Hero Video</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Cinematic Hero Video Status Alert */}
          <div style={{
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            fontSize: '0.825rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)'
          }}>
            <div>
              <span style={{ fontWeight: 500 }}>Cinematic Hero Film: </span>
              <span style={{ color: hero.mediaUrl ? '#28a745' : 'var(--color-text-muted)' }}>
                {hero.mediaUrl ? 'Active video assigned' : 'No video assigned (typographic layout)'}
              </span>
            </div>
            <Link
              href="/admin/media"
              className="badge badge-gold"
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              Upload / Replace Video
            </Link>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
              Hero Top Kicker
            </label>
            <input
              type="text"
              value={hero.kicker}
              onChange={(e) => setHero({ ...hero, kicker: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
              Hero Headline
            </label>
            <input
              type="text"
              value={hero.title}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
              Hero Subtitle Description
            </label>
            <textarea
              rows={3}
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Primary Button Label</label>
              <input
                type="text"
                value={hero.primaryCtaLabel}
                onChange={(e) => setHero({ ...hero, primaryCtaLabel: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border-subtle)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Primary Button Link</label>
              <input
                type="text"
                value={hero.primaryCtaLink}
                onChange={(e) => setHero({ ...hero, primaryCtaLink: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border-subtle)' }}
              />
            </div>
          </div>
        </div>

        {/* Brand Details */}
        <div className="luxury-card" style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: 'var(--space-3)' }}>
            Brand Identity &amp; Contact Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Brand Name</label>
              <input
                type="text"
                value={brand.brandName}
                onChange={(e) => setBrand({ ...brand, brandName: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border-subtle)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Concierge Email</label>
              <input
                type="email"
                value={brand.contactEmail}
                onChange={(e) => setBrand({ ...brand, contactEmail: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border-subtle)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Telephone</label>
              <input
                type="text"
                value={brand.contactPhone}
                onChange={(e) => setBrand({ ...brand, contactPhone: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border-subtle)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>WhatsApp Number (Format: +18004821980)</label>
              <input
                type="text"
                value={brand.whatsappNumber}
                onChange={(e) => setBrand({ ...brand, whatsappNumber: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border-subtle)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Showroom Physical Address</label>
            <input
              type="text"
              value={brand.showroomAddress}
              onChange={(e) => setBrand({ ...brand, showroomAddress: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border-subtle)' }}
            />
          </div>
        </div>

        <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
          <Save size={14} />
          <span>{isSaving ? 'Saving Settings...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
};
