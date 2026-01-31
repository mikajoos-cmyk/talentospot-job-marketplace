-- Enable RLS on master data tables if not already enabled
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert new tags (benefits)
DROP POLICY IF EXISTS "Enable insert for authenticated users on tags" ON public.tags;
CREATE POLICY "Enable insert for authenticated users on tags" 
ON public.tags FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to insert new job titles
DROP POLICY IF EXISTS "Enable insert for authenticated users on job_titles" ON public.job_titles;
CREATE POLICY "Enable insert for authenticated users on job_titles" 
ON public.job_titles FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to insert new skills
DROP POLICY IF EXISTS "Enable insert for authenticated users on skills" ON public.skills;
CREATE POLICY "Enable insert for authenticated users on skills" 
ON public.skills FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to insert new qualifications
DROP POLICY IF EXISTS "Enable insert for authenticated users on qualifications" ON public.qualifications;
CREATE POLICY "Enable insert for authenticated users on qualifications" 
ON public.qualifications FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Ensure select policies exist (assuming they might not or might be restrictive)
DROP POLICY IF EXISTS "Enable read access for all users on tags" ON public.tags;
CREATE POLICY "Enable read access for all users on tags" ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users on job_titles" ON public.job_titles;
CREATE POLICY "Enable read access for all users on job_titles" ON public.job_titles FOR SELECT USING (true);
