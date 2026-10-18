/**
 * VILLEXA COLLECTION & ROOM DOMAIN TYPES
 */

export interface Collection {
  id: string;
  slug: string;
  name: string;
  season?: string;
  headline: string;
  description: string;
  coverImageUrl?: string | null;
  videoUrl?: string | null;
  videoPosterUrl?: string | null;
  featuredProductIds: string[];
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
}

export interface RoomInspiration {
  id: string;
  title: string;
  roomType: 'living' | 'dining' | 'bedroom' | 'study' | 'bespoke';
  description: string;
  imageUrl: string | null;
  associatedProductIds: string[];
}
