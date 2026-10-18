import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { collectionService } from '../services/collectionService';
import { Collection } from '../types/collection';

interface InauguralSuite {
  id: string;
  name: string;
  headline: string;
  piecesCount: number;
  description: string;
  imageUrl: string;
  categoryFilter?: string;
}

const INAUGURAL_SUITES: InauguralSuite[] = [
  {
    id: 'living-room',
    name: 'Living Room',
    headline: 'SALONE PRINCIPALE',
    piecesCount: 12,
    description: 'Sculptural seating, monolithic travertine tables, and ambient architectural consoles.',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
    categoryFilter: 'Living Room'
  },
  {
    id: 'dining',
    name: 'Dining',
    headline: 'SALA DA PRANZO',
    piecesCount: 8,
    description: 'Honed Calacatta marble tables, ergonomic leather chairs, and architectural sideboards.',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=80',
    categoryFilter: 'Dining'
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    headline: 'SUITE NOTTE',
    piecesCount: 10,
    description: 'Floating Italian upholstered beds, bouclé benches, and minimalist bedside monoliths.',
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80',
    categoryFilter: 'Bedroom'
  },
  {
    id: 'outdoor',
    name: 'Outdoor',
    headline: 'TERRAZZA & GIARDINO',
    piecesCount: 6,
    description: 'Weather-defying teakwood loungers, stone plinths, and bespoke outdoor lounge compositions.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    categoryFilter: 'Outdoor'
  },
  {
    id: 'lighting',
    name: 'Architectural Lighting',
    headline: 'LUCE ARCHITETTONICA',
    piecesCount: 7,
    description: 'Brushed brass floor monoliths, alabaster wall sconces, and hand-blown Murano pendants.',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    categoryFilter: 'Lighting'
  },
  {
    id: 'decor',
    name: 'Atelier Objects',
    headline: 'OGGETTI D\'ARTE',
    piecesCount: 9,
    description: 'Hand-carved marble vessels, smoked bronze mirrors, and tactile sculptural accessories.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
    categoryFilter: 'Decor'
  }
];

export const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      try {
        const loaded = await collectionService.getPublishedCollections();
        setCollections(loaded);
      } finally {
        setIsLoading(false);
      }
    }
    loadCollections();
  }, []);

  return (
    <div style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-24)' }}>
      <div className="container">
        {/* Header matching Reference Image */}
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <SectionHeader
            kicker="OUR COLLECTIONS"
            title="Spaces with a Soul"
            subtitle="Curated suites for every architectural space in your home, hand-sculpted in Brianza."
          />
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
            <span className="kicker">LOADING ATELIER SUITES...</span>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            {/* Show DB collections if any exist */}
            {collections.map((col) => (
              <div
                key={col.id}
                className="luxury-glass-card"
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <div style={{ height: '240px', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
                  {col.coverImageUrl ? (
                    <img
                      src={col.coverImageUrl}
                      alt={col.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(20, 17, 14, 0.8)' }}>
                      <span className="kicker" style={{ color: 'var(--color-accent-gold)' }}>Atelier Suite</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(16, 13, 11, 0.75) 0%, transparent 60%)' }} />
                </div>
                <div style={{ padding: 'var(--space-4) var(--space-2) var(--space-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="kicker" style={{ fontSize: '0.7rem', color: 'var(--color-accent-gold)' }}>{col.headline || 'SUITE'}</span>
                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: '#ffffff', margin: '2px 0 0' }}>{col.name}</h3>
                  </div>
                  <Link
                    href={`/catalogue`}
                    className="glass-pill"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      color: '#ffffff',
                      textDecoration: 'none'
                    }}
                  >
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}

            {/* Inaugural Suites (Matching Reference Image) */}
            {INAUGURAL_SUITES.map((suite) => (
              <div
                key={suite.id}
                className="luxury-glass-card"
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <div style={{ height: '260px', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={suite.imageUrl}
                    alt={suite.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease'
                    }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(16, 13, 11, 0.70) 0%, transparent 50%)' }} />
                </div>
                <div style={{ padding: 'var(--space-4) var(--space-2) var(--space-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontFamily: 'var(--font-serif)',
                      color: '#ffffff',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      margin: 0
                    }}>
                      {suite.name}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)' }}>
                      {suite.piecesCount} Pieces
                    </span>
                  </div>
                  <Link
                    href={`/catalogue`}
                    className="glass-pill"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      color: '#ffffff',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
