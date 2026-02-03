import { supabase } from '../lib/supabase';
import { invitationsService } from './invitations.service';
import { messagesService } from './messages.service';
import { packagesService } from './packages.service';

export interface Application {
  job_id: string;
  candidate_id: string;
  employer_id: string;
  cover_letter?: string;
  cv_url?: string;
  additional_documents?: string[];
}

export const applicationsService = {
  async applyToJob(application: Application) {
    // Prüfen, ob eine Einladung vorliegt
    const { data: invitations } = await supabase
      .from('job_invitations')
      .select('id')
      .eq('job_id', application.job_id)
      .eq('candidate_id', application.candidate_id)
      .eq('status', 'pending');

    const isInvited = invitations && invitations.length > 0;

    if (!isInvited) {
      // Es ist eine aktive/initiativ Bewerbung -> Limit prüfen
      const limitCheck = await packagesService.checkLimit(application.candidate_id, 'applications');
      if (!limitCheck.allowed) {
        // Spezielle Fehlermeldung für Free User
        if (limitCheck.message?.includes('Kein aktives Abonnement')) {
          throw new Error('Im kostenlosen Tarif können Sie sich nur auf Einladung bewerben.');
        }
        throw new Error(limitCheck.message);
      }
    }

    const { data, error } = await supabase
      .from('job_applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;

    // Usage Increment nur wenn NICHT eingeladen
    if (!error && !isInvited) {
      await packagesService.incrementUsage(application.candidate_id, 'applications');
    }

    await supabase.rpc('increment', {
      table_name: 'jobs',
      row_id: application.job_id,
      column_name: 'applications_count',
    });

    // Mark any pending invitations for this job as accepted
    try {
      await invitationsService.updateInvitationStatusByJobAndCandidate(
        application.job_id,
        application.candidate_id,
        'accepted'
      );
    } catch (invError) {
      console.error('Error updating invitation status:', invError);
      // Don't fail the application if invitation update fails
    }

    return data;
  },

  async getApplicationsByCandidate(candidateId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner(
          *,
          employer_profiles!inner(
            company_name,
            logo_url
          )
        )
      `)
      .eq('candidate_id', candidateId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getApplicationsByJob(jobId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        candidate_profiles!inner(
          *,
          profiles!inner(full_name, avatar_url)
        )
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getApplicationsByEmployer(employerId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner(*),
        candidate_profiles!inner(
          *,
          profiles!inner(full_name, avatar_url)
        )
      `)
      .eq('employer_id', employerId)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateApplicationStatus(applicationId: string, status: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getApplicationById(applicationId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        jobs!inner(
          *,
          employer_profiles!inner(*)
        ),
        candidate_profiles!inner(
          *,
          profiles!inner(*),
          candidate_skills(proficiency_percentage, skills(id, name)),
          candidate_languages(proficiency_level, languages(id, name)),
          candidate_experience(*),
          candidate_education(*),
          candidate_qualifications(qualifications(id, name)),
          candidate_preferred_locations(
            id,
            cities(name),
            countries(name),
            continents(name)
          )
        )
      `)
      .eq('id', applicationId)
      .single();

    if (error) throw error;
    return data;
  },

  async hasApplied(jobId: string, candidateId: string) {
    const { data, error } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async acceptApplication(applicationId: string, employerId: string) {
    // First, get the full application details
    const application = await this.getApplicationById(applicationId);

    if (!application) {
      throw new Error('Application not found');
    }

    // Update application status to 'accepted'
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status: 'accepted' })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;

    // Create or get conversation between employer and candidate
    const conversation = await messagesService.getOrCreateConversation(
      employerId,
      application.candidate_id
    );

    // Send acceptance message to candidate
    const jobTitle = application.jobs?.title || 'die Position';
    const companyName = application.jobs?.employer_profiles?.company_name || 'unser Unternehmen';
    const jobLocation = `${application.jobs?.city || ''}, ${application.jobs?.country || ''}`.trim().replace(/^,\s*|,\s*$/, '');

    const messageContent = `🎉 Glückwunsch! Ihre Bewerbung für die Position "${jobTitle}" bei ${companyName} wurde akzeptiert!\n\nWir freuen uns, Sie kennenzulernen. Wir werden uns in Kürze mit Ihnen in Verbindung setzen, um die nächsten Schritte zu besprechen.\n\n📍 Standort: ${jobLocation}\n\nBei Fragen können Sie uns gerne über diese Nachrichtenfunktion kontaktieren.`;

    await messagesService.sendMessage(
      conversation.id,
      employerId,
      messageContent
    );

    return data;
  },

  async rejectApplication(applicationId: string, employerId: string) {
    // First, get the full application details
    const application = await this.getApplicationById(applicationId);

    if (!application) {
      throw new Error('Application not found');
    }

    // Update application status to 'rejected'
    const { data, error } = await supabase
      .from('job_applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;

    // Create or get conversation between employer and candidate
    const conversation = await messagesService.getOrCreateConversation(
      employerId,
      application.candidate_id
    );

    // Send rejection message to candidate
    const jobTitle = application.jobs?.title || 'die Position';
    const companyName = application.jobs?.employer_profiles?.company_name || 'unser Unternehmen';

    const messageContent = `Vielen Dank für Ihr Interesse an der Position "${jobTitle}" bei ${companyName}.\n\nNach sorgfältiger Prüfung Ihrer Bewerbung müssen wir Ihnen leider mitteilen, dass wir uns für andere Kandidaten entschieden haben, die besser zu den aktuellen Anforderungen der Position passen.\n\nWir schätzen die Zeit und Mühe, die Sie in Ihre Bewerbung investiert haben, sehr und ermutigen Sie, sich auf andere Positionen bei uns zu bewerben.\n\nWir wünschen Ihnen viel Erfolg bei Ihrer weiteren Jobsuche!`;

    await messagesService.sendMessage(
      conversation.id,
      employerId,
      messageContent
    );

    return data;
  },
};
