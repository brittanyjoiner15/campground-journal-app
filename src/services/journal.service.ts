import { supabase } from './supabase';
import type { JournalEntry, CreateJournalEntry, UpdateJournalEntry, JournalEntryWithProfile } from '../types/journal';

export const journalService = {
  async getUserJournalEntries(userId: string) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select(`
        *,
        campground:campgrounds(*),
        photos(*),
        shared_from_profile:profiles!journal_entries_shared_from_user_id_fkey(
          id, username, full_name, avatar_url
        ),
        shared_with_profile:profiles!journal_entries_shared_with_user_id_fkey(
          id, username, full_name, avatar_url
        )
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
        campground:campgrounds(*),
        photos(*)
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

  async shareJournalEntry(entryId: string, recipientUserId: string, currentUserId: string) {
    // Fetch the original entry with photos
    const { data: originalEntry, error: fetchError } = await supabase
      .from('journal_entries')
      .select(`
        *,
        photos(*)
      `)
      .eq('id', entryId)
      .single();

    if (fetchError) throw fetchError;

    // Check for duplicate shares
    const { data: existingShare, error: checkError } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', recipientUserId)
      .eq('campground_id', originalEntry.campground_id)
      .eq('status', 'draft')
      .eq('shared_from_user_id', currentUserId)
      .eq('start_date', originalEntry.start_date)
      .eq('end_date', originalEntry.end_date);

    if (checkError) throw checkError;

    if (existingShare && existingShare.length > 0) {
      throw new Error('This entry has already been shared with this user');
    }

    // Create draft entry for recipient
    const { data: draftEntry, error: createError } = await supabase
      .from('journal_entries')
      .insert([{
        user_id: recipientUserId,
        campground_id: originalEntry.campground_id,
        start_date: originalEntry.start_date,
        end_date: originalEntry.end_date,
        notes: originalEntry.notes,
        is_favorite: false,
        status: 'draft',
        shared_from_user_id: currentUserId,
        original_entry_id: entryId,
      }])
      .select()
      .single();

    if (createError) throw createError;

    // Update original entry to track who it was shared with
    const { error: updateError } = await supabase
      .from('journal_entries')
      .update({
        shared_with_user_id: recipientUserId,
        shared_accepted: false,
      })
      .eq('id', entryId);

    if (updateError) throw updateError;

    // Duplicate photo records if any exist
    if (originalEntry.photos && originalEntry.photos.length > 0) {
      const photoInserts = originalEntry.photos.map(photo => ({
        user_id: recipientUserId,
        campground_id: originalEntry.campground_id,
        journal_entry_id: draftEntry.id,
        storage_path: photo.storage_path,
        public_url: photo.public_url,
        caption: photo.caption,
      }));

      const { error: photoError } = await supabase
        .from('photos')
        .insert(photoInserts);

      if (photoError) throw photoError;
    }

    return draftEntry as JournalEntry;
  },

  async acceptDraft(draftId: string, userId: string) {
    // Verify user owns the draft
    const { data: draft, error: fetchError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', draftId)
      .eq('user_id', userId)
      .eq('status', 'draft')
      .single();

    if (fetchError) throw fetchError;

    // Update status to published
    const { data, error } = await supabase
      .from('journal_entries')
      .update({ status: 'published' })
      .eq('id', draftId)
      .select()
      .single();

    if (error) throw error;

    // Update original entry to mark as accepted
    if (draft.original_entry_id) {
      const { error: updateOriginalError } = await supabase
        .from('journal_entries')
        .update({ shared_accepted: true })
        .eq('id', draft.original_entry_id);

      if (updateOriginalError) {
        console.error('Failed to update original entry:', updateOriginalError);
        // Don't throw - the draft was still successfully accepted
      }
    }

    return data as JournalEntry;
  },

  async rejectDraft(draftId: string, userId: string) {
    // Verify user owns the draft
    const { data: draft, error: fetchError } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('id', draftId)
      .eq('user_id', userId)
      .eq('status', 'draft')
      .single();

    if (fetchError) throw fetchError;

    // Delete the draft (photos cascade)
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', draftId);

    if (error) throw error;
  },
};
