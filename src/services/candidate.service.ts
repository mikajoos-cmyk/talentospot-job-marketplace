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
        profiles!inner(
          full_name,
          email,
          phone,
          avatar_url
        ),
        candidate_skills(
          proficiency_percentage,
          skills(id, name)
        ),
        candidate_languages(
          proficiency_level,
          languages(id, name)
        ),
        candidate_experience(*),
        candidate_education(*),
        candidate_qualifications(
          qualifications(id, name)
        )
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Transformation der Daten für das Frontend
    return {
      ...data,
      name: data.profiles?.full_name,
      email: data.profiles?.email,
      phone: data.profiles?.phone,
      avatar: data.profiles?.avatar_url,
      // Mapping der Nested Relations
      skills: data.candidate_skills?.map((item: any) => ({
        id: item.skills?.id,
        name: item.skills?.name,
        percentage: item.proficiency_percentage
      })) || [],
      languages: data.candidate_languages?.map((item: any) => ({
        id: item.languages?.id,
        name: item.languages?.name,
        level: item.proficiency_level
      })) || [],
      qualifications: data.candidate_qualifications?.map((q: any) => q.qualifications?.name) || [],
      experience: data.candidate_experience || [],
      education: data.candidate_education || [],
      // Alias für Felder
      salary: {
        min: data.salary_expectation_min,
        max: data.salary_expectation_max
      }
    };
  },

  // src/services/candidate.service.ts

  async updateCandidateProfile(userId: string, updates: any) {
    // 1. Trenne Profil-Updates von Relation-Updates
    const {
      name, email, phone, // Gehört in 'profiles'
      skills, experience, education, // Gehört in Untertabellen
      languages, qualifications, salary, // Helper Objekte
      jobTypes, // <--- DAS HIER WAR DAS PROBLEM (hieß vorher oft preferred_job_types im Frontend)
      ...candidateProfileUpdates
    } = updates;

    // HELPER: Leere Datums-Strings zu NULL konvertieren, um Fehler 22007 zu verhindern
    const dateFields = ['date_of_birth', 'available_from'];
    dateFields.forEach(field => {
      if (candidateProfileUpdates[field] === '') {
        candidateProfileUpdates[field] = null;
      }
    });

    // Mapping: Frontend "salary" Objekt -> DB Spalten
    if (salary) {
      candidateProfileUpdates.salary_expectation_min = salary.min;
      candidateProfileUpdates.salary_expectation_max = salary.max;
    }

    // Mapping: Frontend "jobTypes" -> DB Spalte "job_type"
    if (jobTypes) {
      candidateProfileUpdates.job_type = jobTypes; // Hier korrigiert!
    }

    // 2. Update Hauptprofil (profiles Tabelle)
    if (name || phone) {
      await supabase.from('profiles').update({
        full_name: name,
        phone: phone
      }).eq('id', userId);
    }

    // 3. Update Kandidatenprofil (candidate_profiles Tabelle)
    if (Object.keys(candidateProfileUpdates).length > 0) {
      const { error } = await supabase
        .from('candidate_profiles')
        .update(candidateProfileUpdates)
        .eq('id', userId);

      if (error) throw error;
    }
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

  // Helper Methoden für Relationen
  async getCandidateSkills(candidateId: string) {
    const { data, error } = await supabase
      .from('candidate_skills')
      .select(`*, skills(*)`)
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

  async getFeaturedTalent(limit: number = 6) {
    const { data, error } = await supabase
      .from('candidate_profiles')
      .select(`
        *,
        profiles!inner(full_name, avatar_url),
        candidate_skills(
          skills(name)
        )
      `)
      .limit(limit);

    if (error) throw error;
    return data;
  },
};