-- Migration to create sectors table for suggestions

-- 1. Create sectors table
CREATE TABLE IF NOT EXISTS sectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for sectors
CREATE POLICY "Sectors are viewable by everyone" ON sectors FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert sectors" ON sectors 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Initial seed data (optional, but helpful)
INSERT INTO sectors (name) VALUES 
('IT'), ('Healthcare'), ('Finance'), ('Engineering'), ('Marketing'), 
('Sales'), ('Education'), ('Manufacturing'), ('Retail'), ('Logistics'), 
('Construction'), ('Other')
ON CONFLICT (name) DO NOTHING;
