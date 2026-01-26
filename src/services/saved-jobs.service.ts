import { supabase } from '../lib/supabase';

export const savedJobsService = {
  async saveJob(candidateId: string, jobId: string) {
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert({
        candidate_id: candidateId,
        job_id: jobId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async unsaveJob(candidateId: string, jobId: string) {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId);

    if (error) throw error;
  },

  async getSavedJobs(candidateId: string) {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        *,
        jobs!inner(
          *,
          employer_profiles!inner(
            company_name,
            logo_url,
            profiles!inner(full_name)
          )
        )
      `)
      .eq('candidate_id', candidateId)
      .order('saved_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async isJobSaved(candidateId: string, jobId: string) {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },
};
