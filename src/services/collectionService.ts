import { Collection, RoomInspiration } from '../types/collection';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const collectionService = {
  async getPublishedCollections(): Promise<Collection[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error || !data) return [];

      return data.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        headline: c.headline,
        description: c.description,
        coverImageUrl: c.cover_image_url || null,
        videoUrl: c.video_url || null,
        videoPosterUrl: c.video_poster_url || null,
        featuredProductIds: [],
        sortOrder: c.sort_order,
        isPublished: c.is_published,
        createdAt: c.created_at
      }));
    } catch {
      return [];
    }
  },

  async getCollectionBySlug(slug: string): Promise<Collection | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        slug: data.slug,
        name: data.name,
        headline: data.headline,
        description: data.description,
        coverImageUrl: data.cover_image_url || null,
        videoUrl: data.video_url || null,
        videoPosterUrl: data.video_poster_url || null,
        featuredProductIds: [],
        sortOrder: data.sort_order,
        isPublished: data.is_published,
        createdAt: data.created_at
      };
    } catch {
      return null;
    }
  },

  async getRoomInspirations(): Promise<RoomInspiration[]> {
    return [];
  }
};
