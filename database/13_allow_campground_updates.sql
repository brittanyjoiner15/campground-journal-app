-- Allow authenticated users to update campgrounds
-- This is needed to add missing coordinates or update stale information
CREATE POLICY "Authenticated users can update campgrounds"
  ON campgrounds FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
