-- Create junction table for job required languages with proficiency levels
CREATE TABLE IF NOT EXISTS job_required_languages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, language_id)
);

-- Add index for faster queries
CREATE INDEX idx_job_required_languages_job_id ON job_required_languages(job_id);
CREATE INDEX idx_job_required_languages_language_id ON job_required_languages(language_id);

-- Enable RLS
ALTER TABLE job_required_languages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Everyone can read, only job owner can modify
CREATE POLICY "Anyone can view job required languages"
  ON job_required_languages FOR SELECT
  USING (true);

CREATE POLICY "Job owner can insert required languages"
  ON job_required_languages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_required_languages.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

CREATE POLICY "Job owner can update required languages"
  ON job_required_languages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_required_languages.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

CREATE POLICY "Job owner can delete required languages"
  ON job_required_languages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM jobs
      WHERE jobs.id = job_required_languages.job_id
      AND jobs.employer_id = auth.uid()
    )
  );

-- Migrate existing data from required_languages array to new table
-- Check the type of required_languages column and handle accordingly
DO $$
BEGIN
  -- Only migrate if the column exists and contains data
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'required_languages'
  ) THEN
    -- Cast to UUID explicitly to handle type mismatch
    INSERT INTO job_required_languages (job_id, language_id, proficiency_level)
    SELECT
      j.id as job_id,
      CAST(unnest(j.required_languages) AS uuid) as language_id,
      'B2' as proficiency_level  -- Default level for existing data
    FROM jobs j
    WHERE j.required_languages IS NOT NULL
      AND array_length(j.required_languages, 1) > 0
    ON CONFLICT (job_id, language_id) DO NOTHING;
  END IF;
END $$;
