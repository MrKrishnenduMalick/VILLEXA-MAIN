import { Product } from '../types/product';

/**
 * MASTER INAUGURAL ATELIER CATALOGUE
 * Authoritative curated pieces displayed across Homepage, Catalogue, and Product Detail Pages
 * whenever the showroom operates in showcase or fallback mode.
 */
export const INAUGURAL_CATALOGUE: Product[] = [
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
    careInstructions: 'Professional upholstery clean only. Vacuum gently with soft brush attachment. Protect from direct prolonged sunlight.',
    dimensions: {
      width: 86,
      depth: 82,
      height: 78,
      seatHeight: 44,
      unit: 'cm'
    },
    primaryImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=85'
    ],
    finishes: [],
    preferredViewer: 'gallery',
    tags: ['Living Room', 'Armchair', 'Velvet', 'Seating'],
    isFeatured: true,
    sortOrder: 1,
    status: 'published',
    createdAt: '2026-10-18T00:00:00.000Z',
    updatedAt: '2026-10-18T00:00:00.000Z'
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
    fullDescription: 'Hand-honed Calacatta Viola and Nero Marquina marble with organic beveled edge profile, balanced on a precision-fluted architectural timber column. Comfortably seats eight guests.',
    materials: 'Honed Calacatta Viola Marble, French Walnut, Steel Substructure',
    careInstructions: 'Clean with damp microfiber cloth and pH-neutral stone soap. Re-seal marble surface biannually. Avoid citrus and acidic liquids.',
    dimensions: {
      width: 160,
      depth: 160,
      height: 75,
      unit: 'cm'
    },
    primaryImageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85'
    ],
    finishes: [],
    preferredViewer: 'gallery',
    tags: ['Dining Room', 'Marble Table', 'Dining'],
    isFeatured: true,
    sortOrder: 2,
    status: 'published',
    createdAt: '2026-10-18T00:00:00.000Z',
    updatedAt: '2026-10-18T00:00:00.000Z'
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
    fullDescription: 'An architectural sanctuary piece. Sensorial bouclé headboard padding with sound-dampening acoustic core and solid American walnut frame with concealed joinery and recessed plinth lighting.',
    materials: 'Virgin Wool Bouclé, Solid American Walnut, Powder-Coated Steel Frame',
    careInstructions: 'Spot clean bouclé with distilled water and mild wool detergent. Condition walnut surfaces annually with natural beeswax emulsion.',
    dimensions: {
      width: 220,
      depth: 215,
      height: 98,
      seatHeight: 32,
      unit: 'cm'
    },
    primaryImageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=85'
    ],
    finishes: [],
    preferredViewer: 'gallery',
    tags: ['Bedroom', 'Bed', 'Bouclé', 'Platform Bed'],
    isFeatured: true,
    sortOrder: 3,
    status: 'published',
    createdAt: '2026-10-18T00:00:00.000Z',
    updatedAt: '2026-10-18T00:00:00.000Z'
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
    fullDescription: 'Cut from Tivoli quarry stone with natural unfilled cavities and matte tactile finish, paired with 12mm tempered bronze glass and concealed felt architectural glides.',
    materials: 'Roman Travertine, Tempered Smoked Glass, Brushed Bronze Fixtures',
    careInstructions: 'Dust with soft dry cloth. Wipe glass surfaces with lint-free microfiber. Avoid abrasive chemical cleaning compounds.',
    dimensions: {
      width: 140,
      depth: 80,
      height: 36,
      unit: 'cm'
    },
    primaryImageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1000&q=85'
    ],
    finishes: [],
    preferredViewer: 'gallery',
    tags: ['Living Room', 'Coffee Table', 'Travertine', 'Table'],
    isFeatured: true,
    sortOrder: 4,
    status: 'published',
    createdAt: '2026-10-18T00:00:00.000Z',
    updatedAt: '2026-10-18T00:00:00.000Z'
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
    fullDescription: 'Continuous grain matching across all four doors, soft-close Blumotion German hardware, and interior adjustable shelves with integrated warm LED illumination and Italian saddle leather lining.',
    materials: 'French Walnut, Satin Brushed Bronze, Italian Leather Lining',
    careInstructions: 'Wipe along wood grain with soft damp cotton cloth. Reapply natural botanical wood balm periodically. Protect from direct heat sources.',
    dimensions: {
      width: 200,
      depth: 50,
      height: 72,
      unit: 'cm'
    },
    primaryImageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=85'
    ],
    finishes: [],
    preferredViewer: 'gallery',
    tags: ['Storage', 'Credenza', 'Walnut', 'Sideboard'],
    isFeatured: true,
    sortOrder: 5,
    status: 'published',
    createdAt: '2026-10-18T00:00:00.000Z',
    updatedAt: '2026-10-18T00:00:00.000Z'
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
    fullDescription: 'Hand-burnished full grain Tuscan saddle leather suspended on an architectural bronze frame with ergonomic lumbar support and hand-stitched saddle welt detailing.',
    materials: 'Tuscan Saddle Leather, Patinated Bronze, High-Density Latex Core',
    careInstructions: 'Condition leather twice yearly with aniline cream. Wipe frame with microfiber cloth. Avoid sharp objects and direct moisture.',
    dimensions: {
      width: 82,
      depth: 88,
      height: 84,
      seatHeight: 40,
      unit: 'cm'
    },
    primaryImageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=85',
    galleryImages: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=85'
    ],
    finishes: [],
    preferredViewer: 'gallery',
    tags: ['Living Room', 'Lounge Chair', 'Leather', 'Seating'],
    isFeatured: true,
    sortOrder: 6,
    status: 'published',
    createdAt: '2026-10-18T00:00:00.000Z',
    updatedAt: '2026-10-18T00:00:00.000Z'
  }
];

export const INAUGURAL_CATALOGUE_BY_SLUG: Record<string, Product> = INAUGURAL_CATALOGUE.reduce(
  (acc, prod) => {
    acc[prod.slug] = prod;
    return acc;
  },
  {} as Record<string, Product>
);
