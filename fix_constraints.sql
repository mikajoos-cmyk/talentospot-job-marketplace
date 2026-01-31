-- 1. Erst die alten Constraints entfernen, damit wir die Werte ändern dürfen
ALTER TABLE candidate_profiles DROP CONSTRAINT IF EXISTS candidate_profiles_employment_status_check;
ALTER TABLE candidate_profiles DROP CONSTRAINT IF EXISTS candidate_profiles_home_office_preference_check;

-- 2. Bestehende Daten auf neue Werte mappen
UPDATE candidate_profiles SET employment_status = 'Unemployed' WHERE employment_status IN ('unemployed', 'actively-looking', 'available');
UPDATE candidate_profiles SET employment_status = 'Employed' WHERE employment_status IN ('employed', 'open-to-offers', 'employed_full_time', 'employed_part_time');
UPDATE candidate_profiles SET employment_status = 'Student' WHERE employment_status = 'student';
UPDATE candidate_profiles SET employment_status = 'Freelancer' WHERE employment_status = 'self_employed';
UPDATE candidate_profiles SET employment_status = 'Retired' WHERE employment_status = 'retired';

-- Restliche/Ungültige Werte auf 'Other' setzen
UPDATE candidate_profiles 
SET employment_status = 'Other' 
WHERE employment_status NOT IN ('Unemployed', 'Employed', 'Trainee', 'Apprentice', 'Pupil', 'Student', 'Civil Servant', 'Freelancer', 'Entrepreneur', 'Retired', 'Other') 
AND employment_status IS NOT NULL;

-- Home Office Präferenz aktualisieren
UPDATE candidate_profiles SET home_office_preference = 'no' WHERE home_office_preference = 'none';
UPDATE candidate_profiles SET home_office_preference = 'yes' WHERE home_office_preference = 'full';

-- 3. Neue Constraints hinzufügen
ALTER TABLE candidate_profiles ADD CONSTRAINT candidate_profiles_employment_status_check 
CHECK (employment_status IN ('Unemployed', 'Employed', 'Trainee', 'Apprentice', 'Pupil', 'Student', 'Civil Servant', 'Freelancer', 'Entrepreneur', 'Retired', 'Other'));

ALTER TABLE candidate_profiles ADD CONSTRAINT candidate_profiles_home_office_preference_check 
CHECK (home_office_preference IN ('no', 'yes', 'hybrid'));
