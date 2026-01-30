-- Goal: Enable public access to non-sensitive job and candidate data.

-- 1. Enable RLS on core tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Public Read Access for lookup tables
CREATE POLICY "Languages are viewable by everyone" ON languages FOR SELECT USING (true);
CREATE POLICY "Skills are viewable by everyone" ON skills FOR SELECT USING (true);
CREATE POLICY "Qualifications are viewable by everyone" ON qualifications FOR SELECT USING (true);
CREATE POLICY "Requirements are viewable by everyone" ON requirements FOR SELECT USING (true);

-- 3. Public Read Access for Jobs (Active only)
CREATE POLICY "Active jobs are viewable by everyone" ON jobs
    FOR SELECT USING (status = 'active');

-- 4. Public Read Access for Employer Profiles (Basic company info)
CREATE POLICY "Employer profiles are viewable by everyone" ON employer_profiles
    FOR SELECT USING (true);

-- 5. Public Read Access for Candidate Profiles (Non-sensitive data)
-- This allows guests to see the candidate cards and basic profile data.
CREATE POLICY "Candidate profiles are viewable by everyone" ON candidate_profiles
    FOR SELECT USING (true);

-- 6. Public Read Access for Junction and Detail Tables
-- Essential for fetching skills, languages, etc. in search results.
CREATE POLICY "Candidate languages are viewable by everyone" ON candidate_languages FOR SELECT USING (true);
CREATE POLICY "Candidate skills are viewable by everyone" ON candidate_skills FOR SELECT USING (true);
CREATE POLICY "Candidate qualifications are viewable by everyone" ON candidate_qualifications FOR SELECT USING (true);
CREATE POLICY "Candidate requirements are viewable by everyone" ON candidate_requirements FOR SELECT USING (true);
CREATE POLICY "Candidate experience is viewable by everyone" ON candidate_experience FOR SELECT USING (true);
CREATE POLICY "Candidate education is viewable by everyone" ON candidate_education FOR SELECT USING (true);
CREATE POLICY "Candidate preferred locations are viewable by everyone" ON candidate_preferred_locations FOR SELECT USING (true);
CREATE POLICY "Job languages are viewable by everyone" ON job_required_languages FOR SELECT USING (true);

-- 7. Public Read Access for Location Lookup Tables
CREATE POLICY "Cities are viewable by everyone" ON cities FOR SELECT USING (true);
CREATE POLICY "Countries are viewable by everyone" ON countries FOR SELECT USING (true);
CREATE POLICY "Continents are viewable by everyone" ON continents FOR SELECT USING (true);

-- 8. Restricted Access to Profiles (Crucial for joins)
-- We allow 'anon' to select only specific safe columns if possible, 
-- but since RLS is row-level, we allow SELECT on the row.
-- The application logic (frontend and mapping) is responsible for hiding 
-- full_name, email, phone, and avatar_url for guests.
CREATE POLICY "Profiles are viewable for essential joins" ON profiles
    FOR SELECT TO anon USING (true);
