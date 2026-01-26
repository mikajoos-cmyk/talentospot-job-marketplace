import { supabase } from '../lib/supabase';

export interface Application {
  job_id: string;
  candidate_id: string;
  employer_id: string;
  cover_letter?: string;
  cv_url?: string;
  additional_documents?: string[];
}

export const applicationsService = {
  async applyToJob(application: Application) {
    const { data, error } = await supabase
      .from('job_applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;

    await supabase.rpc('increment', {
      table_name: 'jobs',
      row_id: application.job_id,
      column_name: 'applications_count',
    });

    return data;
  },

  async getApplicationsByCandidate(candidateId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner(
          *,
          employer_profiles!inner(
            company_name,
            logo_url
          )
        )
      `)
      .eq('candidate_id', candidateId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getApplicationsByJob(jobId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        candidate_profiles!inner(
          *,
          profiles!inner(full_name, avatar_url)
        )
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getApplicationsByEmployer(employerId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner(*),
        candidate_profiles!inner(
          *,
          profiles!inner(full_name, avatar_url)
        )
      `)
      .eq('employer_id', employerId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateApplicationStatus(applicationId: string, status: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getApplicationById(applicationId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner(
          *,
          employer_profiles!inner(*)
        ),
        candidate_profiles!inner(
          *,
          profiles!inner(*)
        )
      `)
      .eq('id', applicationId)
      .single();

    if (error) throw error;
    return data;
  },
};
