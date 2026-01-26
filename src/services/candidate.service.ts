import { supabase } from '../lib/supabase';

export interface CandidateProfile {
  id: string;
  date_of_birth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  is_refugee?: boolean;
  origin_country?: string;
  job_title?: string;
  sector?: string;
  career_level?: string;
  years_of_experience?: number;
  employment_status?: string;
  notice_period?: string;
  salary_expectation_min?: number;
  salary_expectation_max?: number;
  currency?: string;
  desired_entry_bonus?: number;
  work_radius_km?: number;
  contract_type?: string[];
  job_type?: string[];
  home_office_preference?: string;
  travel_willingness?: number;
  vacation_days?: number;
  available_from?: string;
  cv_url?: string;
  portfolio_images?: string[];
  video_url?: string;
  additional_documents?: string[];
  description?: string;
  driving_licenses?: string[];
}

export const candidateService = {
  async getCandidateProfile(userId: string) {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        *,
        profiles!inner(*)
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateCandidateProfile(userId: string, updates: Partial<CandidateProfile>) {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async searchCandidates(filters: any = {}) {
    let query = supabase
      .from('candidate_profiles')
      .select(`
        *,
        profiles!inner(full_name, avatar_url, email),
        candidate_skills(
          id,
          skills(id, name)
        )
      `);

    if (filters.job_title) {
      query = query.ilike('job_title', `%${filters.job_title}%`);
    }

    if (filters.sector) {
      query = query.eq('sector', filters.sector);
    }

    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.country) {
      query = query.eq('country', filters.country);
    }

    if (filters.career_level) {
      query = query.eq('career_level', filters.career_level);
    }

    if (filters.min_salary) {
      query = query.gte('salary_expectation_min', filters.min_salary);
    }

    if (filters.max_salary) {
      query = query.lte('salary_expectation_max', filters.max_salary);
    }

    if (filters.is_refugee !== undefined) {
      query = query.eq('is_refugee', filters.is_refugee);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getCandidateSkills(candidateId: string) {
    const { data, error } = await supabase
      .from('candidate_skills')
      .select(`
        *,
        skills(*)
      `)
      .eq('candidate_id', candidateId);

    if (error) throw error;
    return data;
  },

  async addCandidateSkill(candidateId: string, skillId: string, proficiency: number) {
    const { data, error } = await supabase
      .from('candidate_skills')
      .insert({
        candidate_id: candidateId,
        skill_id: skillId,
        proficiency_percentage: proficiency,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCandidateLanguages(candidateId: string) {
    const { data, error } = await supabase
      .from('candidate_languages')
      .select(`
        *,
        languages(*)
      `)
      .eq('candidate_id', candidateId);

    if (error) throw error;
    return data;
  },

  async addCandidateLanguage(candidateId: string, languageId: string, level: string) {
    const { data, error } = await supabase
      .from('candidate_languages')
      .insert({
        candidate_id: candidateId,
        language_id: languageId,
        proficiency_level: level,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCandidateQualifications(candidateId: string) {
    const { data, error } = await supabase
      .from('candidate_qualifications')
      .select(`
        *,
        qualifications(*)
      `)
      .eq('candidate_id', candidateId);

    if (error) throw error;
    return data;
  },

  async addCandidateQualification(candidateId: string, qualificationId: string) {
    const { data, error } = await supabase
      .from('candidate_qualifications')
      .insert({
        candidate_id: candidateId,
        qualification_id: qualificationId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCandidateExperience(candidateId: string) {
    const { data, error } = await supabase
      .from('candidate_experience')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addCandidateExperience(candidateId: string, experience: any) {
    const { data, error } = await supabase
      .from('candidate_experience')
      .insert({
        candidate_id: candidateId,
        ...experience,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCandidateEducation(candidateId: string) {
    const { data, error } = await supabase
      .from('candidate_education')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addCandidateEducation(candidateId: string, education: any) {
    const { data, error } = await supabase
      .from('candidate_education')
      .insert({
        candidate_id: candidateId,
        ...education,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
