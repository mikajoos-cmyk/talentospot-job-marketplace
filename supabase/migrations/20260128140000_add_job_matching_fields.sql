/*
  # Add Advanced Job Matching Fields

  ## Overview
  Adds missing columns to the jobs table to support advanced matching and filtering.

  ## New Columns
  - entry_bonus (numeric)
  - contract_duration (text)
  - required_languages (uuid array)
  - required_qualifications (uuid array)
  - required_skills (uuid array)
  - career_level (text)
  - experience_years (integer)
*/

ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS entry_bonus numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS contract_duration text,
ADD COLUMN IF NOT EXISTS required_languages uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS required_qualifications uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS required_skills uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS career_level text,
ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 0;
