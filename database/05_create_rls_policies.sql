-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- CAMPGROUNDS POLICIES
CREATE POLICY "Campgrounds are viewable by everyone"
  ON campgrounds FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create campgrounds"
  ON campgrounds FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- JOURNAL ENTRIES POLICIES
CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal entries"
  ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE USING (auth.uid() = user_id);

-- REVIEWS POLICIES
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create own reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE USING (auth.uid() = user_id);

-- PHOTOS POLICIES
CREATE POLICY "Photos are viewable by everyone"
  ON photos FOR SELECT USING (true);

CREATE POLICY "Users can upload own photos"
  ON photos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE USING (auth.uid() = user_id);
