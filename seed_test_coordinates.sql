-- 1. Ensure Stuttgart exists in cities table with coords
INSERT INTO public.cities (name, latitude, longitude)
VALUES ('Stuttgart', 48.7784485, 9.1800132)
ON CONFLICT (name) DO UPDATE SET latitude = 48.7784485, longitude = 9.1800132;

-- 2. Update existing candidates to be in Stuttgart (for testing)
-- Replace the IDs with actual candidate IDs if you want specific ones, 
-- otherwise this updates the first 5 visible candidates.
UPDATE candidate_profiles
SET 
  city = 'Stuttgart',
  latitude = 48.7784485,
  longitude = 9.1800132
WHERE id IN (
  SELECT cp.id 
  FROM candidate_profiles cp
  JOIN profiles p ON cp.id = p.id
  WHERE p.is_visible = true
  LIMIT 5
);

-- 3. Update some preferred locations to check that too
UPDATE cities
SET latitude = 52.5200, longitude = 13.4050
WHERE name = 'Berlin';

UPDATE cities
SET latitude = 48.1351, longitude = 11.5820
WHERE name = 'Munich';
