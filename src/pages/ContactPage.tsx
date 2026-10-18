import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { useClientConfig } from '../context/ClientConfigContext';

export const ContactPage: React.FC = () => {
  const config = useClientConfig();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialType = searchParams?.get('type') || 'general';
  const initialProduct = searchParams?.get('product') || '';
  const initialProductId = searchParams?.get('id') || '';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    enquiryType: initialType,
    productId: initialProductId,
    productName: initialProduct,
    message: initialProduct ? `Inquiry regarding bespoke acquisition of: ${initialProduct}` : ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { enquiryService } = await import('../services/enquiryService');
      const res = await enquiryService.submitEnquiry({
        type: formData.enquiryType as 'general' | 'product_quotation' | 'private_viewing' | 'bespoke_commission',
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        preferredContact: 'email',
        productId: formData.productId || undefined,
        productName: formData.productName || undefined,
        message: formData.message
      });
      if (res.success) {
        setIsSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-24)' }}>
      <div className="container">
        <SectionHeader
          kicker="ATELIER CONCIERGE"
          title="Showroom &amp; Private Enquiries"
          subtitle="Our atelier directors are available for bespoke commissions, architectural trade partnerships, and private showroom visits."
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-8)'
          }}
        >
          {/* Atelier Contact Details & WhatsApp Direct */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div
              className="luxury-glass-card"
              style={{
                padding: 'var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-6)'
              }}
            >
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.12)', paddingBottom: 'var(--space-4)', margin: 0 }}>
                {config.contact.flagshipLocationName}
              </h3>

              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <MapPin size={20} color="var(--color-accent-gold)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', marginBottom: '2px' }}>
                    Address
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#ffffff' }}>{config.contact.showroomAddress}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <Clock size={20} color="var(--color-accent-gold)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', marginBottom: '2px' }}>
                    Visiting Hours
                  </div>
                  <div style={{ fontSize: '0.95rem', color: '#ffffff' }}>{config.contact.visitingHours}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <Mail size={20} color="var(--color-accent-gold)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', marginBottom: '2px' }}>
                    Concierge Email
                  </div>
                  <div style={{ fontSize: '0.95rem' }}>
                    <a href={`mailto:${config.contact.contactEmail}`} style={{ color: '#ffffff', textDecoration: 'none' }}>
                      {config.contact.contactEmail}
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <Phone size={20} color="var(--color-accent-gold)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', marginBottom: '2px' }}>
                    Telephone
                  </div>
                  <div style={{ fontSize: '0.95rem' }}>
                    <a href={`tel:${config.contact.contactPhone.replace(/[^0-9+]/g, '')}`} style={{ color: '#ffffff', textDecoration: 'none' }}>
                      {config.contact.contactPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Action */}
              {config.contact.whatsappNumber && (
                <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  <a
                    href={`https://wa.me/${config.contact.whatsappNumber}?text=${encodeURIComponent(config.contact.whatsappDefaultMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-pill"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontSize: '0.85rem'
                    }}
                  >
                    <MessageSquare size={16} color="#25D366" />
                    <span>Direct WhatsApp Concierge</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Enquiry Form */}
          <div
            className="luxury-glass-card"
            style={{ padding: 'var(--space-8)' }}
          >
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: '#ffffff', marginBottom: 'var(--space-6)', margin: 0 }}>
              Submit a Private Request
            </h3>

            {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
                <CheckCircle2 size={40} color="var(--color-accent-gold)" style={{ margin: '0 auto var(--space-4)' }} />
                <h4 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)', color: '#ffffff', marginBottom: 'var(--space-2)' }}>Request Received</h4>
                <p style={{ maxWidth: '420px', margin: '0 auto', color: 'rgba(255, 255, 255, 0.85)' }}>
                  Thank you for contacting {config.brand.brandName}. Our atelier director will review your enquiry and get in touch within 24 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="glass-input"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem',
                      borderRadius: '12px'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="glass-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.9rem',
                        borderRadius: '12px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', marginBottom: '6px' }}>
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      className="glass-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.9rem',
                        borderRadius: '12px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', marginBottom: '6px' }}>
                    Type of Enquiry
                  </label>
                  <select
                    value={formData.enquiryType}
                    className="glass-input"
                    onChange={(e) => setFormData({ ...formData, enquiryType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem',
                      borderRadius: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="general" style={{ background: '#1c1815', color: '#fff' }}>General Atelier Inquiry</option>
                    <option value="product_quotation" style={{ background: '#1c1815', color: '#fff' }}>Product Quotation Request</option>
                    <option value="private_viewing" style={{ background: '#1c1815', color: '#fff' }}>Schedule Private Showroom Visit</option>
                    <option value="bespoke_commission" style={{ background: '#1c1815', color: '#fff' }}>Bespoke Architectural Commission</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-accent-gold)', marginBottom: '6px' }}>
                    Message / Specifications
                  </label>
                  <textarea
                    rows={4}
                    required
                    className="glass-input"
                    placeholder="Provide details about your project or preferred consultation date..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9rem',
                      borderRadius: '12px',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold"
                  style={{
                    alignSelf: 'flex-start',
                    padding: '0.85rem 1.8rem',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Enquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
