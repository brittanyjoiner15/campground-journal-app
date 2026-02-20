-- Add start_date and end_date columns
ALTER TABLE journal_entries
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE;

-- Migrate existing visit_date to start_date and end_date
UPDATE journal_entries
SET start_date = visit_date,
    end_date = visit_date
WHERE start_date IS NULL;

-- Make start_date required
ALTER TABLE journal_entries
ALTER COLUMN start_date SET NOT NULL;

-- Make end_date required
ALTER TABLE journal_entries
ALTER COLUMN end_date SET NOT NULL;

-- Drop the old unique constraint
ALTER TABLE journal_entries
DROP CONSTRAINT IF EXISTS journal_entries_user_id_campground_id_visit_date_key;

-- Add new unique constraint with start_date
ALTER TABLE journal_entries
ADD CONSTRAINT journal_entries_user_id_campground_id_start_date_key
UNIQUE(user_id, campground_id, start_date);

-- Add check constraint to ensure end_date is not before start_date
ALTER TABLE journal_entries
ADD CONSTRAINT check_date_range
CHECK (end_date >= start_date);

-- Drop the old visit_date column
ALTER TABLE journal_entries
DROP COLUMN visit_date;
