/*
  # Create States Table

  ## Overview
  Creates a table for states/provinces/bundesländer and links them to countries.
  This allows for dynamic filtering of states based on the selected country.

  ## Tables
  - `states`: Stores state names linked to a country.

  ## RLS
  - Enables public read access for the `states` table.
*/

-- Create states table
CREATE TABLE IF NOT EXISTS states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(name, country_id)
);

-- Enable RLS
ALTER TABLE states ENABLE ROW LEVEL SECURITY;

-- Create public read policy
CREATE POLICY "States are viewable by everyone" 
ON states FOR SELECT 
USING (true);

-- Insert some sample data for Germany (optional, but helpful for testing)
-- You can add more data later through the Supabase UI or another migration.
INSERT INTO states (name, country_id)
SELECT name, id FROM (
  VALUES 
    ('Baden-Württemberg'), ('Bayern'), ('Berlin'), ('Brandenburg'), ('Bremen'),
    ('Hamburg'), ('Hessen'), ('Mecklenburg-Vorpommern'), ('Niedersachsen'),
    ('Nordrhein-Westfalen'), ('Rheinland-Pfalz'), ('Saarland'), ('Sachsen'),
    ('Sachsen-Anhalt'), ('Schleswig-Holstein'), ('Thüringen')
) as sample_states(name)
CROSS JOIN (SELECT id FROM countries WHERE name = 'Germany' LIMIT 1) as de
ON CONFLICT (name, country_id) DO NOTHING;
