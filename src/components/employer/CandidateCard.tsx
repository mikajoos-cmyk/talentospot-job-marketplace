import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, Calendar, Clock, UserPlus, Globe } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';
import { jobsService } from '@/services/jobs.service';
import { invitationsService } from '@/services/invitations.service';
import { candidateService } from '@/services/candidate.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CandidateCardProps {
  candidate: any;
  accessStatus?: string;
  matchScore?: number;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, accessStatus, matchScore }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showToast } = useToast();
  // Strict privacy: Blurred unless request accepted.
  // Package tier might still be relevant for *initiating* contact, but visibility depends on request.
  const isBlurred = accessStatus !== 'approved';
  const canContact = accessStatus === 'approved';

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [requestPending, setRequestPending] = useState(accessStatus === 'pending');
  const [jobs, setJobs] = useState<any[]>([]);

  // Sync state with prop
  useEffect(() => {
    setRequestPending(accessStatus === 'pending' || accessStatus === 'rejected' || accessStatus === 'approved');
  }, [accessStatus]);

  useEffect(() => {
    const loadJobs = async () => {
      if (inviteDialogOpen && user.role === 'employer' && user.profile) {
        try {
          const jobsData = await jobsService.getJobsByEmployer(user.profile.id);
          setJobs(jobsData?.filter((j: any) => j.status === 'active') || []);
        } catch (error) {
          console.error('Error loading jobs:', error);
        }
      }
    };
    loadJobs();
  }, [inviteDialogOpen, user.role, user.profile]);

  const handleAction = async () => {

    if (canContact) {
      navigate(`/employer/messages?conversationId=${candidate.id}`);
    } else if (isBlurred && accessStatus !== 'pending' && accessStatus !== 'rejected') {
      // Request Personal Data
      try {
        if (!user.profile?.id) return;
        const result = await candidateService.requestDataAccess(candidate.id, user.profile.id);
        if (result.status === 'exists') {
          showToast({ title: 'Info', description: 'Request already pending or processed.' });
        } else {
          showToast({
            title: 'Request Sent',
            description: `Personal data request sent to candidate.`,
          });
          setRequestPending(true);
        }
      } catch (e) {
        console.error(e);
        showToast({ title: 'Error', description: 'Failed to send request.', variant: 'destructive' });
      }
    } else {
      // Pending or Rejected state
      const statusText = accessStatus === 'rejected' ? 'rejected' : 'pending';
      showToast({
        title: `Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
        description: `Your request is ${statusText}.`,
      });
    }
  };

  const handleInvite = async (jobId: string, jobTitle: string) => {
    try {
      const candidateName = candidate.profiles?.full_name || 'candidate';

      if (!user.profile) {
        showToast({
          title: 'Error',
          description: 'Employer profile not found',
          variant: 'destructive',
        });
        return;
      }

      await invitationsService.sendInvitation({
        job_id: jobId,
        candidate_id: candidate.id,
        employer_id: user.profile.id,
        message: `We would like to invite you to apply for the position: ${jobTitle}`,
      });

      showToast({
        title: 'Invitation Sent',
        description: `${candidateName} has been invited to apply for ${jobTitle}`,
      });
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      showToast({
        title: 'Error',
        description: 'Failed to send invitation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Always show anonymized name in search results
  const displayName = isBlurred
    ? `Candidate #${String(candidate.id).slice(-3).padStart(3, '0')}`
    : candidate.name || 'Candidate';

  // Always blur avatar in search results until access is granted
  const shouldBlurIdentity = isBlurred;

  const candidateAvatar = candidate.avatar;
  const candidateTitle = candidate.title || 'Professional';
  const candidateLocation = candidate.location || 'Location not specified';
  const minSalary = candidate.salary?.min || 0;
  const maxSalary = candidate.salary?.max || 0;
  const isRefugee = candidate.isRefugee || false;
  const entryBonus = candidate.conditions?.entryBonus;
  const availableFrom = candidate.availableFrom;
  const noticePeriod = candidate.conditions?.noticePeriod;

  // Format preferred locations
  const preferredLocationsString = candidate.preferredLocations?.map((loc: any) => {
    const parts = [];
    if (loc.city) parts.push(loc.city);
    if (loc.country) parts.push(loc.country);
    return parts.join(', ');
  }).filter(Boolean).join('; ');

  return (
    <>
      <Card className="p-6 pb-8 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1 h-full min-h-[460px] flex flex-col">
        <div className="flex flex-col space-y-5 h-full">
          <div
            className="flex items-start space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/employer/candidates/${candidate.id}`)}
          >
            <div className="relative">
              <Avatar className={`w-16 h-16 ${shouldBlurIdentity ? 'blur-md' : ''}`}>
                <AvatarImage src={candidateAvatar} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {displayName.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {shouldBlurIdentity && (
                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {isRefugee && (
                <div className="flex items-center px-2 py-0.5 bg-accent/10 text-accent text-[10px] uppercase tracking-wider font-semibold rounded-md mb-2 w-fit border border-accent/20">
                  <Globe className="w-2.5 h-2.5 mr-1" strokeWidth={2} />
                  Refugee/Immigrant
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <h4 className={`text-h4 font-heading text-foreground truncate hover:text-primary transition-colors ${shouldBlurIdentity ? 'blur-sm' : ''}`}>
                  {displayName}
                </h4>
                {matchScore !== undefined && (
                  <div className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${matchScore >= 80 ? 'bg-success/20 text-success' :
                      matchScore >= 50 ? 'bg-warning/20 text-warning' :
                        'bg-muted text-muted-foreground'
                    }`}>
                    {matchScore}% Match
                  </div>
                )}
              </div>
              <p className="text-body-sm text-muted-foreground">{candidateTitle}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-body-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
              <span>{candidateLocation}</span>
            </div>
            {minSalary > 0 && maxSalary > 0 && (
              <div className="flex items-center text-body-sm text-muted-foreground">
                <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
                <span>
                  {candidate.currency || 'EUR'} {minSalary.toLocaleString()} - {maxSalary.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {preferredLocationsString && (
            <div className="text-body-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground">Preferred: </span>
              {preferredLocationsString}
            </div>
          )}

          {entryBonus && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-medium text-warning">Entry Bonus</span>
                <span className="text-h4 font-heading text-warning">{candidate.currency || 'EUR'} {entryBonus.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {availableFrom && (
              <div className="flex items-center px-2 py-1 bg-info/10 text-info text-caption rounded-md">
                <Calendar className="w-3 h-3 mr-1" strokeWidth={1.5} />
                <span>Available: {new Date(availableFrom).toLocaleDateString()}</span>
              </div>
            )}
            {noticePeriod && (
              <div className="flex items-center px-2 py-1 bg-muted text-foreground text-caption rounded-md">
                <Clock className="w-3 h-3 mr-1" strokeWidth={1.5} />
                <span>{noticePeriod}</span>
              </div>
            )}
          </div>

          {candidate.skills && candidate.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {candidate.skills.slice(0, 3).map((skillItem: any, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-muted text-foreground text-caption rounded-md"
                >
                  {skillItem.name || 'Skill'}
                </span>
              ))}
              {candidate.skills.length > 3 && (
                <span className="px-2 py-1 bg-muted text-foreground text-caption rounded-md">
                  +{candidate.skills.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex space-x-2 mt-auto pt-2">
            <Button
              onClick={handleAction}
              disabled={requestPending && !canContact}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover font-normal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canContact ? 'Message' : accessStatus === 'rejected' ? 'Request Rejected' : requestPending ? 'Request Pending' : 'Request Data'}
            </Button>
            <Button
              onClick={() => setInviteDialogOpen(true)}
              variant="outline"
              className="flex-1 bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              <UserPlus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Invite
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Invite to Apply</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Select a job to invite {isBlurred ? 'this candidate' : displayName} to apply
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
            {jobs.length === 0 ? (
              <p className="text-body-sm text-muted-foreground text-center py-8">
                No active jobs available. Post a job first to invite candidates.
              </p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => handleInvite(job.id, job.title)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-h4 font-heading text-primary">
                        {job.title.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-body font-medium text-foreground mb-1">{job.title}</h4>
                      <p className="text-body-sm text-muted-foreground mb-2">
                        {job.location || 'Location not specified'}
                      </p>
                      <div className="flex items-center space-x-4 text-caption text-muted-foreground">
                        <span>{job.employment_type || 'Full-time'}</span>
                        {job.salary_min && job.salary_max && (
                          <>
                            <span>•</span>
                            <span>{job.salary_currency || 'EUR'} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CandidateCard;
