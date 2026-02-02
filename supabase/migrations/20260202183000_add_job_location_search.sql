-- Add coordinates to jobs if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'latitude') THEN
        ALTER TABLE public.jobs ADD COLUMN latitude double precision;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'jobs' AND column_name = 'longitude') THEN
        ALTER TABLE public.jobs ADD COLUMN longitude double precision;
    END IF;
END $$;

-- Create or Replace the Jobs Radius Search Function
CREATE OR REPLACE FUNCTION search_jobs_radius(
  search_lat double precision,
  search_lon double precision,
  radius_km int
)
RETURNS TABLE (id uuid)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT j.id
  FROM jobs j
  WHERE
    j.latitude IS NOT NULL AND j.longitude IS NOT NULL AND
    (
      6371 * acos(
        least(1.0, greatest(-1.0,
          cos(radians(search_lat)) *
          cos(radians(j.latitude)) *
          cos(radians(j.longitude) - radians(search_lon)) +
          sin(radians(search_lat)) *
          sin(radians(j.latitude))
        ))
      )
    ) <= radius_km;
END;
$$;
