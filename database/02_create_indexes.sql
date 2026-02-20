-- INDEXES for performance
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_campground_id ON journal_entries(campground_id);
CREATE INDEX idx_reviews_campground_id ON reviews(campground_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_photos_journal_entry_id ON photos(journal_entry_id);
CREATE INDEX idx_photos_campground_id ON photos(campground_id);
CREATE INDEX idx_campgrounds_google_place_id ON campgrounds(google_place_id);
