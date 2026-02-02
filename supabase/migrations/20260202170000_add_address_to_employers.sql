-- Add detailed address columns to employer_profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employer_profiles' AND column_name = 'street') THEN
        ALTER TABLE employer_profiles ADD COLUMN street TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employer_profiles' AND column_name = 'house_number') THEN
        ALTER TABLE employer_profiles ADD COLUMN house_number TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employer_profiles' AND column_name = 'postal_code') THEN
        ALTER TABLE employer_profiles ADD COLUMN postal_code TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employer_profiles' AND column_name = 'state') THEN
        ALTER TABLE employer_profiles ADD COLUMN state TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employer_profiles' AND column_name = 'latitude') THEN
        ALTER TABLE employer_profiles ADD COLUMN latitude double precision;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employer_profiles' AND column_name = 'longitude') THEN
        ALTER TABLE employer_profiles ADD COLUMN longitude double precision;
    END IF;
END $$;
