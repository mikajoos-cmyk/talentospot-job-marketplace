import { supabase } from '../lib/supabase';

export const masterDataService = {
  async getSkills() {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createSkill(name: string, category?: string) {
    const { data, error } = await supabase
      .from('skills')
      .insert({ name, category })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLanguages() {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createLanguage(name: string, code: string) {
    const { data, error } = await supabase
      .from('languages')
      .insert({ name, code })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getQualifications() {
    const { data, error } = await supabase
      .from('qualifications')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createQualification(name: string, category?: string) {
    const { data, error } = await supabase
      .from('qualifications')
      .insert({ name, category })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getContinents() {
    const { data, error } = await supabase
      .from('continents')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getCountries(continentId?: string) {
    let query = supabase
      .from('countries')
      .select('*')
      .order('name', { ascending: true });

    if (continentId) {
      query = query.eq('continent_id', continentId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getCities(countryId?: string) {
    let query = supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true });

    if (countryId) {
      query = query.eq('country_id', countryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },
};
