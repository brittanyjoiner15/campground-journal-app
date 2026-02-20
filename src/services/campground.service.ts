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
    campgroundData: Parameters<typeof this.createCampground>[0]
  ) {
    // Check if campground already exists first
    const existing = await this.getCampgroundByGooglePlaceId(googlePlaceId);
    if (existing) {
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
};
