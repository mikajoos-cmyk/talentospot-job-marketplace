import { supabase } from '../lib/supabase';

export const dataAccessService = {
  async requestDataAccess(employerId: string, candidateId: string, message?: string) {
    const { data, error } = await supabase
      .from('data_access_requests')
      .insert({
        employer_id: employerId,
        candidate_id: candidateId,
        message,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRequestsByCandidate(candidateId: string) {
    const { data, error } = await supabase
      .from('data_access_requests')
      .select(`
        *,
        employer_profiles!inner(
          *,
          profiles!inner(full_name, avatar_url)
        )
      `)
      .eq('candidate_id', candidateId)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getRequestsByEmployer(employerId: string) {
    const { data, error } = await supabase
      .from('data_access_requests')
      .select(`
        *,
        candidate_profiles!inner(
          *,
          profiles!inner(full_name, avatar_url)
        )
      `)
      .eq('employer_id', employerId)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async respondToRequest(requestId: string, status: 'approved' | 'rejected') {
    const { data, error } = await supabase
      .from('data_access_requests')
      .update({
        status,
        responded_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async hasAccessToCandidate(employerId: string, candidateId: string) {
    const { data, error } = await supabase
      .from('data_access_requests')
      .select('id')
      .eq('employer_id', employerId)
      .eq('candidate_id', candidateId)
      .eq('status', 'approved')
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },
};
