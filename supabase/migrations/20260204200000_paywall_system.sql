-- Migration: Paywall System for TalentoSpot
-- Description: Ensures all necessary fields and constraints exist for the paywall system
-- Date: 2026-02-04

-- Ensure packages table has all necessary columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'packages' AND column_name = 'can_send_messages') THEN
    ALTER TABLE packages ADD COLUMN can_send_messages BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'packages' AND column_name = 'can_send_attachments') THEN
    ALTER TABLE packages ADD COLUMN can_send_attachments BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'packages' AND column_name = 'can_view_shortlist_details') THEN
    ALTER TABLE packages ADD COLUMN can_view_shortlist_details BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'packages' AND column_name = 'can_view_saved_jobs_details') THEN
    ALTER TABLE packages ADD COLUMN can_view_saved_jobs_details BOOLEAN DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'packages' AND column_name = 'can_view_contact_details') THEN
    ALTER TABLE packages ADD COLUMN can_view_contact_details BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Ensure jobs table has is_featured column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'jobs' AND column_name = 'is_featured') THEN
    ALTER TABLE jobs ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Ensure subscriptions table has usage tracking columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'subscriptions' AND column_name = 'jobs_used') THEN
    ALTER TABLE subscriptions ADD COLUMN jobs_used INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'subscriptions' AND column_name = 'contacts_used') THEN
    ALTER TABLE subscriptions ADD COLUMN contacts_used INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'subscriptions' AND column_name = 'featured_jobs_used') THEN
    ALTER TABLE subscriptions ADD COLUMN featured_jobs_used INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'subscriptions' AND column_name = 'applications_used') THEN
    ALTER TABLE subscriptions ADD COLUMN applications_used INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create index on is_featured for faster queries
CREATE INDEX IF NOT EXISTS idx_jobs_featured ON jobs(is_featured) WHERE is_featured = true;

-- Create index on subscriptions status and expiry for quick lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON subscriptions(user_id, status, expires_at)
WHERE status = 'active';

-- Comments for documentation
COMMENT ON COLUMN packages.can_send_messages IS 'Whether users with this package can send messages';
COMMENT ON COLUMN packages.can_send_attachments IS 'Whether users with this package can send file attachments';
COMMENT ON COLUMN packages.can_view_shortlist_details IS 'Whether employers can view full shortlist candidate details';
COMMENT ON COLUMN packages.can_view_saved_jobs_details IS 'Whether candidates can view full saved job details';
COMMENT ON COLUMN packages.can_view_contact_details IS 'Whether users can view contact details (email, phone)';
COMMENT ON COLUMN jobs.is_featured IS 'Whether this job is featured/promoted (paid feature)';
COMMENT ON COLUMN subscriptions.jobs_used IS 'Number of jobs posted using this subscription';
COMMENT ON COLUMN subscriptions.contacts_used IS 'Number of contact requests used in this subscription';
COMMENT ON COLUMN subscriptions.featured_jobs_used IS 'Number of featured job promotions used';
COMMENT ON COLUMN subscriptions.applications_used IS 'Number of applications sent using this subscription';
