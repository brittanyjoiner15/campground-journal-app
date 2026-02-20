import { supabase } from './supabase';
import type { Profile } from '../types/user';

export const userService = {
  async getProfileByUsername(username: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      throw error;
    }

    return data as Profile;
  },

  async getProfileById(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async getUserStats(userId: string) {
    // Get total journal entries
    const { count: journalCount, error: journalError } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (journalError) throw journalError;

    // Get total photos
    const { count: photoCount, error: photoError } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (photoError) throw photoError;

    return {
      totalCampgrounds: journalCount || 0,
      totalPhotos: photoCount || 0,
    };
  },

  async searchUsers(searchQuery: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio')
      .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
      .limit(limit);

    if (error) throw error;
    return data as Profile[];
  },
};
