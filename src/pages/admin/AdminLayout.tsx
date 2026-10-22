import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Package, 
  FolderTree, 
  Sparkles, 
  Film, 
  Settings, 
  Inbox, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  Plus,
  Layers,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClientConfig } from '../../context/ClientConfigContext';
import { AdminLogin } from './AdminLogin';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const clientConfig = useClientConfig();
  const { user, isAdmin, isLoading, isConfigured, signOut } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="kicker">AUTHENTICATING SESSION...</span>
      </div>
    );
  }

  // If not configured, or user is not logged in / not an authorized admin, show login gateway
  if (!isConfigured || !user || !isAdmin) {
    return <AdminLogin />;
  }

  const navItems = [
    { href: '/admin', label: 'Overview', icon: ShieldCheck, exact: true },
    { href: '/admin/hero-frames', label: 'Homepage Cinematic Frames', icon: Layers },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/collections', label: 'Collections', icon: Sparkles },
    { href: '/admin/media', label: 'Videos & Media', icon: Film },
    { href: '/admin/storage-audit', label: 'Storage Audit & Cleanup', icon: HardDrive },
    { href: '/admin/settings', label: 'Site Settings', icon: Settings },
    { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox }
  ];

  return (
    <div className="admin-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Admin Header Bar */}
      <div className="admin-top-bar" style={{
        padding: '0 var(--space-6)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <span style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.4rem',
              letterSpacing: '0.12em',
              fontWeight: 400
            }}>
              {clientConfig.brand.logoText}
            </span>
            <span className="badge badge-gold" style={{ fontSize: '0.62rem' }}>
              ADMIN CONTROL CENTER
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-dark-text-secondary)', display: 'none' }} className="admin-user-pill">
              {user?.email}
            </span>

            <Link
              href="/admin/products/new"
              className="btn btn-gold"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.75rem' }}
            >
              <Plus size={13} />
              <span>New Product</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                color: 'var(--color-dark-text-secondary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}
            >
              <span>View Site</span>
              <ExternalLink size={12} />
            </Link>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-dark-text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                padding: 'var(--space-2)'
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Subnav */}
      <div className="admin-subnav" style={{
        padding: '0 var(--space-6)',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-6)',
          maxWidth: '1400px',
          margin: '0 auto',
          minWidth: '640px'
        }}>
          {navItems.map((item) => {
            const isActive = item.exact ? location === item.href : location.startsWith(item.href);
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? 'is-active' : ''}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: 'var(--space-4) 0',
                  fontSize: '0.8rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: isActive ? '#856404' : '#59524c',
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: isActive ? '2px solid var(--color-accent-gold)' : '2px solid transparent',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <IconComponent size={14} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Viewport */}
      <div style={{ flex: 1, padding: 'var(--space-8) var(--space-6)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
