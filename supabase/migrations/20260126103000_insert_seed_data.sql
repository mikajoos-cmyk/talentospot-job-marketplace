/*
  # Insert Seed Data

  ## Overview
  Inserts initial seed data for packages, skills, languages, qualifications, and location data.

  ## Seed Data
  - Packages for candidates and employers
  - Common skills
  - Languages
  - Qualifications
  - Location data (continents, countries, cities)

  ## Important
  - Uses INSERT ... ON CONFLICT DO NOTHING to avoid duplicate errors
  - Safe to run multiple times
*/

-- Insert Packages for Employers
INSERT INTO packages (name, description, price_amount, billing_period, target_role, contact_requests_limit, job_posts_limit, featured_jobs_limit) VALUES
('Free', 'Get started with basic features', 0, 'lifetime', 'employer', 1, 1, 0),
('Standard', 'Perfect for growing companies', 499, 'yearly', 'employer', 10, 10, 1),
('Premium', 'For active recruiters', 899, 'yearly', 'employer', NULL, 25, 5),
('Premium Plus', 'Enterprise solution', 1690, 'yearly', 'employer', NULL, 100, 25)
ON CONFLICT DO NOTHING;

-- Insert Packages for Candidates
INSERT INTO packages (name, description, price_amount, billing_period, target_role, self_applications_limit) VALUES
('Free', 'Start your job search', 0, 'lifetime', 'candidate', 0),
('Starting', 'Boost your visibility', 59, 'yearly', 'candidate', 5),
('Standard', 'Maximize opportunities', 89, 'yearly', 'candidate', 10),
('Premium', 'Unlimited access', 299, 'yearly', 'candidate', 40)
ON CONFLICT DO NOTHING;

-- Insert Common Skills
INSERT INTO skills (name, category) VALUES
('JavaScript', 'Programming'),
('Python', 'Programming'),
('Java', 'Programming'),
('C++', 'Programming'),
('React', 'Frontend'),
('Angular', 'Frontend'),
('Vue.js', 'Frontend'),
('Node.js', 'Backend'),
('Django', 'Backend'),
('Spring Boot', 'Backend'),
('SQL', 'Database'),
('PostgreSQL', 'Database'),
('MongoDB', 'Database'),
('Docker', 'DevOps'),
('Kubernetes', 'DevOps'),
('AWS', 'Cloud'),
('Azure', 'Cloud'),
('GCP', 'Cloud'),
('Machine Learning', 'AI/ML'),
('Data Analysis', 'Data'),
('Project Management', 'Management'),
('Agile/Scrum', 'Management'),
('Communication', 'Soft Skills'),
('Leadership', 'Soft Skills'),
('Problem Solving', 'Soft Skills')
ON CONFLICT (name) DO NOTHING;

-- Insert Languages
INSERT INTO languages (name, code) VALUES
('English', 'en'),
('German', 'de'),
('French', 'fr'),
('Spanish', 'es'),
('Italian', 'it'),
('Portuguese', 'pt'),
('Dutch', 'nl'),
('Polish', 'pl'),
('Russian', 'ru'),
('Turkish', 'tr'),
('Arabic', 'ar'),
('Chinese', 'zh'),
('Japanese', 'ja'),
('Korean', 'ko'),
('Hindi', 'hi')
ON CONFLICT (name) DO NOTHING;

-- Insert Qualifications
INSERT INTO qualifications (name, category) VALUES
('No formal qualification', 'Basic'),
('High School Diploma', 'Secondary'),
('Vocational Training', 'Vocational'),
('Associate Degree', 'Higher Education'),
('Bachelor''s Degree', 'Higher Education'),
('Master''s Degree', 'Higher Education'),
('Doctorate (PhD)', 'Higher Education'),
('Professional Certification', 'Professional'),
('Trade Certification', 'Professional')
ON CONFLICT (name) DO NOTHING;

-- Insert Continents
INSERT INTO continents (name, code) VALUES
('Europe', 'EU'),
('Asia', 'AS'),
('Africa', 'AF'),
('North America', 'NA'),
('South America', 'SA'),
('Oceania', 'OC'),
('Antarctica', 'AN')
ON CONFLICT (name) DO NOTHING;

-- Insert sample countries (Europe)
INSERT INTO countries (name, code, continent_id) 
SELECT 'Germany', 'DE', id FROM continents WHERE code = 'EU' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO countries (name, code, continent_id) 
SELECT 'France', 'FR', id FROM continents WHERE code = 'EU' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO countries (name, code, continent_id) 
SELECT 'Spain', 'ES', id FROM continents WHERE code = 'EU' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO countries (name, code, continent_id) 
SELECT 'Italy', 'IT', id FROM continents WHERE code = 'EU' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO countries (name, code, continent_id) 
SELECT 'United Kingdom', 'GB', id FROM continents WHERE code = 'EU' LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO countries (name, code, continent_id) 
SELECT 'Netherlands', 'NL', id FROM continents WHERE code = 'EU' LIMIT 1
ON CONFLICT (code) DO NOTHING;

-- Insert sample cities
INSERT INTO cities (name, country_id, latitude, longitude)
SELECT 'Berlin', id, 52.5200, 13.4050 FROM countries WHERE code = 'DE' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO cities (name, country_id, latitude, longitude)
SELECT 'Munich', id, 48.1351, 11.5820 FROM countries WHERE code = 'DE' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO cities (name, country_id, latitude, longitude)
SELECT 'Paris', id, 48.8566, 2.3522 FROM countries WHERE code = 'FR' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO cities (name, country_id, latitude, longitude)
SELECT 'Madrid', id, 40.4168, -3.7038 FROM countries WHERE code = 'ES' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO cities (name, country_id, latitude, longitude)
SELECT 'Barcelona', id, 41.3851, 2.1734 FROM countries WHERE code = 'ES' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO cities (name, country_id, latitude, longitude)
SELECT 'Rome', id, 41.9028, 12.4964 FROM countries WHERE code = 'IT' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO cities (name, country_id, latitude, longitude)
SELECT 'London', id, 51.5074, -0.1278 FROM countries WHERE code = 'GB' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO cities (name, country_id, latitude, longitude)
SELECT 'Amsterdam', id, 52.3676, 4.9041 FROM countries WHERE code = 'NL' LIMIT 1
ON CONFLICT DO NOTHING;