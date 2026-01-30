-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS candidate_requirements;
DROP TABLE IF EXISTS requirements;

-- Add requirements table
CREATE TABLE IF NOT EXISTS requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'Other',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add junction table for candidates (referencing candidate_profiles)
CREATE TABLE IF NOT EXISTS candidate_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(candidate_id, requirement_id)
);

-- Enable RLS
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_requirements ENABLE ROW LEVEL SECURITY;

-- Policies for requirements
CREATE POLICY "Requirements are viewable by everyone" ON requirements
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert requirements" ON requirements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for candidate_requirements
CREATE POLICY "Candidate requirements are viewable by everyone" ON candidate_requirements
    FOR SELECT USING (true);

CREATE POLICY "Candidates can manage their own requirements" ON candidate_requirements
    FOR ALL USING (auth.uid() = candidate_id);
