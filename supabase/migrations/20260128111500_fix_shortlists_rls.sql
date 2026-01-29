
-- Enable RLS on shortlists table
ALTER TABLE shortlists ENABLE ROW LEVEL SECURITY;

-- Allow candidates to see companies that shortlisted them
-- This is necessary for the "Followers" count on their Network page
CREATE POLICY "Candidates can view their own shortlists" 
ON shortlists FOR SELECT 
USING (auth.uid() = candidate_id);

-- Allow employers to see their own created shortlists
CREATE POLICY "Employers can view their own shortlists" 
ON shortlists FOR SELECT 
USING (auth.uid() = employer_id);

-- Allow employers to manage their own shortlists
CREATE POLICY "Employers can insert their own shortlists"
ON shortlists FOR INSERT
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own shortlists"
ON shortlists FOR UPDATE
USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own shortlists"
ON shortlists FOR DELETE
USING (auth.uid() = employer_id);
