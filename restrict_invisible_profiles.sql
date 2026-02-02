-- Enable Row Level Security on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to view profiles:
-- 1. Users can view their own profile always.
-- 2. Anyone (including anonymous) can view profiles where is_visible is true.

CREATE POLICY "Public profiles are visible to everyone"
ON profiles
FOR SELECT
USING (
  is_visible = true
  OR
  auth.uid() = id
);

-- Note: Existing policies might conflict. You should check existing policies.
-- If you have a policy that says "true" (allow all), you might need to drop it.
-- This script only ADDS the policy.
