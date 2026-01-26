import { supabase } from '../lib/supabase';

export interface Job {
  id?: string;
  employer_id: string;
  title: string;
  description: string;
  continent?: string;
  country?: string;
  city?: string;
  location_display?: string;
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  entry_bonus?: number;
  contract_duration?: string;
  required_languages?: string[];
  home_office_available?: boolean;
  required_qualifications?: string[];
  required_skills?: string[];
  status?: string;
  is_featured?: boolean;
}

export const jobsService = {
  async createJob(job: Job) {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        ...job,
        posted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateJob(jobId: string, updates: Partial<Job>) {
    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteJob(jobId: string) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
  },

  async getJobById(jobId: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer_profiles!inner(
          id,
          company_name,
          logo_url,
          industry,
          company_size,
          website,
          headquarters_city,
          headquarters_country,
          profiles!inner (
             email
          )
        )
      `)
      .eq('id', jobId)
      .single();

    if (error) throw error;

    await supabase
      .from('jobs')
      .update({ views: (data.views || 0) + 1 })
      .eq('id', jobId);

    // Wenn das Frontend "company" als flaches Objekt erwartet:
    return {
      ...data,
      company: {
        name: data.employer_profiles?.company_name,
        logo: data.employer_profiles?.logo_url,
        location: `${data.employer_profiles?.headquarters_city || ''}, ${data.employer_profiles?.headquarters_country || ''}`.replace(/^, |, $/g, ''), // Clean up if parts missing
        industry: data.employer_profiles?.industry,
        size: data.employer_profiles?.company_size,
        website: data.employer_profiles?.website,
        email: data.employer_profiles?.profiles?.email
      }
    };
  },

  async searchJobs(filters: any = {}) {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer_profiles!inner(
          company_name,
          logo_url,
          profiles!inner(full_name)
        )
      `)
      .eq('status', 'active');

    if (filters.title) {
      query = query.ilike('title', `%${filters.title}%`);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
    }

    if (filters.min_salary) {
      query = query.gte('salary_min', filters.min_salary);
    }

    if (filters.max_salary) {
      query = query.lte('salary_max', filters.max_salary);
    }

    if (filters.is_featured) {
      query = query.eq('is_featured', true);
    }

    query = query.order('posted_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getJobsByEmployer(employerId: string) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getLatestJobs(limit: number = 10) {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer_profiles!inner(
          company_name,
          logo_url,
          profiles!inner(full_name)
        )
      `)
      .eq('status', 'active')
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getFeaturedJobs(limit: number = 6) {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer_profiles!inner(
          company_name,
          logo_url,
          profiles!inner(full_name)
        )
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('posted_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};
