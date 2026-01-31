/*
  # Create Nationalities Table

  ## Overview
  Creates a table for nationalities and links them to countries (optional but recommended).
  This allows for a standardized list of nationalities in the profile.

  ## Tables
  - `nationalities`: Stores nationality names (e.g., German, French, Syrian).

  ## RLS
  - Enables public read access.
*/

-- Create nationalities table
CREATE TABLE IF NOT EXISTS nationalities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    country_id UUID REFERENCES countries(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE nationalities ENABLE ROW LEVEL SECURITY;

-- Create public read policy
CREATE POLICY "Nationalities are viewable by everyone" 
ON nationalities FOR SELECT 
USING (true);

-- Insert sample data
-- We can seed this based on the existing countries
INSERT INTO nationalities (name, country_id)
SELECT 
    CASE 
        WHEN name = 'Germany' THEN 'German'
        WHEN name = 'France' THEN 'French'
        WHEN name = 'Spain' THEN 'Spanish'
        WHEN name = 'Italy' THEN 'Italian'
        WHEN name = 'United Kingdom' THEN 'British'
        WHEN name = 'Netherlands' THEN 'Dutch'
        ELSE name || 'ian' -- Fallback
    END, 
    id 
FROM countries
ON CONFLICT (name) DO NOTHING;

-- Extension: Add flag_code to countries if it doesn't exist (using existing code column)
-- The 'code' column usually contains ISO Alpha-2 codes which are perfect for flags.
-- If 'code' is missing, you might want to add it.
