import React, { useState } from 'react';
import { Shield, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '../../context/AuthContext';
import { useClientConfig } from '../../context/ClientConfigContext';

export const AdminLogin: React.FC = () => {
  const clientConfig = useClientConfig();
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const result = await signIn(email, password);
      if (!result.success) {
        setErrorMsg(result.error || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-layout" style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-12) var(--space-6)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        padding: 'var(--space-10)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            color: 'var(--color-accent-gold)'
          }}>
            <Shield size={22} strokeWidth={1.5} />
          </div>
          <span className="kicker">RESTRICTED PORTAL</span>
          <h2 style={{ fontSize: '1.75rem', marginTop: 'var(--space-2)' }}>{clientConfig.brand.brandName} Atelier Admin</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Authorized administrative personnel only
          </p>
        </div>

        {!isConfigured && (
          <div style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderLeft: '3px solid var(--color-accent-gold)',
            marginBottom: 'var(--space-6)',
            fontSize: '0.825rem',
            lineHeight: 1.5
          }}>
            <strong>Setup Notice:</strong> Supabase credentials are not yet configured in environment variables. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to enable live authentication.
          </div>
        )}

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
            padding: 'var(--space-4)',
            backgroundColor: 'rgba(215, 58, 73, 0.08)',
            border: '1px solid rgba(215, 58, 73, 0.25)',
            color: '#b31d28',
            fontSize: '0.825rem',
            marginBottom: 'var(--space-6)'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: '6px'
            }}>
              Admin Email
            </label>
            <input
              type="email"
              required
              placeholder={`admin@${clientConfig.contact.contactEmail.includes('@') ? clientConfig.contact.contactEmail.split('@')[1] : 'domain.com'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-bg-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border-subtle)',
                background: 'var(--color-bg-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }}
          >
            <Lock size={14} />
            <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate'}</span>
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-8)', textAlign: 'center' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)'
            }}
          >
            <ArrowLeft size={13} />
            <span>Return to Public Showroom</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
