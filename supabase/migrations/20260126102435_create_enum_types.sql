/*
  # Create Enum Types

  ## Overview
  Creates all custom enum types needed for the job matching platform.

  ## New Types
  - user_type
  - application_status
  - invitation_status  
  - request_status
  - employment_status
  - contract_type
  - gender_type
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop types if they exist and recreate (for idempotency)
DROP TYPE IF EXISTS user_type CASCADE;
CREATE TYPE user_type AS ENUM ('candidate', 'employer', 'admin');

DROP TYPE IF EXISTS application_status CASCADE;
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

DROP TYPE IF EXISTS invitation_status CASCADE;
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected');

DROP TYPE IF EXISTS request_status CASCADE;
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected');

DROP TYPE IF EXISTS employment_status CASCADE;
CREATE TYPE employment_status AS ENUM ('employed_fulltime', 'employed_parttime', 'unemployed', 'student', 'retired', 'freelancer');

DROP TYPE IF EXISTS contract_type CASCADE;
CREATE TYPE contract_type AS ENUM ('fulltime', 'parttime', 'contract', 'temporary', 'internship', 'apprenticeship');

DROP TYPE IF EXISTS gender_type CASCADE;
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');