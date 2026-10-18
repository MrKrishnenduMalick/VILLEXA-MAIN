import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Eye, EyeOff, FolderTree, Inbox, Plus, Film, ArrowRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Product } from '../../types/product';
import { CustomerEnquiry } from '../../types/enquiry';

export const AdminOverview: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [categoryCount, setCategoryCount] = useState<number>(0);
  const [collectionCount, setCollectionCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [loadedProducts, loadedEnquiries, categories, collections] = await Promise.all([
          adminService.getAllProducts(),
          adminService.getEnquiries(),
          adminService.getCategories(),
          adminService.getCollections()
        ]);
        setProducts(loadedProducts);
        setEnquiries(loadedEnquiries);
        setCategoryCount(categories.length);
        setCollectionCount(collections.length);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const publishedCount = products.filter((p) => p.status === 'published').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;
  const missingMediaCount = products.filter((p) => !p.primaryImageUrl).length;
  const with3DCount = products.filter((p) => Boolean(p.glbConfig?.modelUrl)).length;
  const with360Count = products.filter((p) => Boolean(p.sequence360Config && p.sequence360Config.frameCount > 0)).length;
  const withVideoCount = products.filter((p) => Boolean(p.videoUrl)).length;
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'new').length;

  const recentProducts = [...products].sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  }).slice(0, 5);

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)'
      }}>
        <div>
          <span className="kicker">SYSTEM METRICS & RECENT ACTIVITY</span>
          <h1 style={{ fontSize: '2rem', marginTop: '4px' }}>Dashboard Overview</h1>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href="/admin/products/new" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
            <Plus size={14} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-5)',
        marginBottom: 'var(--space-8)'
      }}>
        {/* Published Products */}
        <div className="luxury-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Published
            </span>
            <Eye size={15} color="var(--color-accent-gold)" />
          </div>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
            {isLoading ? '—' : publishedCount}
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>
            Active on catalogue
          </p>
        </div>

        {/* Draft Products */}
        <div className="luxury-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Drafts
            </span>
            <EyeOff size={15} color="var(--color-text-muted)" />
          </div>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
            {isLoading ? '—' : draftCount}
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>
            Private / work in progress
          </p>
        </div>

        {/* Categories & Collections */}
        <div className="luxury-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              Taxonomy
            </span>
            <FolderTree size={15} color="var(--color-accent-gold)" />
          </div>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
            {isLoading ? '—' : `${categoryCount} / ${collectionCount}`}
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>
            Categories / Collections
          </p>
        </div>

        {/* Customer Enquiries */}
        <div className="luxury-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              New Enquiries
            </span>
            <Inbox size={15} color="var(--color-accent-gold)" />
          </div>
          <div style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)' }}>
            {isLoading ? '—' : newEnquiriesCount}
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>
            {enquiries.length} total submissions
          </p>
        </div>

        {/* Media & 3D Assets */}
        <div className="luxury-card" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              3D & Media
            </span>
            <Film size={15} color="var(--color-accent-gold)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {isLoading ? '—' : `${with3DCount} 3D · ${with360Count} 360°`}
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: 'var(--space-1)', color: 'var(--color-text-secondary)' }}>
            {withVideoCount} product videos attached
          </p>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="luxury-card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Recent Catalogue Items</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Recently added or modified furniture pieces
            </p>
          </div>
          <Link href="/admin/products" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
            View All ({products.length})
          </Link>
        </div>

        {isLoading ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Loading catalogue items...
          </div>
        ) : recentProducts.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', border: '1px dashed var(--color-border-subtle)', borderRadius: '4px' }}>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>
              No furniture products exist yet in the database.
            </p>
            <Link href="/admin/products/new" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              Create Your First Product
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Piece</th>
                  <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>SKU</th>
                  <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: 'var(--space-3)', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Interactive Media</th>
                  <th style={{ padding: 'var(--space-3)', textAlign: 'right', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {product.primaryImageUrl ? (
                          <img
                            src={product.primaryImageUrl}
                            alt=""
                            style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--color-border-subtle)' }}
                          />
                        ) : (
                          <div style={{ width: '36px', height: '36px', backgroundColor: 'var(--color-bg-surface)', border: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>
                            No Img
                          </div>
                        )}
                        <div>
                          <div>{product.name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{product.categoryName || 'Uncategorized'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {product.sku || '—'}
                    </td>
                    <td style={{ padding: 'var(--space-3)' }}>
                      <span className={`badge ${product.status === 'published' ? 'badge-gold' : ''}`} style={{ fontSize: '0.7rem' }}>
                        {product.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-3)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {product.glbConfig?.modelUrl && <span style={{ color: 'var(--color-accent-gold)' }}>3D</span>}
                        {product.sequence360Config && <span style={{ color: 'var(--color-accent-gold)' }}>360°</span>}
                        {product.videoUrl && <span style={{ color: 'var(--color-accent-gold)' }}>VID</span>}
                        {!product.glbConfig?.modelUrl && !product.sequence360Config && !product.videoUrl && <span>Photo only</span>}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                      <Link href={`/admin/products/${product.id}/edit`} className="btn btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}>
                        Edit Piece
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Action Cards & Missing Media Alert */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)' }}>
        {/* Quick Management Shortcuts */}
        <div className="luxury-card" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>Atelier Management Tasks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Link
              href="/admin/products/new"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-subtle)',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Plus size={14} color="var(--color-accent-gold)" />
                <span>Upload New Furniture Piece</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/admin/categories"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-subtle)',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <FolderTree size={14} color="var(--color-accent-gold)" />
                <span>Manage Categories & Covers ({categoryCount})</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/admin/collections"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-subtle)',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <FolderTree size={14} color="var(--color-accent-gold)" />
                <span>Curate Collections & Suites ({collectionCount})</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/admin/media"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-subtle)',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Film size={14} color="var(--color-accent-gold)" />
                <span>Manage Showroom Videos</span>
              </div>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/admin/enquiries"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border-subtle)',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Inbox size={14} color="var(--color-accent-gold)" />
                <span>Review Customer Enquiries ({newEnquiriesCount} New)</span>
              </div>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Content Quality Checklist */}
        <div className="luxury-card" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-4)' }}>Catalogue Readiness Audit</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', fontSize: '0.875rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Total Products Created:</span>
              <strong>{products.length}</strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Pieces Missing Primary Image:</span>
              <strong style={{ color: missingMediaCount > 0 ? '#b31d28' : 'inherit' }}>
                {missingMediaCount}
              </strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>3D Interactive Models:</span>
              <strong>{with3DCount} active</strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>360° Rotating Sequences:</span>
              <strong>{with360Count} active</strong>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Showroom Video Configured:</span>
              <span>Available in Videos & Media</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
