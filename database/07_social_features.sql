-- FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_relationship ON follows(follower_id, following_id);

-- RLS POLICIES
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follow relationships are viewable by everyone"
  ON follows FOR SELECT USING (true);

CREATE POLICY "Users can follow other users"
  ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow users"
  ON follows FOR DELETE USING (auth.uid() = follower_id);

-- UPDATE journal_entries RLS to allow viewing followed users' entries
DROP POLICY IF EXISTS "Users can view own journal entries" ON journal_entries;

CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view followed users journal entries"
  ON journal_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM follows
      WHERE follows.follower_id = auth.uid()
      AND follows.following_id = journal_entries.user_id
    )
  );
