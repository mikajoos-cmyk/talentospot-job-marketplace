import { supabase } from '../lib/supabase';

export interface Country {
  id: string;
  name: string;
  code: string;
  phone: string; // Gemappt von phone_code aus DB
}

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
      .from('languages_to_translate')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createLanguage(name: string, code: string) {
    const { data, error } = await supabase
      .from('languages_to_translate')
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

  async getCountries(): Promise<Country[]> {
    const { data, error } = await supabase
      .from('countries')
      .select('id, name, code, phone_code')
      .order('name');
    
    if (error) {
      console.error('Error fetching countries:', error);
      return [];
    }

    // Mapping von DB phone_code auf frontend property 'phone'
    return data.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      phone: c.phone_code
    }));
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

  async getStates(countryId?: string) {
    let query = supabase
      .from('states')
      .select('*')
      .order('name', { ascending: true });

    if (countryId) {
      query = query.eq('country_id', countryId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  async getJobTitles() {
    const { data, error } = await supabase
      .from('job_titles')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getSectors() {
    const { data, error } = await supabase
      .from('sectors')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getNationalities() {
    const { data, error } = await supabase
      .from('nationalities')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getRequirements() {
    const { data, error } = await supabase
      .from('requirements')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async syncMasterData(category: 'skills' | 'qualifications' | 'languages' | 'job_titles' | 'tags' | 'requirements' | 'sectors', names: string[]) {
    if (!names || names.length === 0) return;

    // Only allow for authenticated users
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Filter out empty names and duplicates
    const uniqueNames = Array.from(new Set(names.map(n => n.trim()).filter(Boolean)));

    if (category === 'languages') {
      // For languages, we try to find an existing language or we don't insert because code is required
      // For now, let's just skip it as languages are more structured
      return;
    }

    const insertData = uniqueNames.map(name => ({ name }));

    const { error } = await supabase
      .from(category)
      .upsert(insertData, { onConflict: 'name' });

    if (error) {
      console.error(`Error syncing master data for ${category}:`, error);
      // Don't throw to avoid breaking the caller
    }
  },

  async ensureMasterDataExists(category: string, name: string) {
    const validCategories = ['skills', 'qualifications', 'job_titles', 'tags', 'requirements', 'sectors'];
    if (!validCategories.includes(category) || !name || name.trim() === '') return;

    try {
      // Only allow for authenticated users to avoid RLS errors for guests
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check if it already exists in our local cache/suggestions if possible
      // But upsert is idempotent, so it's fine to just call it.
      // We use name as the conflict target.
      const { error } = await supabase
        .from(category)
        .upsert({ name: name.trim() }, { onConflict: 'name' });
      
      if (error) {
        // Log error but don't crash
        console.error(`Error ensuring master data exists for ${category}:`, error);
      }
    } catch (error) {
      console.error(`Error ensuring master data exists for ${category}:`, error);
    }
  },
};
