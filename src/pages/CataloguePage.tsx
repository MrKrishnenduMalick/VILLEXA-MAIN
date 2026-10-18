import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { CatalogueProductCard } from '../components/common/CatalogueProductCard';
import { productService } from '../services/productService';
import { Product, ProductCategory } from '../types/product';

const DEFAULT_CATEGORIES: Array<{ id: string; name: string }> = [
  { id: 'all', name: 'All Pieces' },
  { id: 'living', name: 'Living Room' },
  { id: 'dining', name: 'Dining' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'outdoor', name: 'Outdoor' },
  { id: 'storage', name: 'Storage' },
  { id: 'lighting', name: 'Lighting' },
  { id: 'decor', name: 'Decor' }
];

const INAUGURAL_CATALOGUE: Product[] = [
  {
    id: 'inaugural-1',
    slug: 'emerald-velvet-armchair',
    name: 'Emerald Velvet Armchair',
    sku: 'VLX-CH-01',
    categoryId: 'living',
    categoryName: 'LIVING ROOM',
    regularPrice: 1200,
    currency: 'USD',
    showPricePublicly: true,
    isEnquiryOnly: false,
    shortDescription: 'A contemporary emerald velvet barrel armchair with sculpted rounded arms and refined silhouette.',
    fullDescription: 'Sculpted in our Brianza atelier with high-resilience memory foam, hand-upholstered in Italian emerald velvet over a kiln-dried European beech frame with tapered brushed brass legs.',
    materials: 'Italian Emerald Velvet, European Beech, Brushed Brass',
    primaryImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=85',
    galleryImages: [],
    finishes: [],
    preferredViewer: 'gallery',
    tags: ['Living Room', 'Armchair', 'Velvet'],
    isFeatured: true,
    sortOrder: 1,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inaugural-2',
    slug: 'marble-dining-table',
    name: 'Marble Dining Table',
    sku: 'VLX-DT-02',
    categoryId: 'dining',
    categoryName: 'DINING',
    regularPrice: 2800,
    currency: 'USD',
    showPricePublicly: true,
    isEnquiryOnly: false,
    shortDescription: 'Monolithic circular dining table sculpted from vein-matched Italian marble on a fluted base.',
    fullDescription: 'Hand-honed Calacatta Viola and Nero Marquina marble with organic beveled edge profile, balanced on a precision-fluted architectural timber column.',
    materials: 'Honed Calacatta Viola Marble, French Walnut',
    primaryImageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=85',
    galleryImages: [],
    finishes: [],
    preferredViewer: 'gallery',
    tags: ['Dining Room', 'Marble Table'],
    isFeatured: true,
    sortOrder: 2,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inaugural-3',
    slug: 'italian-upholstered-bed',
    name: 'Italian Upholstered Bed',
    sku: 'VLX-BD-03',
    categoryId: 'bedroom',
    categoryName: 'BEDROOM',
    regularPrice: 3500,
    currency: 'USD',
    showPricePublicly: true,
    isEnquiryOnly: false,
    shortDescription: 'Minimalist low-profile platform bed upholstered in virgin wool bouclé with integrated walnut floating nightstands.',
    fullDescription: 'An architectural sanctuary piece. Sensorial bouclé headboard padding with sound-dampening acoustic core and solid American walnut frame with concealed joinery.',
    materials: 'Virgin Wool Bouclé, Solid American Walnut, Steel Subframe',
    primaryImageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=85',
    galleryImages: [],
    finishes: [],
    preferredViewer: 'gallery',
    tags: ['Bedroom', 'Bed', 'Bouclé'],
    isFeatured: true,
    sortOrder: 3,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inaugural-4',
    slug: 'travertine-coffee-table',
    name: 'Travertine Low Table',
    sku: 'VLX-CT-04',
    categoryId: 'living',
    categoryName: 'LIVING ROOM',
    regularPrice: 1650,
    currency: 'USD',
    showPricePublicly: true,
    isEnquiryOnly: false,
    shortDescription: 'Geometric dialogue between Roman travertine and dark smoked glass cantilever surfaces.',
    fullDescription: 'Cut from Tivoli quarry stone with natural unfilled cavities and matte finish, paired with 12mm tempered bronze glass.',
    materials: 'Roman Travertine, Tempered Smoked Glass',
    primaryImageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=85',
    galleryImages: [],
    finishes: [],
    preferredViewer: 'gallery',
    tags: ['Living Room', 'Coffee Table', 'Travertine'],
    isFeatured: true,
    sortOrder: 4,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inaugural-5',
    slug: 'fluted-walnut-credenza',
    name: 'Fluted Walnut Credenza',
    sku: 'VLX-SB-05',
    categoryId: 'storage',
    categoryName: 'STORAGE',
    regularPrice: 4200,
    currency: 'USD',
    showPricePublicly: true,
    isEnquiryOnly: false,
    shortDescription: 'Architectural sideboard featuring three-dimensional hand-fluted French walnut doors and bronze hardware.',
    fullDescription: 'Continuous grain matching across all four doors, soft-close Blumotion German hardware, and interior adjustable shelves with integrated warm LED illumination.',
    materials: 'French Walnut, Satin Brushed Bronze, Italian Leather Lining',
    primaryImageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=85',
    galleryImages: [],
    finishes: [],
    preferredViewer: 'gallery',
    tags: ['Storage', 'Credenza', 'Walnut'],
    isFeatured: true,
    sortOrder: 5,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'inaugural-6',
    slug: 'monolithic-lounge-chair',
    name: 'Monolithic Lounge Chair',
    sku: 'VLX-LC-06',
    categoryId: 'living',
    categoryName: 'LIVING ROOM',
    regularPrice: 1950,
    currency: 'USD',
    showPricePublicly: true,
    isEnquiryOnly: false,
    shortDescription: 'Sculptural reading chair in saddle leather and patinated bronze frame.',
    fullDescription: 'Hand-burnished full grain Tuscan saddle leather suspended on an architectural bronze frame with ergonomic lumbar support.',
    materials: 'Tuscan Saddle Leather, Patinated Bronze',
    primaryImageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=85',
    galleryImages: [],
    finishes: [],
    preferredViewer: 'gallery',
    tags: ['Living Room', 'Lounge Chair', 'Leather'],
    isFeatured: true,
    sortOrder: 6,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const CataloguePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>(DEFAULT_CATEGORIES);
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat) return cat.toLowerCase();
    }
    return 'all';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  // Sync category from URL if route query changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat) {
        setActiveCategory(cat.toLowerCase());
      }
    }
  }, []);

  useEffect(() => {
    async function loadCatalogue() {
      try {
        const [loadedProducts, loadedCategories] = await Promise.all([
          productService.getPublishedProducts(),
          productService.getCategories()
        ]);
        if (loadedProducts.length > 0) {
          setProducts(loadedProducts);
        } else {
          setProducts(INAUGURAL_CATALOGUE);
        }

        if (loadedCategories.length > 0) {
          setCategories([
            { id: 'all', name: 'All Pieces' },
            ...loadedCategories.map((c: ProductCategory) => ({ id: c.id, name: c.name }))
          ]);
        }
      } catch {
        setProducts(INAUGURAL_CATALOGUE);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalogue();
  }, []);

  // Filter products based on search & category
  const filteredProducts = products.filter((p) => {
    const activeLower = activeCategory.toLowerCase();
    const isSeatingMatch = activeLower === 'seating' && (
      p.categoryId?.toLowerCase() === 'seating' ||
      p.categoryName?.toLowerCase().includes('seating') ||
      p.name?.toLowerCase().includes('chair') ||
      p.name?.toLowerCase().includes('sofa') ||
      p.tags?.some((t) => t.toLowerCase().includes('chair') || t.toLowerCase().includes('armchair') || t.toLowerCase().includes('sofa'))
    );

    const matchesCategory =
      activeLower === 'all' ||
      isSeatingMatch ||
      p.categoryId?.toLowerCase() === activeLower ||
      (p.categoryName && p.categoryName.toLowerCase().includes(activeLower)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(activeLower)));

    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.materials.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-24)', position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Page Heading Matching Reference Image */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
              fontWeight: 300,
              color: '#ffffff',
              marginBottom: '6px',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.7)'
            }}
          >
            Catalogue
          </h1>
          <p
            style={{
              fontSize: '1.05rem',
              color: 'rgba(255, 255, 255, 0.82)',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
              maxWidth: '680px'
            }}
          >
            Explore our curated collection of luxury furniture and timeless pieces.
          </p>
        </div>

        {/* Floating Glass Toolbar Matching Reference Image */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            padding: '10px 16px',
            backgroundColor: 'rgba(24, 20, 17, 0.65)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '9999px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
            marginBottom: 'var(--space-10)'
          }}
        >
          {/* Search Pill Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flex: '1 1 280px',
              maxWidth: '440px',
              padding: '6px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <Search size={16} color="var(--color-accent-gold)" />
            <input
              type="text"
              placeholder="Search products, materials, styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                color: '#ffffff'
              }}
            />
          </div>

          {/* Right Controls: Filters, Sort, and View Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {/* Filter Button Pill */}
            <button
              type="button"
              className="glass-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                fontSize: '0.78rem',
                letterSpacing: '0.06em'
              }}
            >
              <SlidersHorizontal size={13} color="var(--color-accent-gold)" />
              <span>Filters</span>
            </button>

            {/* Sort Selector Dropdown */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '9999px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.78rem',
                  color: '#ffffff',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="featured" style={{ background: '#1c1815', color: '#fff' }}>Featured →</option>
                <option value="price-asc" style={{ background: '#1c1815', color: '#fff' }}>Price: Low to High</option>
                <option value="price-desc" style={{ background: '#1c1815', color: '#fff' }}>Price: High to Low</option>
                <option value="name" style={{ background: '#1c1815', color: '#fff' }}>Alphabetical</option>
              </select>
            </div>

            {/* Grid vs List View Toggles */}
            <div style={{ display: 'flex', gap: '4px', borderLeft: '1px solid rgba(255, 255, 255, 0.15)', paddingLeft: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
                style={{
                  background: viewMode === 'grid' ? 'rgba(197, 160, 89, 0.3)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: viewMode === 'grid' ? 'var(--color-accent-gold)' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List View"
                style={{
                  background: viewMode === 'list' ? 'rgba(197, 160, 89, 0.3)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: viewMode === 'list' ? 'var(--color-accent-gold)' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Split Layout: Category Sidebar (Left) + Product Grid (Right) Matching Reference Image */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            gap: 'var(--space-8)',
            alignItems: 'start'
          }}
          className="catalogue-split-grid"
        >
          {/* LEFT SIDEBAR: Floating Frosted Glass Category Menu */}
          <aside
            style={{
              backgroundColor: 'rgba(24, 20, 17, 0.65)',
              backdropFilter: 'blur(20px) saturate(135%)',
              WebkitBackdropFilter: 'blur(20px) saturate(135%)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              borderRadius: '20px',
              padding: 'var(--space-4)',
              boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              position: 'sticky',
              top: '96px'
            }}
            className="catalogue-category-sidebar"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    fontSize: '0.82rem',
                    letterSpacing: '0.04em',
                    fontWeight: isActive ? 500 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isActive ? '1px solid var(--color-accent-gold)' : '1px solid transparent',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(197, 160, 89, 0.35) 0%, rgba(197, 160, 89, 0.15) 100%)'
                      : 'transparent',
                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.72)',
                    boxShadow: isActive ? '0 0 16px rgba(197, 160, 89, 0.25)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)';
                    }
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </aside>

          {/* RIGHT COLUMN: Product Grid Matching Reference */}
          <div>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
                <span className="kicker">QUERYING ATELIER ARCHIVE...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-16)',
                  backgroundColor: 'rgba(24, 20, 17, 0.65)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  textAlign: 'center'
                }}
              >
                <h3 style={{ fontSize: '1.4rem', color: '#ffffff', marginBottom: '8px' }}>
                  No pieces found matching &quot;{searchQuery}&quot;
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: 'var(--space-6)' }}>
                  Try resetting filters or adjusting search parameters.
                </p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="btn btn-gold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
                  gap: 'var(--space-6)'
                }}
              >
                {filteredProducts.map((p) => (
                  <CatalogueProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .catalogue-split-grid {
            grid-template-columns: 1fr !important;
          }
          .catalogue-category-sidebar {
            position: static !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            padding: var(--space-2) !important;
            gap: 4px !important;
          }
          .catalogue-category-sidebar button {
            white-space: nowrap !important;
            width: auto !important;
            padding: 8px 14px !important;
          }
        }
      `}</style>
    </div>
  );
};
