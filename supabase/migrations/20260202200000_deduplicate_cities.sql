-- 1. Deduplicate Cities
-- We keep the one with coordinates (if any)
DELETE FROM public.cities
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY LOWER(TRIM(name)), COALESCE(country_id, '00000000-0000-0000-0000-000000000000'::uuid)
                   ORDER BY (latitude IS NOT NULL AND longitude IS NOT NULL) DESC
               ) as row_num
        FROM public.cities
    ) t
    WHERE t.row_num > 1
);

-- 2. Add Unique Constraint on Cities
-- This prevents future duplicates at the database level
ALTER TABLE public.cities 
DROP CONSTRAINT IF EXISTS cities_name_country_id_key;

ALTER TABLE public.cities
ADD CONSTRAINT cities_name_country_id_key UNIQUE (name, country_id);

-- 3. Deduplicate Countries
DELETE FROM public.countries
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY LOWER(TRIM(name))
                   ORDER BY id
               ) as row_num
        FROM public.countries
    ) t
    WHERE t.row_num > 1
);

-- 4. Add Unique Constraint on Countries
ALTER TABLE public.countries 
DROP CONSTRAINT IF EXISTS countries_name_key;

ALTER TABLE public.countries
ADD CONSTRAINT countries_name_key UNIQUE (name);
