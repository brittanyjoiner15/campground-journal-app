import { supabase } from './supabase';
import { STORAGE_BUCKETS, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '../utils/constants';
import { getStoragePath } from '../utils/helpers';

export const storageService = {
  async uploadPhoto(
    file: File,
    userId: string,
    campgroundId: string
  ): Promise<{ path: string; url: string }> {
    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 5MB');
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Only JPG, PNG, and WebP images are allowed');
    }

    // Generate storage path
    const path = getStoragePath(userId, campgroundId, file.name);

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.CAMPGROUND_PHOTOS)
      .upload(path, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.CAMPGROUND_PHOTOS)
      .getPublicUrl(path);

    return { path, url: publicUrl };
  },

  async deletePhoto(path: string) {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.CAMPGROUND_PHOTOS)
      .remove([path]);

    if (error) throw error;
  },

  async savePhotoRecord(
    userId: string,
    campgroundId: string,
    journalEntryId: string | null,
    path: string,
    url: string,
    caption?: string
  ) {
    const { data, error } = await supabase
      .from('photos')
      .insert([{
        user_id: userId,
        campground_id: campgroundId,
        journal_entry_id: journalEntryId,
        storage_path: path,
        public_url: url,
        caption: caption || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getPhotosForJournalEntry(journalEntryId: string) {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('journal_entry_id', journalEntryId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async deletePhotoRecord(photoId: string) {
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (error) throw error;
  },

  async uploadAvatar(
    file: File,
    userId: string
  ): Promise<{ path: string; url: string }> {
    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size must be less than 5MB');
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Only JPG, PNG, and WebP images are allowed');
    }

    // Generate storage path
    const fileExt = file.name.split('.').pop();
    const path = `${userId}/avatar.${fileExt}`;

    // Delete old avatar if exists
    try {
      await supabase.storage
        .from(STORAGE_BUCKETS.AVATARS)
        .remove([path]);
    } catch (err) {
      // Ignore error if file doesn't exist
    }

    // Upload file
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.AVATARS)
      .upload(path, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.AVATARS)
      .getPublicUrl(path);

    return { path, url: publicUrl };
  },
};
