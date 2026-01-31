import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, Calendar, UserPlus, Briefcase, Award } from 'lucide-react';
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
  // Strict privacy: Blurred unless request accepted or guest.
  const isBlurred = user.role === 'guest' || accessStatus !== 'approved';
  const canContact = user.role !== 'guest' && accessStatus === 'approved';

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
    if (user.role === 'guest') {
      navigate('/login');
      return;
    }

    if (canContact) {
      navigate(`/employer/messages?conversationId=${candidate.id}`);
    } else if (isBlurred && accessStatus !== 'pending' && accessStatus !== 'rejected') {
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
      const statusText = accessStatus === 'rejected' ? 'rejected' : 'pending';
      showToast({
        title: `Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
        description: `Your request is ${statusText}.`,
      });
    }
  };

  const handleInvite = async (jobId: string, jobTitle: string) => {
    if (user.role === 'guest') {
      navigate('/login');
      return;
    }
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

  const displayName = isBlurred
    ? `Candidate #${String(candidate.id).slice(-3).padStart(3, '0')}`
    : candidate.profiles?.full_name || candidate.name || 'Candidate';

  const shouldBlurIdentity = isBlurred;
  const candidateAvatar = candidate.profiles?.avatar_url || candidate.avatar;
  const candidateTitle = candidate.job_title || candidate.title || 'Professional';
  const location = candidate.city && candidate.country ? `${candidate.city}, ${candidate.country}` : candidate.location || 'Location not specified';
  const minSalary = candidate.salary_expectation_min || candidate.salary?.min || 0;
  const maxSalary = candidate.salary_expectation_max || candidate.salary?.max || 0;
  const isRefugee = candidate.is_refugee === true || candidate.isRefugee === true;
  const employmentStatus = candidate.employment_status || candidate.employmentStatus || 'Available';
  const entryBonus = candidate.desired_entry_bonus || candidate.conditions?.entryBonus;
  const sector = candidate.sector || candidate.industry || 'General';
  const careerLevel = candidate.career_level || candidate.careerLevel || 'Not specified';

  // Robust availability parsing
  const rawAvailability = candidate.available_from || candidate.availableFrom || candidate.conditions?.startDate;
  const availability = rawAvailability ? new Date(rawAvailability).toLocaleDateString() : 'Immediate';

  const skills = candidate.candidate_skills || candidate.skills || [];
  const languages = candidate.candidate_languages || candidate.languages || [];
  const qualifications = candidate.candidate_qualifications || candidate.qualifications || [];
  const nationalityCode = candidate.nationality_code || candidate.nationalityCode;

  return (
    <>
      <Card className="group p-0 overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          {/* Left Section: Profile Info */}
          <div className="p-6 md:w-72 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-border bg-muted/5 shrink-0">
            <div className="relative mb-4">
              <div className="relative">
                <Avatar className={`w-24 h-24 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500 ${shouldBlurIdentity ? 'blur-md' : ''}`}>
                  <AvatarImage src={candidateAvatar} alt={displayName} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-primary text-white">
                    {displayName.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {shouldBlurIdentity && (
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-sm rounded-full"></div>
                )}
              </div>
              {nationalityCode && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-md">
                  <img
                    src={`https://flagcdn.com/w40/${nationalityCode.toLowerCase()}.png`}
                    alt={candidate.nationality}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            <h4 className={`text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors ${shouldBlurIdentity ? 'blur-sm' : ''}`}>
              {displayName}
            </h4>
            <p className="text-sm font-medium text-muted-foreground mb-4">{candidateTitle}</p>

            <div className="w-full pt-4 border-t border-border/50 space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {employmentStatus}
                </span>
                {isRefugee && (
                  <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                    Refugee/Immigrant
                  </span>
                )}
                {matchScore !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full ${matchScore >= 80 ? 'bg-success/20 text-success' :
                    matchScore >= 50 ? 'bg-warning/20 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                    {matchScore}% Match
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Middle Section: Details */}
          <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8 min-w-0">
            {/* Column 1: Core Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/5 text-primary">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Location</p>
                  <p className="text-sm font-semibold">{location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/5 text-primary">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Sector</p>
                  <p className="text-sm font-semibold">{sector}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/5 text-primary">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Career Level</p>
                  <p className="text-sm font-semibold capitalize">{careerLevel}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/5 text-primary">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Salary Expectation</p>
                  <p className="text-sm font-semibold">
                    {candidate.currency || 'EUR'} {minSalary.toLocaleString()} - {maxSalary.toLocaleString()}
                  </p>
                  {entryBonus && <p className="text-xs font-bold text-warning">Entry Bonus: €{entryBonus.toLocaleString()}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground pt-2">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wide">Available: {availability}</span>
              </div>
            </div>

            {/* Column 2: Skills & Langs */}
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Top Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 5).map((s: any, index: number) => {
                    const skillName = s.skills?.name || s.name || 'Skill';
                    return (
                      <span key={index} className="px-2 py-1 bg-muted text-foreground text-[11px] font-semibold rounded-md border border-border/50">
                        {skillName}
                      </span>
                    );
                  })}
                  {skills.length > 5 && <span className="text-[10px] text-muted-foreground font-bold">+{skills.length - 5} more</span>}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Qualifications</p>
                <div className="flex flex-wrap gap-1.5">
                  {qualifications.slice(0, 3).map((q: any, index: number) => {
                    const qualName = typeof q === 'string' ? q : (q.qualifications?.name || q.name || 'Qualification');
                    return (
                      <span key={index} className="px-2 py-0.5 bg-accent/10 text-accent text-[11px] font-bold rounded-md border border-accent/20">
                        {qualName}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {languages.slice(0, 3).map((l: any, index: number) => {
                    const name = l.languages?.name || (typeof l === 'string' ? l : l.name);
                    const level = l.proficiency_level || l.level || '';
                    return (
                      <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100">
                        {name}{level ? ` (${level})` : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Action */}
          <div className="p-6 md:w-48 flex flex-col justify-center items-center gap-3 bg-muted/5 border-t md:border-t-0 md:border-l border-border">
            <Button
              onClick={handleAction}
              disabled={requestPending && !canContact}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canContact ? 'Message' : accessStatus === 'rejected' ? 'Rejected' : requestPending ? 'Pending' : 'Request Data'}
            </Button>
            <Button
              onClick={() => {
                if (user.role === 'guest') {
                  navigate('/login');
                } else {
                  setInviteDialogOpen(true);
                }
              }}
              variant="outline"
              className="w-full border-primary/20 text-primary hover:bg-primary/5 font-bold h-11"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const path = user.role === 'guest' ? `/candidates/${candidate.id}` : `/employer/candidates/${candidate.id}`;
                navigate(path);
              }}
              className="text-[11px] text-muted-foreground hover:text-primary font-bold uppercase tracking-wider"
            >
              View Full Profile
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
                        {job.city || job.location || 'Location not specified'}
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
