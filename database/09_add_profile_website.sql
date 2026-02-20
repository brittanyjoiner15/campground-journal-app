-- Add website field to profiles table
ALTER TABLE profiles
ADD COLUMN website TEXT;

-- Add a comment explaining the field
COMMENT ON COLUMN profiles.website IS 'Personal website or social media link';
