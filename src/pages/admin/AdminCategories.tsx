import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit3, FolderTree, ArrowUp, ArrowDown, Upload, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { uploadAsset, validateFile } from '../../services/storageService';
import { ProductCategory } from '../../types/product';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletionWarning, setDeletionWarning] = useState<string | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getCategories();
      setCategories(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
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
      const res = await uploadAsset(file, 'image', 'categories/covers');
      if (res.success && res.publicUrl) {
        setCoverImageUrl(res.publicUrl);
        setFeedback({ type: 'success', text: 'Cover image uploaded successfully!' });
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to upload cover image' });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setCoverImageUrl(null);
    setSortOrder(categories.length);
    setEditingId(null);
    setDeletionWarning(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setFeedback({ type: 'error', text: 'Category name and slug are required.' });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await adminService.saveCategory({
        id: editingId || undefined,
        name,
        slug,
        description,
        coverImageUrl,
        sortOrder
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          text: editingId ? 'Category updated successfully!' : 'New category created successfully!'
        });
        resetForm();
        await loadCategories();
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to save category.' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (cat: ProductCategory) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setCoverImageUrl(cat.coverImageUrl || null);
    setSortOrder(cat.sortOrder ?? 0);
    setDeletionWarning(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (cat: ProductCategory) => {
    setDeletionWarning(null);
    setFeedback(null);

    // Safety check: prevent accidental deletion if products belong to category
    if (cat.productCount > 0) {
      setDeletionWarning(
        `Cannot delete "${cat.name}": ${cat.productCount} product(s) are assigned to this category. Please reassign them in Products before deleting.`
      );
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete category "${cat.name}"?`);
    if (!confirmDelete) return;

    const res = await adminService.deleteCategory(cat.id);
    if (res.success) {
      setFeedback({ type: 'success', text: `Category "${cat.name}" deleted.` });
      if (editingId === cat.id) resetForm();
      await loadCategories();
    } else {
      setFeedback({ type: 'error', text: res.error || 'Failed to delete category.' });
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    setCategories(reordered);
    const orderedIds = reordered.map((c) => c.id);
    await adminService.reorderCategories(orderedIds);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <span className="kicker">TAXONOMY MANAGEMENT</span>
        <h1 style={{ fontSize: '2rem', marginTop: '4px' }}>Categories ({categories.length})</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Organize your showroom creations into architectural disciplines and styles.
        </p>
      </div>

      {/* Feedback Alerts */}
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

      {/* Deletion Warning Modal/Banner */}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-8)' }}>
        {/* Form */}
        <div className="luxury-card" style={{ padding: 'var(--space-8)', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-6)' }}>
            {editingId ? 'Edit Category' : 'Create New Category'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Architectural Seating"
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
                placeholder="architectural-seating"
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.85rem' }}
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
                placeholder="Sculptural monolithic sofas, lounge chairs, and benches handcrafted in Milan."
                style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)', fontSize: '0.85rem' }}
              />
            </div>

            {/* Cover Image */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px' }}>
                Cover Banner Image
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                {coverImageUrl ? (
                  <div style={{ position: 'relative', width: '80px', height: '60px', border: '1px solid var(--color-border-subtle)', overflow: 'hidden' }}>
                    <img src={coverImageUrl} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl(null)}
                      title="Remove Cover"
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
                    <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
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
                  placeholder="Or paste external URL..."
                  value={coverImageUrl || ''}
                  onChange={(e) => setCoverImageUrl(e.target.value || null)}
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', border: '1px solid var(--color-border-subtle)', background: 'var(--color-bg-primary)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.25rem' }}
              >
                <Plus size={14} />
                <span>{editingId ? (isSaving ? 'Updating...' : 'Update Category') : (isSaving ? 'Creating...' : 'Create Category')}</span>
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

        {/* Existing Categories List */}
        <div className="luxury-card" style={{ padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Existing Categories</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Display Order &amp; Count
            </span>
          </div>

          {isLoading ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
              <span className="kicker">LOADING TAXONOMY...</span>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <FolderTree size={36} style={{ margin: '0 auto var(--space-3)' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>No Categories Created Yet</h4>
              <p style={{ fontSize: '0.85rem' }}>Use the form on the left to add your first furniture discipline.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {categories.map((c, index) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: editingId === c.id ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                    border: editingId === c.id ? '1px solid var(--color-accent-gold)' : '1px solid var(--color-border-subtle)',
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
                        disabled={index === categories.length - 1}
                        onClick={() => handleMoveOrder(index, 'down')}
                        title="Move Down"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: index === categories.length - 1 ? 'default' : 'pointer',
                          opacity: index === categories.length - 1 ? 0.3 : 1,
                          padding: '1px'
                        }}
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>

                    {/* Cover Thumbnail */}
                    {c.coverImageUrl ? (
                      <img
                        src={c.coverImageUrl}
                        alt={c.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', border: '1px solid var(--color-border-subtle)' }}
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={16} color="var(--color-text-muted)" />
                      </div>
                    )}

                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        /{c.slug}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span className="badge" style={{ fontSize: '0.65rem' }}>
                      {c.productCount} {c.productCount === 1 ? 'piece' : 'pieces'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEdit(c)}
                      title="Edit Category"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px' }}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      title="Delete Category"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#b31d28', padding: '4px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
