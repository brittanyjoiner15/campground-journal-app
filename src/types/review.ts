import { Profile } from './user';

export interface Review {
  id: string;
  user_id: string;
  campground_id: string;
  journal_entry_id: string | null;
  rating: number;
  title: string | null;
  review_text: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface CreateReview {
  campground_id: string;
  journal_entry_id?: string;
  rating: number;
  title?: string;
  review_text: string;
}

export interface UpdateReview {
  rating?: number;
  title?: string;
  review_text?: string;
}

export interface Photo {
  id: string;
  user_id: string;
  campground_id: string;
  journal_entry_id: string | null;
  storage_path: string;
  public_url: string;
  caption: string | null;
  is_cover: boolean;
  created_at: string;
}
