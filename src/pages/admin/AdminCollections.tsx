import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, Sparkles, ArrowUp, ArrowDown, Upload, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { uploadAsset, validateFile } from '../../services/storageService';
import { Collection } from '../../types/collection';
import { Product } from '../../types/product';

export const AdminCollections: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoPosterUrl, setVideoPosterUrl] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isPublished, setIsPublished] = useState(false);
  const [assignedProductIds, setAssignedProductIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletionWarning, setDeletionWarning] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cols, prods] = await Promise.all([
        adminService.getCollections(),
        adminService.getAllProducts()
      ]);
      setCollections(cols);
      setAllProducts(prods);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFeedback(null);
    const valid = validateFile(file, 'image');
    if (!valid.valid) {
      setFeedback({ type: 'error', text: valid.error || 'Invalid image file' });
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadAsset(file, 'image', 'collections/covers');
      if (res.success && res.publicUrl) {
        setCoverImageUrl(res.publicUrl);
        setFeedback({ type: 'success', text: 'Collection cover uploaded!' });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Upload failed' });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setHeadline('');
    setDescription('');
    setCoverImageUrl(null);
    setVideoUrl(null);
    setVideoPosterUrl(null);
    setSortOrder(collections.length);
    setIsPublished(false);
    setAssignedProductIds([]);
    setEditingId(null);
    setDeletionWarning(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setFeedback({ type: 'error', text: 'Collection name and slug are required.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await adminService.saveCollection({
        id: editingId || undefined,
        name,
        slug,
        headline,
        description,
        coverImageUrl,
        videoUrl,
        videoPosterUrl,
        sortOrder,
        isPublished,
        productIds: assignedProductIds
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          text: editingId ? 'Collection updated successfully!' : 'New collection created successfully!'
        });
        resetForm();
        await loadData();
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to save collection.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (col: Collection) => {
    setEditingId(col.id);
    setName(col.name);
    setSlug(col.slug);
    setHeadline(col.headline || '');
    setDescription(col.description || '');
    setCoverImageUrl(col.coverImageUrl || null);
    setVideoUrl(col.videoUrl || null);
    setVideoPosterUrl(col.videoPosterUrl || null);
    setSortOrder(col.sortOrder ?? 0);
    setIsPublished(col.isPublished);
    // Find products currently assigned to this collection
    const currentAssigned = allProducts.filter((p) => p.collectionId === col.id).map((p) => p.id);
    setAssignedProductIds(currentAssigned);
    setDeletionWarning(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (col: Collection) => {
    setDeletionWarning(null);
    setFeedback(null);

    const count = await adminService.getCollectionProductCount(col.id);
    if (count > 0) {
      setDeletionWarning(
        `Cannot delete collection "${col.name}": ${count} product(s) are assigned to it. Please reassign or uncheck products before deleting.`
      );
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete collection "${col.name}"?`);
    if (!confirmDelete) return;

    const res = await adminService.deleteCollection(col.id);
    if (res.success) {
      setFeedback({ type: 'success', text: `Collection "${col.name}" deleted.` });
      if (editingId === col.id) resetForm();
      await loadData();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Failed to delete collection.' });
    }
  };

  const handleToggleProduct = (productId: string) => {
    setAssignedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= collections.length) return;

    const reordered = [...collections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setCollections(reordered);
    const orderedIds = reordered.map((c) => c.id);
    await adminService.reorderCollections(orderedIds);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <span className="kicker">CURATED SUITES</span>
        <h1 style={{ fontSize: '2rem', marginTop: '4px' }}>Collections ({collections.length})</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Group pieces into thematic architectural releases, living spaces, and seasonal curations.
        </p>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          backgroundColor: feedback.type === 'success' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(215, 58, 73, 0.1)',
          border: `1px solid ${feedback.type === 'success' ? '#28a745' : '#b31d28'}`,
          color: feedback.type === 'success' ? '#28a745' : '#b31d28',
          fontSize: '0.875rem',
          marginBottom: 'var(--space-6)'
        }}>
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Deletion Warning Banner */}
      {deletionWarning && (
        <div style={{
          padding: 'var(--space-4)',
          backgroundColor: 'rgba(215, 58, 73, 0.08)',
          border: '1px solid #b31d28',
          color: '#b31d28',
          fontSize: '0.875rem',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-3)'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Deletion Protected:</strong> {deletionWarning}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--space-8)' }}>
        {/* Editor Form */}
        <div className="luxury-card" style={{ padding: 'var(--space-8)', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-6)' }}>
            {editingId ? 'Edit Collection' : 'Create New Collection'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Collection Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Palazzo Monolith"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Slug (URL Identifier) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="palazzo-monolith"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Editorial Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Monolithic Sculptures for Light-Filled Spaces"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="An architectural suite defined by French walnut and Roman travertine..."
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.85rem' }}
              />
            </div>

            {/* Cover Image Upload / Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Cover Banner Photography
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                {coverImageUrl ? (
                  <div style={{ position: 'relative', width: '80px', height: '60px', border: '1px solid var(--color-border-subtle)', overflow: 'hidden' }}>
                    <img src={coverImageUrl} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl(null)}
                      title="Remove"
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        lineHeight: '18px',
                        textAlign: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    <Upload size={13} />
                    <span>{isUploading ? 'Uploading...' : 'Upload Cover'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isUploading}
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
                <input
                  type="text"
                  placeholder="Or paste image URL..."
                  value={coverImageUrl || ''}
                  onChange={(e) => setCoverImageUrl(e.target.value || null)}
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)' }}
                />
              </div>
            </div>

            {/* Product Assignment Checklist */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                  Assigned Products ({assignedProductIds.length})
                </label>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  Check pieces belonging to suite
                </span>
              </div>

              {allProducts.length === 0 ? (
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border-subtle)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  No products in catalogue yet. You can assign pieces later.
                </div>
              ) : (
                <div style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: '1px solid var(--color-border-subtle)',
                  backgroundColor: 'var(--color-bg-primary)',
                  padding: 'var(--space-2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {allProducts.map((p) => {
                    const isChecked = assignedProductIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 8px',
                          backgroundColor: isChecked ? 'var(--color-bg-secondary)' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.825rem',
                          borderRadius: '2px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleProduct(p.id)}
                        />
                        <span style={{ flex: 1, fontWeight: isChecked ? 500 : 400 }}>{p.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          {p.sku}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Publication Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', padding: 'var(--space-3)', background: 'var(--color-bg-secondary)' }}>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <span>Publish collection to public storefront</span>
            </label>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.25rem' }}
              >
                <Plus size={14} />
                <span>{editingId ? (isSaving ? 'Updating...' : 'Update Collection') : (isSaving ? 'Creating...' : 'Create Collection')}</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1rem' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Existing Collections List */}
        <div className="luxury-card" style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Existing Collections</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Order &amp; Status
            </span>
          </div>

          {isLoading ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
              <span className="kicker">LOADING COLLECTIONS...</span>
            </div>
          ) : collections.length === 0 ? (
            <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Sparkles size={36} style={{ margin: '0 auto var(--space-3)' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>No Collections Created Yet</h4>
              <p style={{ fontSize: '0.85rem' }}>Create seasonal suites to showcase complementary furniture editions.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {collections.map((col, index) => {
                const assignedCount = allProducts.filter((p) => p.collectionId === col.id).length;
                return (
                  <div
                    key={col.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3) var(--space-4)',
                      backgroundColor: editingId === col.id ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                      border: editingId === col.id ? '1px solid var(--color-accent-gold)' : '1px solid var(--color-border-subtle)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      {/* Reorder Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(index, 'up')}
                          title="Move Up"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: index === 0 ? 'default' : 'pointer',
                            opacity: index === 0 ? 0.3 : 1,
                            padding: '1px'
                          }}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={index === collections.length - 1}
                          onClick={() => handleMoveOrder(index, 'down')}
                          title="Move Down"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: index === collections.length - 1 ? 'default' : 'pointer',
                            opacity: index === collections.length - 1 ? 0.3 : 1,
                            padding: '1px'
                          }}
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>

                      {/* Cover Thumbnail */}
                      {col.coverImageUrl ? (
                        <img
                          src={col.coverImageUrl}
                          alt={col.name}
                          style={{ width: '44px', height: '44px', objectFit: 'cover', border: '1px solid var(--color-border-subtle)' }}
                        />
                      ) : (
                        <div style={{ width: '44px', height: '44px', backgroundColor: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon size={16} color="var(--color-text-muted)" />
                        </div>
                      )}

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{col.name}</span>
                          {col.isPublished ? (
                            <span className="badge badge-gold" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                              Live
                            </span>
                          ) : (
                            <span className="badge" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                              Draft
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {assignedCount} {assignedCount === 1 ? 'assigned piece' : 'assigned pieces'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(col)}
                        title="Edit Collection"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px' }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(col)}
                        title="Delete Collection"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#b31d28', padding: '4px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
