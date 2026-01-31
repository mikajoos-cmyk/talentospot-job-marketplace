-- Migration to create job_titles and tags tables for suggestions

-- 1. Create job_titles table
CREATE TABLE IF NOT EXISTS job_titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for job_titles
CREATE POLICY "Job titles are viewable by everyone" ON job_titles FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert job titles" ON job_titles 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. RLS Policies for tags
CREATE POLICY "Tags are viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert tags" ON tags 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
