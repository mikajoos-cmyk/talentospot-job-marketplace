-- Replace 'YOUR_CANDIDATE_ID_HERE' with the actual candidate profile ID (UUID).
-- If you are testing as the currently logged in user in the SQL Editor context, you might need to look up your ID from the `profiles` table first.
-- Or, if running in the Supabase Dashboard SQL Editor, you can just insert a row manually in the Table Editor.

-- This script inserts a dummy award for a specific candidate ID.
-- Example Usage: replace the UUID below with a valid ID from your candidate_profiles table.

INSERT INTO candidate_awards (candidate_id, title, year, description, certificate_image)
VALUES (
  '96b415da-deed-4428-a39c-539f1603781b', -- <--- PASTE YOUR CANDIDATE ID HERE (taken from your error message URL)
  'Best Developer Award',
  '2025',
  'Awarded for exceptional coding skills and project management.',
  'https://via.placeholder.com/300'
);
