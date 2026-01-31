-- Add vacation_days column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN vacation_days integer;

-- Add comment
COMMENT ON COLUMN public.jobs.vacation_days IS 'Number of vacation days offered per year';
