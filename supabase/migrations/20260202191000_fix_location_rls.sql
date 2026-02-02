-- 1. Enable RLS on location tables (just in case)
ALTER TABLE public.continents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- 2. Allow SELECT for everyone (if not already there)
DROP POLICY IF EXISTS "Cities are viewable by everyone" ON public.cities;
CREATE POLICY "Cities are viewable by everyone" ON public.cities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Countries are viewable by everyone" ON public.countries;
CREATE POLICY "Countries are viewable by everyone" ON public.countries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Continents are viewable by everyone" ON public.continents;
CREATE POLICY "Continents are viewable by everyone" ON public.continents FOR SELECT USING (true);

-- 3. Allow INSERT/UPDATE for authenticated users (Employers/Candidates saving new locations)
DROP POLICY IF EXISTS "Enable insert for authenticated users on cities" ON public.cities;
CREATE POLICY "Enable insert for authenticated users on cities" ON public.cities FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users on cities" ON public.cities;
CREATE POLICY "Enable update for authenticated users on cities" ON public.cities FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users on countries" ON public.countries;
CREATE POLICY "Enable insert for authenticated users on countries" ON public.countries FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users on countries" ON public.countries;
CREATE POLICY "Enable update for authenticated users on countries" ON public.countries FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users on continents" ON public.continents;
CREATE POLICY "Enable insert for authenticated users on continents" ON public.continents FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for authenticated users on continents" ON public.continents;
CREATE POLICY "Enable update for authenticated users on continents" ON public.continents FOR UPDATE TO authenticated USING (true);
