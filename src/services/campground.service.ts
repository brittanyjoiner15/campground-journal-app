import { supabase } from './supabase';
import type { Campground } from '../types/campground';

export const campgroundService = {
  async getCampgroundByGooglePlaceId(googlePlaceId: string) {
    const { data, error } = await supabase
      .from('campgrounds')
      .select('*')
      .eq('google_place_id', googlePlaceId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data as Campground | null;
  },

  async getCampgroundById(id: string) {
    const { data, error } = await supabase
      .from('campgrounds')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Campground;
  },

  async createCampground(campgroundData: {
    google_place_id: string;
    name: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    phone?: string | null;
    website?: string | null;
    google_rating?: number | null;
    google_maps_url?: string | null;
  }) {
    const { data, error } = await supabase
      .from('campgrounds')
      .insert([campgroundData])
      .select()
      .single();

    if (error) throw error;
    return data as Campground;
  },

  async getOrCreateCampground(
    googlePlaceId: string,
    campgroundData: {
      google_place_id: string;
      name: string;
      address?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
      latitude?: number | null;
      longitude?: number | null;
      phone?: string | null;
      website?: string | null;
      google_rating?: number | null;
      google_maps_url?: string | null;
    }
  ) {
    // Check if campground already exists first
    const existing = await this.getCampgroundByGooglePlaceId(googlePlaceId);
    if (existing) {
      // Check if existing record is missing coordinates but we have them now
      const hasNewCoords = campgroundData.latitude != null && campgroundData.longitude != null;
      const needsCoordinateUpdate =
        (!existing.latitude || !existing.longitude) && hasNewCoords;

      if (needsCoordinateUpdate) {
        console.log('Updating existing campground with coordinates:', {
          name: existing.name,
          oldLat: existing.latitude,
          oldLng: existing.longitude,
          newLat: campgroundData.latitude,
          newLng: campgroundData.longitude,
        });

        // Update the existing record with the new coordinates
        const { data, error } = await supabase
          .from('campgrounds')
          .update({
            latitude: campgroundData.latitude,
            longitude: campgroundData.longitude,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as Campground;
      }

      return existing;
    }

    // If not, create it
    try {
      return await this.createCampground(campgroundData);
    } catch (error: any) {
      // Handle race condition: another request created it between our check and insert
      if (error.code === '23505') {
        const existing = await this.getCampgroundByGooglePlaceId(googlePlaceId);
        if (existing) return existing;
      }
      throw error;
    }
  },

  async getAllCampgrounds(limit = 50) {
    const { data, error } = await supabase
      .from('campgrounds')
      .select('*')
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Campground[];
  },

  async getCampgroundStats(campgroundId: string) {
    const { data, error } = await supabase
      .from('campground_stats')
      .select('*')
      .eq('id', campgroundId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  async getCampgroundVisitors(campgroundId: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        user_id,
        profile:profiles!journal_entries_user_id_fkey(
          id, username, full_name, avatar_url
        )
      `)
      .eq('campground_id', campgroundId);

    if (error) throw error;

    // Remove duplicates and extract unique profiles
    const uniqueProfiles = new Map();
    data?.forEach((entry: any) => {
      if (entry.profile && !uniqueProfiles.has(entry.profile.id)) {
        uniqueProfiles.set(entry.profile.id, entry.profile);
      }
    });

    return Array.from(uniqueProfiles.values());
  },

  async getCampgroundJournalEntries(campgroundId: string, limit: number = 6) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        campground:campgrounds(*),
        photos(*),
        profile:profiles!journal_entries_user_id_fkey(
          id, username, full_name, avatar_url
        )
      `)
      .eq('campground_id', campgroundId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};
