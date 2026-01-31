-- 1. Fix Permissions (RLS)
-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to INSERT (needed for saving new benefits/titles/etc.)
DROP POLICY IF EXISTS "Enable insert for authenticated users on tags" ON public.tags;
CREATE POLICY "Enable insert for authenticated users on tags" ON public.tags FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users on job_titles" ON public.job_titles;
CREATE POLICY "Enable insert for authenticated users on job_titles" ON public.job_titles FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users on skills" ON public.skills;
CREATE POLICY "Enable insert for authenticated users on skills" ON public.skills FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users on qualifications" ON public.qualifications;
CREATE POLICY "Enable insert for authenticated users on qualifications" ON public.qualifications FOR INSERT TO authenticated WITH CHECK (true);

-- Allow ALL users to SELECT (needed for suggestions to appear)
DROP POLICY IF EXISTS "Enable read access for all users on tags" ON public.tags;
CREATE POLICY "Enable read access for all users on tags" ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users on job_titles" ON public.job_titles;
CREATE POLICY "Enable read access for all users on job_titles" ON public.job_titles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users on skills" ON public.skills;
CREATE POLICY "Enable read access for all users on skills" ON public.skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users on qualifications" ON public.qualifications;
CREATE POLICY "Enable read access for all users on qualifications" ON public.qualifications FOR SELECT USING (true);


-- 2. Seed Initial Data (So suggestions show up immediately)
-- Benefits (Tags)
INSERT INTO public.tags (name) VALUES 
('Home Office'),
('Flexible Hours'),
('Company Bike'),
('Gym Membership'),
('Free Snacks'),
('Hardware Choice'),
('Public Transport Ticket'),
('Relocation Support'),
('Education Budget'),
('Team Events'),
('Pet Friendly'),
('Retirement Plan')
ON CONFLICT (name) DO NOTHING;

-- Job Titles
INSERT INTO public.job_titles (name) VALUES 
('Frontend Developer'),
('Backend Developer'),
('Full Stack Developer'),
('DevOps Engineer'),
('UI/UX Designer'),
('Product Manager'),
('Project Manager'),
('QA Engineer'),
('Data Scientist'),
('Mobile Developer')
ON CONFLICT (name) DO NOTHING;

-- Skills
INSERT INTO public.skills (name) VALUES 
('React'),
('TypeScript'),
('Node.js'),
('Python'),
('Java'),
('Docker'),
('Kubernetes'),
('AWS'),
('SQL'),
('Figma')
ON CONFLICT (name) DO NOTHING;
