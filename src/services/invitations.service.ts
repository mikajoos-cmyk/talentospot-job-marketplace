import { supabase } from '../lib/supabase';

export interface Invitation {
  job_id: string;
  candidate_id: string;
  employer_id: string;
  message?: string;
}

export const invitationsService = {
  async sendInvitation(invitation: Invitation) {
    const { data, error } = await supabase
      .from('job_invitations')
      .insert(invitation)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getInvitationsByCandidate(candidateId: string) {
    const { data, error } = await supabase
      .from('job_invitations')
      .select(`
        *,
        jobs!inner(
          *,
          employer_profiles!inner(
            company_name,
            logo_url,
            profiles!inner(full_name)
          )
        )
      `)
      .eq('candidate_id', candidateId)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getInvitationsByEmployer(employerId: string) {
    const { data, error } = await supabase
      .from('job_invitations')
      .select(`
        *,
        jobs!inner(*),
        candidate_profiles!inner(
          *,
          profiles!inner(full_name, avatar_url)
        )
      `)
      .eq('employer_id', employerId)
      .order('sent_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async respondToInvitation(invitationId: string, status: 'accepted' | 'declined') {
    const { data, error } = await supabase
      .from('job_invitations')
      .update({
        status,
        responded_at: new Date().toISOString(),
      })
      .eq('id', invitationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInvitationStatusByJobAndCandidate(jobId: string, candidateId: string, status: 'accepted' | 'declined') {
    const { data, error } = await supabase
      .from('job_invitations')
      .update({
        status,
        responded_at: new Date().toISOString(),
      })
      .eq('job_id', jobId)
      .eq('candidate_id', candidateId)
      .eq('status', 'pending');

    if (error) throw error;
    return data;
  },

  async getInvitationById(invitationId: string) {
    const { data, error } = await supabase
      .from('job_invitations')
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
      .eq('id', invitationId)
      .single();

    if (error) throw error;
    return data;
  },
};
