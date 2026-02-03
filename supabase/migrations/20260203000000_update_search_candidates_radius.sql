-- Update search_candidates_radius to respect candidate's work_radius_km
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
        -- Distance Calculation
        6371 * acos(
          least(1.0, greatest(-1.0,
            cos(radians(search_lat)) *
            cos(radians(cp.latitude)) *
            cos(radians(cp.longitude) - radians(search_lon)) +
            sin(radians(search_lat)) *
            sin(radians(cp.latitude))
          ))
        )
      ) <= radius_km -- Within Employer's Search Radius
      AND
      (
        -- Additionally check if within Candidate's Work Radius
        -- If work_radius_km is NULL, assume they are flexible (infinite radius) or use a sensible default.
        -- Assuming NULL means "no restriction" / "willing to relocate" / "remote" effectively.
        -- However, strictly following the prompt: "candidate only found if distance <= work radius".
        -- If work_radius is NULL, we should probably allow them (default behavior).
        6371 * acos(
          least(1.0, greatest(-1.0,
            cos(radians(search_lat)) *
            cos(radians(cp.latitude)) *
            cos(radians(cp.longitude) - radians(search_lon)) +
            sin(radians(search_lat)) *
            sin(radians(cp.latitude))
          ))
        ) <= COALESCE(cp.work_radius_km, 20000) -- Default to 20000km if null (global)
      )
    )
    OR
    -- 2. Check Preferred Locations (if the city has coordinates)
    (
      city.latitude IS NOT NULL AND city.longitude IS NOT NULL AND
      (
        -- Distance Calculation
        6371 * acos(
          least(1.0, greatest(-1.0,
            cos(radians(search_lat)) *
            cos(radians(city.latitude)) *
            cos(radians(city.longitude) - radians(search_lon)) +
            sin(radians(search_lat)) *
            sin(radians(city.latitude))
          ))
        )
      ) <= radius_km -- Within Employer's Search Radius
      AND
      (
         -- Candidates usually specify preferred locations explicitly.
         -- If they added a preferred city, they likely want to work there regardless of their residence work_radius.
         -- Does work_radius_km apply to preferred cities too?
         -- "abstand der eingestellten stadt zu seinen preferred work locationss oder seinem wohnsitz kleiner gleich dem work radius wert des kandidaten ist"
         -- YES: "distance from set city to preferred location OR residence <= work radius".
         -- So we must also check work radius for preferred locations.
         6371 * acos(
          least(1.0, greatest(-1.0,
            cos(radians(search_lat)) *
            cos(radians(city.latitude)) *
            cos(radians(city.longitude) - radians(search_lon)) +
            sin(radians(search_lat)) *
            sin(radians(city.latitude))
          ))
        ) <= COALESCE(cp.work_radius_km, 20000)
      )
    );
END;
$$;
