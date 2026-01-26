import { supabase } from '../lib/supabase';

export const followsService = {
  async followEmployer(candidateId: string, employerId: string) {
    const { data, error } = await supabase
      .from('follows')
      .insert({
        candidate_id: candidateId,
        employer_id: employerId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async unfollowEmployer(candidateId: string, employerId: string) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('candidate_id', candidateId)
      .eq('employer_id', employerId);

    if (error) throw error;
  },

  async getFollowingEmployers(candidateId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        employer_profiles!inner(
          *,
          profiles!inner(full_name, avatar_url)
        )
      `)
      .eq('candidate_id', candidateId)
      .order('followed_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getFollowerCandidates(employerId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        *,
        candidate_profiles!inner(
          *,
          profiles!inner(full_name, avatar_url)
        )
      `)
      .eq('employer_id', employerId)
      .order('followed_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async isFollowing(candidateId: string, employerId: string) {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('employer_id', employerId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async getFollowersCount(employerId: string) {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('employer_id', employerId);

    if (error) throw error;
    return count || 0;
  },
};
