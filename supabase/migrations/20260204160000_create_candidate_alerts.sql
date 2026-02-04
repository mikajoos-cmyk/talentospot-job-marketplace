-- Create candidate_alerts table
CREATE TABLE IF NOT EXISTS public.candidate_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    filters JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_paused BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for candidate_alerts
ALTER TABLE public.candidate_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can view their own alerts"
    ON public.candidate_alerts
    FOR SELECT
    USING (auth.uid() = employer_id);

CREATE POLICY "Employers can create their own alerts"
    ON public.candidate_alerts
    FOR INSERT
    WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update their own alerts"
    ON public.candidate_alerts
    FOR UPDATE
    USING (auth.uid() = employer_id);

CREATE POLICY "Employers can delete their own alerts"
    ON public.candidate_alerts
    FOR DELETE
    USING (auth.uid() = employer_id);

-- Create trigger for updated_at
CREATE TRIGGER update_candidate_alerts_updated_at
    BEFORE UPDATE ON public.candidate_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
