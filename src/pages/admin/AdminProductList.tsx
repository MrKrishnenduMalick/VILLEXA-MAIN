import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Plus, Search, Edit3, Copy, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';

export const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllProducts();
      setProducts(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleTogglePublish = async (product: Product) => {
    setActionError(null);
    const nextStatus = product.status === 'published' ? 'draft' : 'published';
    const res = await adminService.toggleProductPublish(product.id, nextStatus);
    if (res.success) {
      await loadProducts();
    } else {
      setActionError(res.error || `Failed to update publication status for ${product.name}`);
    }
  };

  const handleDuplicate = async (product: Product) => {
    const duplicateData = {
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      sku: `${product.sku}-COPY`,
      categoryId: product.categoryId,
      collectionId: product.collectionId,
      regularPrice: product.regularPrice,
      salePrice: product.salePrice || null,
      currency: product.currency,
      showPricePublicly: product.showPricePublicly,
      isEnquiryOnly: product.isEnquiryOnly,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      materials: product.materials,
      careInstructions: product.careInstructions,
      dimensions: product.dimensions,
      primaryImageUrl: product.primaryImageUrl,
      preferredViewer: product.preferredViewer,
      tags: [...product.tags],
      isFeatured: false,
      sortOrder: product.sortOrder + 1,
      status: 'draft' as const
    };
    await adminService.saveProduct(duplicateData);
    await loadProducts();
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteProduct(id);
    setDeleteConfirmId(null);
    await loadProducts();
  };

  const filtered = products.filter((p) => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)'
      }}>
        <div>
          <span className="kicker">PRODUCT MANAGEMENT</span>
          <h1 style={{ fontSize: '2rem', marginTop: '4px' }}>All Creations ({products.length})</h1>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
          <Plus size={14} />
          <span>New Product</span>
        </Link>
      </div>

      {actionError && (
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid var(--color-error)',
          color: 'var(--color-error)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.875rem'
        }}>
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-error)',
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: '0 var(--space-2)'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        padding: 'var(--space-4) var(--space-6)',
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        marginBottom: 'var(--space-6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: '1 1 240px', maxWidth: '360px' }}>
          <Search size={15} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Search by name, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            onClick={() => setStatusFilter('all')}
            className={`badge ${statusFilter === 'all' ? 'badge-gold' : ''}`}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`badge ${statusFilter === 'published' ? 'badge-gold' : ''}`}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            Published
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`badge ${statusFilter === 'draft' ? 'badge-gold' : ''}`}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            Drafts
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
          <span className="kicker">LOADING CATALOGUE RECORDS...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: 'var(--space-16) var(--space-8)',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>No Products Found</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: 'var(--space-6)' }}>
            {searchQuery
              ? 'No products matched your search parameters.'
              : 'You have not uploaded any products yet. Click below to create your first creation.'}
          </p>
          <Link href="/admin/products/new" className="btn btn-primary">
            <Plus size={14} />
            <span>Create First Product</span>
          </Link>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-secondary)' }}>
                <th style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' }}>Asset</th>
                <th style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' }}>Name &amp; SKU</th>
                <th style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' }}>Category</th>
                <th style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' }}>Price</th>
                <th style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' }}>Viewer</th>
                <th style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' }}>Status</th>
                <th style={{ padding: 'var(--space-4) var(--space-6)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    {item.primaryImageUrl ? (
                      <img
                        src={item.primaryImageUrl}
                        alt={item.name}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', border: '1px solid var(--color-border-subtle)' }}
                      />
                    ) : null}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'var(--color-bg-secondary)',
                      display: item.primaryImageUrl ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-text-muted)'
                    }}>
                      <ImageIcon size={18} />
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{item.sku}</div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', color: 'var(--color-text-secondary)' }}>
                    {item.categoryName}
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    {productService.formatPrice(item)}
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    <span className="badge" style={{ fontSize: '0.65rem' }}>
                      {item.preferredViewer}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    <button
                      onClick={() => handleTogglePublish(item)}
                      title="Click to toggle publish status"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <span className={`badge ${item.status === 'published' ? 'badge-gold' : ''}`}>
                        {item.status === 'published' ? <Eye size={11} /> : <EyeOff size={11} />}
                        <span>{item.status}</span>
                      </span>
                    </button>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                      <Link
                        href={`/admin/products/${item.id}`}
                        title="Edit Product"
                        style={{ padding: 'var(--space-2)', color: 'var(--color-text-secondary)' }}
                      >
                        <Edit3 size={15} />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(item)}
                        title="Duplicate Product"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 'var(--space-2)', color: 'var(--color-text-secondary)' }}
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        title="Delete Product"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 'var(--space-2)', color: '#b31d28' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(19, 18, 17, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)'
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            padding: 'var(--space-8)',
            maxWidth: '440px',
            width: '100%'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-3)' }}>Confirm Deletion</h3>
            <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-6)', color: 'var(--color-text-secondary)' }}>
              Are you sure you want to delete this furniture piece? This will remove its persistent database records and associated media references.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="btn btn-primary" style={{ backgroundColor: '#b31d28', borderColor: '#b31d28', padding: '0.5rem 1rem' }}>
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
