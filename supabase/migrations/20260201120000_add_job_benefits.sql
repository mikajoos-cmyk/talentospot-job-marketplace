-- Add benefits column to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS benefits text[] DEFAULT '{}';
