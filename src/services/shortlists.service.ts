import { supabase } from '../lib/supabase';

export const shortlistsService = {
  async addToShortlist(employerId: string, candidateId: string, notes?: string) {
    const { data, error } = await supabase
      .from('shortlists')
      .insert({
        employer_id: employerId,
        candidate_id: candidateId,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromShortlist(employerId: string, candidateId: string) {
    const { error } = await supabase
      .from('shortlists')
      .delete()
      .eq('employer_id', employerId)
      .eq('candidate_id', candidateId);

    if (error) throw error;
  },

  async getShortlist(employerId: string) {
    const { data, error } = await supabase
      .from('shortlists')
      .select(`
        *,
        candidate_profiles!inner(
          *,
          profiles!inner(full_name, avatar_url)
        )
      `)
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async isInShortlist(employerId: string, candidateId: string) {
    const { data, error } = await supabase
      .from('shortlists')
      .select('id')
      .eq('employer_id', employerId)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async updateNotes(employerId: string, candidateId: string, notes: string) {
    const { data, error } = await supabase
      .from('shortlists')
      .update({ notes })
      .eq('employer_id', employerId)
      .eq('candidate_id', candidateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCompaniesShortlistingCandidate(candidateId: string) {
    const { data, error } = await supabase
      .from('shortlists')
      .select(`
        *,
        employer_profiles!inner(
          *,
          profiles!inner(full_name, avatar_url)
        )
      `)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
