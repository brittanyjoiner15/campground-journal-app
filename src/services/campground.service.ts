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
    console.log('Inserting campground:', campgroundData.name);
    console.log('Supabase client:', supabase ? 'initialized' : 'NOT initialized');
    console.log('About to perform INSERT...');

    try {
      const insertPromise = supabase
        .from('campgrounds')
        .insert([campgroundData])
        .select()
        .single();

      console.log('INSERT promise created:', insertPromise);

      const { data, error } = await insertPromise;

      console.log('INSERT completed - data:', data, 'error:', error);

      if (error) {
        console.error('Insert error:', error);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }

      console.log('Campground created:', data.id);
      return data as Campground;
    } catch (err) {
      console.error('Exception in createCampground:', err);
      throw err;
    }
  },

  async getOrCreateCampground(
    googlePlaceId: string,
    campgroundData: Parameters<typeof this.createCampground>[0]
  ) {
    console.log('getOrCreateCampground for:', googlePlaceId);

    // Try to insert directly - if it already exists, we'll get a duplicate key error
    try {
      const created = await this.createCampground(campgroundData);
      console.log('Created new campground:', created.id);
      return created;
    } catch (error: any) {
      // If duplicate key error (campground already exists), fetch it
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        console.log('Campground already exists, fetching...');
        const existing = await this.getCampgroundByGooglePlaceId(googlePlaceId);
        if (existing) {
          console.log('Found existing campground:', existing.id);
          return existing;
        }
      }
      // Re-throw other errors
      console.error('Error in getOrCreateCampground:', error);
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
