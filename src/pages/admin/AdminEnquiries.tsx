import React, { useEffect, useState } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { CustomerEnquiry } from '../../types/enquiry';

export const AdminEnquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEnquiries = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getEnquiries();
      setEnquiries(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleStatusChange = async (id: string, status: 'new' | 'reviewed' | 'contacted' | 'archived') => {
    await adminService.updateEnquiryStatus(id, status);
    await loadEnquiries();
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteEnquiry(id);
    await loadEnquiries();
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <span className="kicker">CLIENT COMMUNICATIONS</span>
        <h1 style={{ fontSize: '2rem', marginTop: '4px' }}>Customer Enquiries &amp; Quotations ({enquiries.length})</h1>
      </div>

      {isLoading ? (
        <p>Loading enquiries...</p>
      ) : enquiries.length === 0 ? (
        <div style={{ padding: 'var(--space-16)', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
          <Mail size={36} color="var(--color-text-muted)" style={{ margin: '0 auto var(--space-3)' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>No Customer Enquiries Yet</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            When patrons submit requests through the public website, they will be securely stored and listed here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="luxury-card"
              style={{
                padding: 'var(--space-6)',
                borderLeft: enq.status === 'new' ? '4px solid var(--color-accent-gold)' : '1px solid var(--color-border-subtle)'
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>{enq.fullName}</h3>
                    <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>
                      {enq.type.replace('_', ' ')}
                    </span>
                    <span className="badge" style={{ fontSize: '0.65rem' }}>
                      Status: {enq.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    <span>Email: {enq.email}</span>
                    {enq.phone && <span>Phone: {enq.phone}</span>}
                    <span>Preferred: {enq.preferredContact}</span>
                    {enq.productName && <span>Product: <strong>{enq.productName}</strong></span>}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <select
                    value={enq.status}
                    onChange={(e) => handleStatusChange(enq.id, e.target.value as 'new' | 'reviewed' | 'contacted' | 'archived')}
                    style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.8rem' }}
                  >
                    <option value="new">Mark New</option>
                    <option value="reviewed">Mark Reviewed</option>
                    <option value="contacted">Mark Contacted</option>
                    <option value="archived">Archive</option>
                  </select>
                  <button onClick={() => handleDelete(enq.id)} title="Delete" style={{ background: 'transparent', border: 'none', color: '#b31d28', cursor: 'pointer', padding: '6px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-subtle)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                "{enq.message}"
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
                Received on: {new Date(enq.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
