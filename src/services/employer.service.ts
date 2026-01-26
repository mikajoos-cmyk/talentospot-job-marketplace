import { supabase } from '../lib/supabase';

export interface EmployerProfile {
  id: string;
  company_name: string;
  company_size?: string;
  industry?: string;
  founded_year?: number;
  website?: string;
  description?: string;
  contact_person: string;
  contact_email: string;
  contact_phone?: string;
  headquarters_address?: string;
  headquarters_city?: string;
  headquarters_country?: string;
  logo_url?: string;
  video_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  open_for_refugees?: boolean;
}

export const employerService = {
  async getEmployerProfile(userId: string) {
    const { data, error } = await supabase
      .from('employer_profiles')
      .select(`
        *,
        profiles!inner(*)
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateEmployerProfile(userId: string, updates: Partial<EmployerProfile>) {
    const { data, error } = await supabase
      .from('employer_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async searchEmployers(filters: any = {}) {
    let query = supabase
      .from('employer_profiles')
      .select(`
        *,
        profiles!inner(full_name, avatar_url)
      `);

    if (filters.company_name) {
      query = query.ilike('company_name', `%${filters.company_name}%`);
    }

    if (filters.industry) {
      query = query.eq('industry', filters.industry);
    }

    if (filters.city) {
      query = query.eq('headquarters_city', filters.city);
    }

    if (filters.country) {
      query = query.eq('headquarters_country', filters.country);
    }

    if (filters.open_for_refugees) {
      query = query.eq('open_for_refugees', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getEmployerById(employerId: string) {
    const { data, error } = await supabase
      .from('employer_profiles')
      .select(`
        *,
        profiles!inner(full_name, avatar_url, email)
      `)
      .eq('id', employerId)
      .single();

    if (error) throw error;
    return data;
  },
};
