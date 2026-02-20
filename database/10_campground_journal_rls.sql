-- Allow users to view journal entries for any campground
-- This enables the campground details page to show all entries for that location

CREATE POLICY "Users can view journal entries for any campground"
  ON journal_entries FOR SELECT
  USING (true);

-- Note: This is in addition to existing policies for viewing own entries
-- and followed users' entries. This policy enables the social discovery
-- feature on campground pages.
