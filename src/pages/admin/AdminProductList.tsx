import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Plus, Search, Edit3, Copy, Trash2, Eye, EyeOff, Image as ImageIcon, AlertTriangle, CheckCircle, RefreshCw, X } from 'lucide-react';
import { adminService, ProductDeletionResult } from '../../services/adminService';
import { productService } from '../../services/productService';
import { Product } from '../../types/product';

export const AdminProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Permanent Deletion and Storage Cleanup State
  const [targetProductToDelete, setTargetProductToDelete] = useState<Product | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteConfirmedCheckbox, setDeleteConfirmedCheckbox] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionAudit, setDeletionAudit] = useState<ProductDeletionResult | null>(null);
  const [isRetryingStorage, setIsRetryingStorage] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    setSuccessMessage(null);
    const nextStatus = product.status === 'published' ? 'draft' : 'published';
    const res = await adminService.toggleProductPublish(product.id, nextStatus);
    if (res.success) {
      await loadProducts();
    } else {
      setActionError(res.error || `Failed to update publication status for ${product.name}`);
    }
  };

  const handleDuplicate = async (product: Product) => {
    setActionError(null);
    setSuccessMessage(null);
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

  const handlePermanentDelete = async (product: Product) => {
    setIsDeleting(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const result = await adminService.deleteProductPermanent(product.id);
      
      if (result.success) {
        setSuccessMessage(`Product "${product.name}" (${product.sku}) was permanently removed and its unshared storage assets were safely cleaned up.`);
        setTargetProductToDelete(null);
        setDeletionAudit(null);
        await loadProducts();
      } else if (result.databaseDeleted && result.storageFailedCount > 0) {
        // Database rows removed; partial storage failure keeps audit visible for retry
        setDeletionAudit(result);
        await loadProducts(); // Product is removed from catalogue immediately
      } else {
        setActionError(result.error || 'Permanent deletion failed. Database records and storage files remain intact.');
        setTargetProductToDelete(null);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Deletion encountered an unexpected error.');
      setTargetProductToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetryStorageCleanup = async () => {
    if (!deletionAudit) return;
    setIsRetryingStorage(true);
    setActionError(null);

    try {
      const retryResult = await adminService.retryStorageCleanup(deletionAudit.storageCleanup);
      
      const updatedItems = deletionAudit.storageCleanup.map((item) => {
        const retried = retryResult.results.find((r) => r.bucket === item.bucket && r.path === item.path);
        return retried || item;
      });

      setDeletionAudit({
        ...deletionAudit,
        storageCleanup: updatedItems,
        storageFailedCount: retryResult.remainingFailedCount,
        success: retryResult.success,
        error: retryResult.remainingFailedCount > 0
          ? `${retryResult.remainingFailedCount} storage asset(s) could not be removed.`
          : undefined
      });

      if (retryResult.success) {
        setSuccessMessage('All remaining storage assets were successfully cleaned up.');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to retry storage cleanup.');
    } finally {
      setIsRetryingStorage(false);
    }
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

      {successMessage && (
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          backgroundColor: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid #16a34a',
          color: '#15803d',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#15803d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

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
                        onClick={() => {
                          setTargetProductToDelete(item);
                          setDeleteConfirmationText('');
                          setDeleteConfirmedCheckbox(false);
                          setDeletionAudit(null);
                          setActionError(null);
                        }}
                        title="Permanently Delete Product"
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

      {/* Permanent Product Deletion & Storage Audit Modal */}
      {targetProductToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(19, 18, 17, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)'
        }}>
          <div style={{
            backgroundColor: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border-subtle)',
            padding: 'var(--space-8)',
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.35)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b31d28'
                }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Permanent Product Deletion</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Storage Cleanup & Safe Database Removal
                  </span>
                </div>
              </div>
              {!isDeleting && (
                <button
                  onClick={() => {
                    setTargetProductToDelete(null);
                    setDeletionAudit(null);
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* If audit has partial failures, display audit details and retry options */}
            {deletionAudit && deletionAudit.storageFailedCount > 0 ? (
              <div>
                <div style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'rgba(234, 179, 8, 0.08)',
                  border: '1px solid #ca8a04',
                  color: '#a16207',
                  marginBottom: 'var(--space-6)',
                  fontSize: '0.875rem'
                }}>
                  <strong>Database record removed:</strong> The product was removed from the database and catalog. However, {deletionAudit.storageFailedCount} storage object(s) could not be cleaned up automatically.
                </div>

                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 'var(--space-2)' }}>
                    Storage Audit Manifest
                  </span>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--color-border-subtle)', fontSize: '0.75rem' }}>
                    {deletionAudit.storageCleanup.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: 'var(--space-2) var(--space-3)',
                          borderBottom: '1px solid var(--color-border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 'var(--space-2)'
                        }}
                      >
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>[{item.bucket}]</span> {item.path}
                          {item.reason && <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{item.reason}</div>}
                          {item.error && <div style={{ fontSize: '0.7rem', color: '#b31d28' }}>{item.error}</div>}
                        </div>
                        <span style={{
                          padding: '2px 6px',
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          backgroundColor:
                            item.status === 'deleted' ? 'rgba(34, 197, 94, 0.12)' :
                            item.status === 'skipped_shared' ? 'rgba(59, 130, 246, 0.12)' :
                            'rgba(239, 68, 68, 0.12)',
                          color:
                            item.status === 'deleted' ? '#16a34a' :
                            item.status === 'skipped_shared' ? '#2563eb' :
                            '#b31d28'
                        }}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <button
                    onClick={() => {
                      setTargetProductToDelete(null);
                      setDeletionAudit(null);
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Dismiss & Close
                  </button>
                  <button
                    onClick={handleRetryStorageCleanup}
                    disabled={isRetryingStorage}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                  >
                    {isRetryingStorage && <RefreshCw size={14} className="spin" />}
                    <span>{isRetryingStorage ? 'Retrying Storage Deletion...' : 'Retry Storage Cleanup'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Product Card Details */}
                <div style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'rgba(0, 0, 0, 0.03)',
                  border: '1px solid var(--color-border-subtle)',
                  marginBottom: 'var(--space-4)',
                  display: 'flex',
                  gap: 'var(--space-4)',
                  alignItems: 'center'
                }}>
                  {targetProductToDelete.primaryImageUrl ? (
                    <img
                      src={targetProductToDelete.primaryImageUrl}
                      alt={targetProductToDelete.name}
                      style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '56px', height: '56px', backgroundColor: 'var(--color-bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={20} color="var(--color-text-secondary)" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{targetProductToDelete.name}</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      SKU: <strong style={{ color: 'var(--color-text-primary)' }}>{targetProductToDelete.sku}</strong> • Status: {targetProductToDelete.status}
                    </div>
                  </div>
                </div>

                {/* Audit Safety Warning */}
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  borderLeft: '3px solid #b31d28',
                  marginBottom: 'var(--space-5)',
                  fontSize: '0.8rem',
                  lineHeight: '1.4'
                }}>
                  <p style={{ margin: '0 0 var(--space-2) 0', fontWeight: 600, color: '#b31d28' }}>
                    Safety Protocol Enforced:
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--color-text-secondary)' }}>
                    <li>Dependent media rows, finishes, and 360 sequences will be deleted.</li>
                    <li>Unshared media objects in storage will be removed permanently.</li>
                    <li>Files shared with categories, collections, or other products will be safely preserved.</li>
                    <li>Customer enquiries will be preserved without broken foreign keys.</li>
                  </ul>
                </div>

                {/* Confirmation Checkbox */}
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-4)',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}>
                  <input
                    type="checkbox"
                    checked={deleteConfirmedCheckbox}
                    onChange={(e) => setDeleteConfirmedCheckbox(e.target.checked)}
                    disabled={isDeleting}
                    style={{ marginTop: '3px' }}
                  />
                  <span>
                    I confirm permanent deletion of this piece and authorize automated storage cleanup of its unshared assets.
                  </span>
                </label>

                {/* Confirmation SKU Input */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
                    Type the exact SKU <strong style={{ color: 'var(--color-text-primary)' }}>{targetProductToDelete.sku}</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder={targetProductToDelete.sku}
                    disabled={isDeleting}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-main)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                  <button
                    onClick={() => {
                      setTargetProductToDelete(null);
                      setDeletionAudit(null);
                    }}
                    disabled={isDeleting}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(targetProductToDelete)}
                    disabled={
                      isDeleting ||
                      !deleteConfirmedCheckbox ||
                      deleteConfirmationText.trim().toUpperCase() !== targetProductToDelete.sku.trim().toUpperCase()
                    }
                    className="btn btn-primary"
                    style={{
                      backgroundColor: '#b31d28',
                      borderColor: '#b31d28',
                      padding: '0.5rem 1rem',
                      opacity: (isDeleting || !deleteConfirmedCheckbox || deleteConfirmationText.trim().toUpperCase() !== targetProductToDelete.sku.trim().toUpperCase()) ? 0.5 : 1,
                      cursor: (isDeleting || !deleteConfirmedCheckbox || deleteConfirmationText.trim().toUpperCase() !== targetProductToDelete.sku.trim().toUpperCase()) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}
                  >
                    {isDeleting && <RefreshCw size={14} className="spin" />}
                    <span>{isDeleting ? 'Deleting Product & Storage...' : 'Delete Permanently'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
