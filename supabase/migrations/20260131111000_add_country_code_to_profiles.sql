/*
  # Add Country Code Support for Flags

  ## Overview
  Ensures that the countries table has proper ISO Alpha-2 codes for flag rendering.
  Also adds country_code to candidate_profiles for easy flag display.

  ## Changes
  - Verify countries.code column exists (should already be there)
  - Add country_code to candidate_profiles (derived from country name)
*/

-- Add country_code column to candidate_profiles if it doesn't exist
-- This will store the ISO Alpha-2 code (e.g., 'DE', 'FR', 'GB')
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'candidate_profiles' 
        AND column_name = 'country_code'
    ) THEN
        ALTER TABLE candidate_profiles ADD COLUMN country_code TEXT;
    END IF;
END $$;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_country_code 
ON candidate_profiles(country_code);

-- Optional: Update existing records to populate country_code based on country name
-- This is a one-time migration to sync existing data
UPDATE candidate_profiles cp
SET country_code = c.code
FROM countries c
WHERE cp.country = c.name
AND cp.country_code IS NULL;
