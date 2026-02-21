import type { Campground } from './campground';
import type { Profile } from './user';

export interface Photo {
  id: string;
  user_id: string;
  campground_id: string;
  journal_entry_id: string | null;
  storage_path: string;
  public_url: string;
  caption: string | null;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  campground_id: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  video_url: string | null;
  is_favorite: boolean;
  status: 'published' | 'draft';
  shared_from_user_id: string | null;
  shared_with_user_id: string | null;
  original_entry_id: string | null;
  shared_accepted: boolean | null;
  created_at: string;
  updated_at: string;
  campground?: Campground;
  photos?: Photo[];
  shared_from_profile?: Profile;
  shared_with_profile?: Profile;
}

export interface CreateJournalEntry {
  campground_id: string;
  start_date: string;
  end_date: string;
  notes?: string;
  video_url?: string;
  is_favorite?: boolean;
  status?: 'published' | 'draft';
  shared_from_user_id?: string | null;
}

export interface UpdateJournalEntry {
  start_date?: string;
  end_date?: string;
  notes?: string;
  video_url?: string;
  is_favorite?: boolean;
}

export interface JournalEntryWithProfile extends JournalEntry {
  profile?: Profile;
}
