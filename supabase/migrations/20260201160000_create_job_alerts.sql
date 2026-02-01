/*
  # Create Job Alerts table

  ## Changes
  - Create `job_alerts` table to store candidate job alert preferences
  - Add RLS policies for candidates to manage their own alerts
  - Add trigger for `updated_at` column

  ## purpose
  Allows candidates to save search filters and get notified (or view) matching jobs.
*/

CREATE TABLE IF NOT EXISTS job_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    filters JSONB NOT NULL,
    is_paused BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Candidates can manage their own job alerts"
    ON job_alerts
    FOR ALL
    TO authenticated
    USING (candidate_id = auth.uid())
    WITH CHECK (candidate_id = auth.uid());

-- Function to update updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_job_alerts_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_job_alerts_updated_at ON job_alerts;
CREATE TRIGGER trigger_update_job_alerts_updated_at
    BEFORE UPDATE ON job_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_job_alerts_timestamp();
