-- Add coordinates to candidate_profiles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidate_profiles' AND column_name = 'latitude') THEN
        ALTER TABLE candidate_profiles ADD COLUMN latitude double precision;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidate_profiles' AND column_name = 'longitude') THEN
        ALTER TABLE candidate_profiles ADD COLUMN longitude double precision;
    END IF;
END $$;

-- Create or Replace the Radius Search Function
CREATE OR REPLACE FUNCTION search_candidates_radius(
  search_lat double precision,
  search_lon double precision,
  radius_km int
)
RETURNS TABLE (candidate_id uuid)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT cp.id
  FROM candidate_profiles cp
  LEFT JOIN candidate_preferred_locations cpl ON cp.id = cpl.candidate_id
  LEFT JOIN cities city ON cpl.city_id = city.id
  WHERE
    -- 1. Check Candidate Residence Location (if they have coordinates)
    (
      cp.latitude IS NOT NULL AND cp.longitude IS NOT NULL AND
      (
        6371 * acos(
          least(1.0, greatest(-1.0,
            cos(radians(search_lat)) *
            cos(radians(cp.latitude)) *
            cos(radians(cp.longitude) - radians(search_lon)) +
            sin(radians(search_lat)) *
            sin(radians(cp.latitude))
          ))
        )
      ) <= radius_km
    )
    OR
    -- 2. Check Preferred Locations (if the city has coordinates)
    (
      city.latitude IS NOT NULL AND city.longitude IS NOT NULL AND
      (
        6371 * acos(
          least(1.0, greatest(-1.0,
            cos(radians(search_lat)) *
            cos(radians(city.latitude)) *
            cos(radians(city.longitude) - radians(search_lon)) +
            sin(radians(search_lat)) *
            sin(radians(city.latitude))
          ))
        )
      ) <= radius_km
    );
END;
$$;
