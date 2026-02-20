-- Migration: Add journal entry sharing functionality
-- Adds status and shared_from_user_id columns to support draft entries

-- Add status column (defaults to 'published' for existing entries)
ALTER TABLE journal_entries
ADD COLUMN status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft'));

-- Add shared_from_user_id column to track who shared the draft (for recipients)
ALTER TABLE journal_entries
ADD COLUMN shared_from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add shared_with_user_id column to track who you shared with (for senders)
ALTER TABLE journal_entries
ADD COLUMN shared_with_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add original_entry_id to link draft to original (so we can update sender when accepted)
ALTER TABLE journal_entries
ADD COLUMN original_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL;

-- Add shared_accepted boolean to track if recipient accepted
ALTER TABLE journal_entries
ADD COLUMN shared_accepted BOOLEAN DEFAULT NULL;

-- Create indexes for efficient queries
CREATE INDEX idx_journal_entries_user_status ON journal_entries(user_id, status);
CREATE INDEX idx_journal_entries_shared_from ON journal_entries(shared_from_user_id);
CREATE INDEX idx_journal_entries_shared_with ON journal_entries(shared_with_user_id);
CREATE INDEX idx_journal_entries_original ON journal_entries(original_entry_id);

-- Update RLS policy to ensure users can see their own drafts
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can view own journal entries" ON journal_entries;

-- Recreate policy to include drafts
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Comment for documentation
COMMENT ON COLUMN journal_entries.status IS 'Entry status: published or draft. Drafts are shared entries awaiting acceptance.';
COMMENT ON COLUMN journal_entries.shared_from_user_id IS 'User ID of the person who shared this draft entry (for recipients). NULL for non-shared entries.';
COMMENT ON COLUMN journal_entries.shared_with_user_id IS 'User ID of the person you shared this entry with (for senders). NULL if not shared.';
COMMENT ON COLUMN journal_entries.original_entry_id IS 'Links draft entry back to the original entry (for updating sender when accepted).';
COMMENT ON COLUMN journal_entries.shared_accepted IS 'TRUE if recipient accepted, FALSE if rejected, NULL if pending or not shared.';
