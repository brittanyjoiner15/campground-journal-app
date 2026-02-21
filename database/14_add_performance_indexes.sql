-- Add indexes for frequently queried columns to improve performance

-- Index on campgrounds google_place_id for lookups (if not already indexed by UNIQUE)
CREATE INDEX IF NOT EXISTS idx_campgrounds_google_place_id ON campgrounds(google_place_id);

-- Index on journal_entries user_id for user queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);

-- Index on journal_entries campground_id for campground queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_campground_id ON journal_entries(campground_id);

-- Index on journal_entries status for filtering published/draft
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);

-- Composite index for user + status queries (most common pattern)
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_status ON journal_entries(user_id, status);

-- Index on photos for journal entry lookups
CREATE INDEX IF NOT EXISTS idx_photos_journal_entry_id ON photos(journal_entry_id);

-- Index on photos for campground lookups
CREATE INDEX IF NOT EXISTS idx_photos_campground_id ON photos(campground_id);

-- Index on photos for user lookups
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);

-- Index on profiles username for lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Index on follows for follower queries
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);

-- Index on follows for following queries
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
