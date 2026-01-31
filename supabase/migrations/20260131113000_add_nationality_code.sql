-- Add nationality_code column to candidate_profiles
-- This will store the ISO Alpha-2 code based on nationality (e.g., 'DE' for German, 'FR' for French)

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'candidate_profiles' 
        AND column_name = 'nationality_code'
    ) THEN
        ALTER TABLE candidate_profiles ADD COLUMN nationality_code TEXT;
    END IF;
END $$;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_nationality_code 
ON candidate_profiles(nationality_code);

-- Optional: Update existing records to populate nationality_code based on nationality name
-- This maps common nationalities to their country codes
UPDATE candidate_profiles
SET nationality_code = CASE 
    WHEN nationality ILIKE 'German%' THEN 'DE'
    WHEN nationality ILIKE 'French%' THEN 'FR'
    WHEN nationality ILIKE 'Spanish%' THEN 'ES'
    WHEN nationality ILIKE 'Italian%' THEN 'IT'
    WHEN nationality ILIKE 'British%' OR nationality ILIKE 'English%' THEN 'GB'
    WHEN nationality ILIKE 'Dutch%' THEN 'NL'
    WHEN nationality ILIKE 'Austrian%' THEN 'AT'
    WHEN nationality ILIKE 'Swiss%' THEN 'CH'
    WHEN nationality ILIKE 'Belgian%' THEN 'BE'
    WHEN nationality ILIKE 'Polish%' THEN 'PL'
    WHEN nationality ILIKE 'Portuguese%' THEN 'PT'
    WHEN nationality ILIKE 'Greek%' THEN 'GR'
    WHEN nationality ILIKE 'Swedish%' THEN 'SE'
    WHEN nationality ILIKE 'Norwegian%' THEN 'NO'
    WHEN nationality ILIKE 'Danish%' THEN 'DK'
    WHEN nationality ILIKE 'Finnish%' THEN 'FI'
    WHEN nationality ILIKE 'Irish%' THEN 'IE'
    WHEN nationality ILIKE 'Czech%' THEN 'CZ'
    WHEN nationality ILIKE 'Hungarian%' THEN 'HU'
    WHEN nationality ILIKE 'Romanian%' THEN 'RO'
    WHEN nationality ILIKE 'Bulgarian%' THEN 'BG'
    WHEN nationality ILIKE 'Croatian%' THEN 'HR'
    WHEN nationality ILIKE 'Slovak%' THEN 'SK'
    WHEN nationality ILIKE 'Slovenian%' THEN 'SI'
    WHEN nationality ILIKE 'American%' OR nationality ILIKE 'US%' THEN 'US'
    WHEN nationality ILIKE 'Canadian%' THEN 'CA'
    WHEN nationality ILIKE 'Mexican%' THEN 'MX'
    WHEN nationality ILIKE 'Brazilian%' THEN 'BR'
    WHEN nationality ILIKE 'Argentine%' OR nationality ILIKE 'Argentinian%' THEN 'AR'
    WHEN nationality ILIKE 'Chinese%' THEN 'CN'
    WHEN nationality ILIKE 'Japanese%' THEN 'JP'
    WHEN nationality ILIKE 'Korean%' THEN 'KR'
    WHEN nationality ILIKE 'Indian%' THEN 'IN'
    WHEN nationality ILIKE 'Turkish%' THEN 'TR'
    WHEN nationality ILIKE 'Russian%' THEN 'RU'
    WHEN nationality ILIKE 'Ukrainian%' THEN 'UA'
    WHEN nationality ILIKE 'Syrian%' THEN 'SY'
    WHEN nationality ILIKE 'Afghan%' THEN 'AF'
    WHEN nationality ILIKE 'Iraqi%' THEN 'IQ'
    WHEN nationality ILIKE 'Iranian%' THEN 'IR'
    WHEN nationality ILIKE 'Lebanese%' THEN 'LB'
    WHEN nationality ILIKE 'Egyptian%' THEN 'EG'
    WHEN nationality ILIKE 'Moroccan%' THEN 'MA'
    WHEN nationality ILIKE 'Algerian%' THEN 'DZ'
    WHEN nationality ILIKE 'Tunisian%' THEN 'TN'
    WHEN nationality ILIKE 'Nigerian%' THEN 'NG'
    WHEN nationality ILIKE 'South African%' THEN 'ZA'
    WHEN nationality ILIKE 'Australian%' THEN 'AU'
    WHEN nationality ILIKE 'New Zealand%' THEN 'NZ'
    ELSE NULL
END
WHERE nationality_code IS NULL AND nationality IS NOT NULL;
