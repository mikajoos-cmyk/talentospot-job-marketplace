-- Fix RLS policy for job_titles to allow authenticated users to insert
-- This is needed for the master data sync functionality

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Job titles are viewable by everyone" ON job_titles;
DROP POLICY IF EXISTS "Authenticated users can insert job titles" ON job_titles;

-- Recreate the read policy
CREATE POLICY "Job titles are viewable by everyone" 
ON job_titles FOR SELECT 
USING (true);

-- Add insert policy for authenticated users
CREATE POLICY "Authenticated users can insert job titles" 
ON job_titles FOR INSERT 
TO authenticated
WITH CHECK (true);
