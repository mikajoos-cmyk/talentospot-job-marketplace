import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, Calendar, Clock, UserPlus } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';
import { jobsService } from '@/services/jobs.service';
import { invitationsService } from '@/services/invitations.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CandidateCardProps {
  candidate: any;
  packageTier: 'free' | 'basic' | 'premium';
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, packageTier }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showToast } = useToast();
  const isBlurred = packageTier === 'free';
  const canContact = packageTier === 'premium';

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);

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
    const candidateName = candidate.profiles?.full_name || 'candidate';

    if (canContact) {
      showToast({
        title: 'Contact Initiated',
        description: `You can now contact ${candidateName}`,
      });
    } else {
      setRequestPending(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      showToast({
        title: 'Request Sent',
        description: `Personal data request sent to ${isBlurred ? 'candidate' : candidateName}`,
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

      await invitationsService.createInvitation({
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

  const displayName = isBlurred
    ? `Candidate #${String(candidate.id).slice(-3).padStart(3, '0')}`
    : candidate.profiles?.full_name || 'Candidate';

  const candidateAvatar = candidate.profiles?.avatar_url;
  const candidateTitle = candidate.title || 'Professional';
  const candidateLocation = candidate.current_location || 'Location not specified';
  const minSalary = candidate.expected_salary_min || 0;
  const maxSalary = candidate.expected_salary_max || 0;
  const isRefugee = candidate.is_refugee || false;
  const entryBonus = candidate.entry_bonus;
  const availableFrom = candidate.available_from;
  const noticePeriod = candidate.notice_period;

  return (
    <>
      <Card className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
        <div className="flex flex-col space-y-4">
          <div
            className="flex items-start space-x-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/employer/candidates/${candidate.id}`)}
          >
            <div className="relative">
              <Avatar className={`w-16 h-16 ${isBlurred ? 'blur-md' : ''}`}>
                <AvatarImage src={candidateAvatar} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {isBlurred && (
                <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {isRefugee && (
                <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-caption rounded-md mb-2">
                  Refugee/Immigrant
                </span>
              )}
              <h4 className="text-h4 font-heading text-foreground truncate hover:text-primary transition-colors">
                {displayName}
              </h4>
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
                  ${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {entryBonus && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm font-medium text-warning">Entry Bonus</span>
                <span className="text-h4 font-heading text-warning">${entryBonus.toLocaleString()}</span>
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

          {candidate.candidate_skills?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {candidate.candidate_skills.slice(0, 3).map((cs: any) => (
                <span
                  key={cs.skills?.id || cs.id}
                  className="px-2 py-1 bg-muted text-foreground text-caption rounded-md"
                >
                  {cs.skills?.name || 'Skill'}
                </span>
              ))}
              {candidate.candidate_skills.length > 3 && (
                <span className="px-2 py-1 bg-muted text-foreground text-caption rounded-md">
                  +{candidate.candidate_skills.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={handleAction}
              disabled={requestPending}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover font-normal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canContact ? 'Contact' : requestPending ? 'Request Pending' : 'Request Data'}
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
                            <span>${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
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
