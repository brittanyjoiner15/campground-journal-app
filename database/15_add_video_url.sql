-- Add video_url column to journal_entries table
ALTER TABLE journal_entries
ADD COLUMN video_url TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN journal_entries.video_url IS 'Embeddable video URL (YouTube, Vimeo, etc.) for the journal entry';
