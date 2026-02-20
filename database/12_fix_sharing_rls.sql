-- Migration: Fix RLS policies for journal entry sharing
-- Allows users to create draft entries for other users when sharing

-- Add INSERT policy to allow creating shared drafts
-- Users can insert their own entries OR drafts for others (when sharing)
CREATE POLICY "Users can insert own entries and shared drafts" ON journal_entries
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id  -- Can insert own entries
    OR (
      status = 'draft' AND  -- OR can insert drafts for others
      shared_from_user_id = auth.uid()  -- As long as sender is current user
    )
  );

-- Add UPDATE policy to allow updating entries
-- Users can update their own entries OR update original entries when recipient accepts
CREATE POLICY "Users can update own entries and sharing status" ON journal_entries
  FOR UPDATE
  USING (
    auth.uid() = user_id  -- Can update own entries
    OR (
      -- OR can update if this is the original entry and someone is accepting their draft
      shared_with_user_id IS NOT NULL  -- Entry was shared with someone
    )
  )
  WITH CHECK (
    auth.uid() = user_id  -- Can only update to values where they remain owner
    OR (
      -- OR updating sharing status (when recipient accepts)
      shared_with_user_id IS NOT NULL
    )
  );

-- Add DELETE policy
CREATE POLICY "Users can delete own entries" ON journal_entries
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON POLICY "Users can insert own entries and shared drafts" ON journal_entries IS
  'Allows users to create their own entries and create draft entries for other users when sharing';

COMMENT ON POLICY "Users can update own entries and sharing status" ON journal_entries IS
  'Allows users to update their own entries and allows acceptance status updates when recipients accept drafts';
