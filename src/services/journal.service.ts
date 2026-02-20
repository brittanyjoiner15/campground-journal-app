import { supabase } from './supabase';
import type { JournalEntry, CreateJournalEntry, UpdateJournalEntry, JournalEntryWithProfile } from '../types/journal';

export const journalService = {
  async getUserJournalEntries(userId: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        campground:campgrounds(*),
        photos(*)
      `)
      .eq('user_id', userId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data as JournalEntry[];
  },

  async getJournalEntryById(id: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        campground:campgrounds(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as JournalEntry;
  },

  async createJournalEntry(userId: string, entry: CreateJournalEntry) {
    console.log('Creating journal entry for user:', userId, 'campground:', entry.campground_id);
    console.log('About to perform journal INSERT...');

    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{
        user_id: userId,
        ...entry,
      }])
      .select()
      .single();

    console.log('Journal insert result - data:', data, 'error:', error);

    if (error) {
      console.error('Journal insert error:', error);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      throw error;
    }

    console.log('Successfully created journal entry with id:', data.id);
    return data as JournalEntry;
  },

  async updateJournalEntry(entryId: string, updates: UpdateJournalEntry) {
    const { data, error } = await supabase
      .from('journal_entries')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return data as JournalEntry;
  },

  async deleteJournalEntry(entryId: string) {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
  },

  async getEntriesForCampground(userId: string, campgroundId: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('campground_id', campgroundId);

    if (error) throw error;
    return data as JournalEntry[];
  },

  async getFeedEntries(userId: string) {
    const { data: followingIds, error: followError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followError) throw followError;

    if (!followingIds || followingIds.length === 0) {
      return [] as JournalEntryWithProfile[];
    }

    const userIds = followingIds.map(f => f.following_id);

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
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as JournalEntryWithProfile[];
  },
};
