import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, Calendar, UserPlus, Briefcase, Award, Activity } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useUser } from '@/contexts/UserContext';
import { jobsService } from '@/services/jobs.service';
import { invitationsService } from '@/services/invitations.service';
import { candidateService } from '@/services/candidate.service';
import { shortlistsService } from '@/services/shortlists.service';
import UpgradeModal from '@/components/shared/UpgradeModal';
import { formatLanguageLevel } from '@/utils/language-levels';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { language } = useLanguage();


  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalContent, setUpgradeModalContent] = useState({ title: '', description: '' });
  const [requestPending, setRequestPending] = useState(accessStatus === 'pending');
  const [jobs, setJobs] = useState<any[]>([]);
  const [isShortlisted, setIsShortlisted] = useState(false);

  // Sync state with prop
  useEffect(() => {
    setRequestPending(accessStatus === 'pending' || accessStatus === 'rejected' || accessStatus === 'approved');
  }, [accessStatus]);

  useEffect(() => {
    const checkShortlist = async () => {
      if (user.role === 'employer' && user.profile?.id && candidate.id) {
        try {
          const shortlisted = await shortlistsService.isInShortlist(user.profile.id, candidate.id);
          setIsShortlisted(shortlisted);
        } catch (e) {
          console.error("Error checking shortlist", e);
        }
      }
    };
    checkShortlist();
  }, [user.id, user.role, user.profile?.id, candidate.id]);

  // Strict privacy: Blurred unless request accepted or guest.
  // ALSO: If I don't have a package, I shouldn't see details even if it's shortlisted (maybe?)
  // Prompt: "blurring shortlisted candidates for employers without a purchased package"
  // If I access this card via Shortlist page, it should be blurred if I don't have package.
  // We can just rely on `hasActivePackage` combined with `accessStatus`.
  // If accessStatus is 'approved', wait, if I don't have a package, do I lose access? 
  // "Restricting direct messaging ... for employers without a purchased package"
  // So canContact should check hasActivePackage.
  // "blurring shortlisted candidates ... without a purchased package"
  // If I have no package, `isBlurred` should be true. (unless access is approved? Maybe approval requires package).

  // Revised Logic:
  // if guest: blurred
  // if employer:
  //   if access approved AND hasPackage: not blurred, contactable.
  //   if access approved BUT no package: blurred? Or just cannot contact?
  //   The prompt says "blurring shortlisted candidates".
  //   Let's assume: No package = Blurred (except maybe name if logic allows, but usually blurred means everything).

  // Actually, standard behavior:
  // Search results are anonymous (blurred name/contact).
  // If I have package, I can see more? Or is it about "Shortlisted"?
  // Let's implement: isBlurred = true if (guest OR (employer AND !hasPackage AND !accessApproved))?
  // Actually, usually "Shortlisted" means I saved them. If I don't have package, they appear blurred in shortlist.

  // Let's stick to: 
  const isBlurred = (user.role === 'admin' || accessStatus === 'approved' || (user.hasActivePackage && isShortlisted)) ? false : true;
  const isBlurredEffect = isBlurred;
  const canContact = user.role !== 'guest' && accessStatus === 'approved' && user.hasActivePackage;

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

    // Check for package if employer
    if (user.role === 'employer' && !user.hasActivePackage) {
      setUpgradeModalContent({
        title: 'Paket erforderlich',
        description: 'Sie benötigen ein aktives Paket, um diese Aktion ausführen zu können.'
      });
      setUpgradeModalOpen(true);
      return;
    }

    if (canContact) {
      navigate(`/employer/messages?conversationId=${candidate.id}`);
    } else if (isBlurredEffect && accessStatus !== 'pending' && accessStatus !== 'rejected') {
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
      } catch (e: any) {
        console.log('[DEBUG] Limit reached error caught in CandidateCard:', e);
        const errorMessage = e.message || 'Failed to send request.';
        const isLimitReached = 
          errorMessage.toLowerCase().includes('limit erreicht') || 
          errorMessage.toLowerCase().includes('limit reached') ||
          errorMessage.toLowerCase().includes('abonnement') ||
          errorMessage.toLowerCase().includes('upgrade') ||
          errorMessage.toLowerCase().includes('paket');

        if (isLimitReached) {
          setUpgradeModalContent({
            title: 'Upgrade erforderlich',
            description: errorMessage
          });
          setUpgradeModalOpen(true);
        } else {
          showToast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      }
    } else {
      const statusText = accessStatus === 'rejected' ? 'rejected' : 'pending';
      showToast({
        title: `Request ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
        description: `Your request is ${statusText}.`,
      });
    }
  };

  const handleShortlist = async () => {
    if (user.role === 'guest') {
      navigate('/login');
      return;
    }

    if (!user.profile?.id) {
      showToast({
        title: 'Error',
        description: 'Employer profile not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isShortlisted) {
        await shortlistsService.removeFromShortlist(user.profile.id, candidate.id);
        setIsShortlisted(false);
        showToast({
          title: 'Removed from Shortlist',
          description: 'Candidate has been removed from your shortlist.',
        });
      } else {
        await shortlistsService.addToShortlist(user.profile.id, candidate.id);
        setIsShortlisted(true);
        showToast({
          title: 'Added to Shortlist',
          description: 'Candidate has been added to your shortlist.',
        });
      }
    } catch (error) {
      console.error('Error updating shortlist:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update shortlist. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleInvite = async (jobId: string, jobTitle: string) => {
    if (user.role === 'guest') {
      navigate('/login');
      return;
    }

    if (user.role === 'employer' && !user.hasActivePackage) {
      setUpgradeModalContent({
        title: 'Paket erforderlich',
        description: 'Sie benötigen ein aktives Paket, um Einladungen an Talente senden zu können.'
      });
      setUpgradeModalOpen(true);
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

  const displayName = isBlurredEffect
    ? 'TalentoSPOT Candidate'
    : candidate.profiles?.full_name || candidate.name || 'Candidate';

  const shouldBlurIdentity = isBlurredEffect;
  const candidateAvatar = candidate.profiles?.avatar_url || candidate.avatar;
  const personalTitles = candidate.candidate_personal_titles || candidate.personalTitles || [];
  const candidateTitle = candidate.job_title || candidate.title || 'Professional';
  const location = candidate.city && candidate.country ? `${candidate.city}, ${candidate.country}` : candidate.location || 'Location not specified';
  const minSalary = candidate.salary_expectation_min || candidate.salary?.min || 0;
  const maxSalary = candidate.salary_expectation_max || candidate.salary?.max || 0;
  const isRefugee = candidate.is_refugee === true || candidate.isRefugee === true;
  const employmentStatus = candidate.employment_status || candidate.employmentStatus || 'Available';
  const entryBonus = candidate.desired_entry_bonus || candidate.conditions?.entryBonus;
  const sector = candidate.sector || candidate.industry || 'General';
  const careerLevel = candidate.career_level || candidate.careerLevel || 'Not specified';

  // Notice period parsing
  const noticePeriod = candidate.notice_period || candidate.noticePeriod || 'Immediate';

  const skills = candidate.candidate_skills || candidate.skills || [];
  const languages = candidate.candidate_languages || candidate.languages || [];
  const qualifications = candidate.candidate_qualifications || candidate.qualifications || [];
  const nationalityCode = candidate.nationality_code || candidate.nationalityCode;

  const displayTitle = personalTitles.length > 0 
    ? `${personalTitles.map((t: any) => typeof t === 'string' ? t : t.personal_titles?.name).join(', ')} ${candidateTitle}`
    : candidateTitle;

  return (
    <>
      <Card className="group p-0 overflow-hidden border border-border bg-card hover:shadow-xl transition-all duration-300">
        <div className={`flex flex-col ${user.role !== 'guest' ? 'layout-xl:flex-row' : 'layout-md:flex-row'}`}>
          {/* Left Section: Profile Info */}
          <div className={`p-6 ${user.role !== 'guest' ? 'layout-xl:w-72 layout-xl:border-b-0 layout-xl:border-r' : 'layout-md:w-72 layout-md:border-b-0 layout-md:border-r'} flex flex-col items-center text-center border-b border-border bg-muted/5 shrink-0`}>
            <div className="relative mb-4">
              <div className="relative">
                <Avatar className={`w-24 h-24 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500 ${shouldBlurIdentity ? 'blur-sm select-none' : ''}`}>
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
            <h4 className={`text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors ${shouldBlurIdentity ? 'blur-sm select-none' : ''}`}>
              {displayName}
            </h4>
            <div className="text-sm font-medium text-muted-foreground mb-4">
              {displayTitle}
            </div>

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
          <div className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 min-w-0">
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
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Qualification / Titles</p>
                  <p className="text-sm font-semibold capitalize">
                    {[
                      ...personalTitles.map((t: any) => typeof t === 'string' ? t : (t.personal_titles?.name || t.name)),
                      (qualifications[0] ? (typeof qualifications[0] === 'string' ? qualifications[0] : (qualifications[0].qualifications?.name || qualifications[0].name)) : null)
                    ].filter(Boolean).join(', ') || 'N/A'}
                  </p>
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
                  {entryBonus && <p className="text-sm font-bold text-[#FFB800]">Entry Bonus: €{entryBonus.toLocaleString()}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/5 text-primary">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Career Level</p>
                  <p className="text-sm font-semibold capitalize">{careerLevel}</p>
                </div>
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
                  {qualifications.map((q: any, index: number) => {
                    const qualName = typeof q === 'string' ? q : (q.qualifications?.name || q.name || 'Qualification');
                    return (
                      <span key={`qual-${index}`} className="px-2 py-0.5 bg-accent/10 text-accent text-[11px] font-bold rounded-md border border-accent/20">
                        {qualName}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground pt-2">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wide">Notice Period: {noticePeriod}</span>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {languages.slice(0, 3).map((l: any, index: number) => {
                    const name = l.languages?.name || (typeof l === 'string' ? l : l.name);
                    const level = l.proficiency_level || l.level || '';
                    return (
                      <span key={index} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100">
                        {name}{level ? ` (${formatLanguageLevel(level)})` : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Action */}
          <div className={`p-6 ${user.role !== 'guest' ? 'layout-xl:w-48 layout-xl:border-t-0 layout-xl:border-l' : 'layout-md:w-48 layout-md:border-t-0 layout-md:border-l'} flex flex-col justify-center items-center gap-3 bg-muted/5 border-t border-border`}>
            <Button
              onClick={() => {
                const path = user.role === 'guest' ? `/candidates/${candidate.id}` : `/employer/candidates/${candidate.id}`;
                navigate(path);
              }}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold h-11 shadow-lg shadow-primary/20"
            >
              View Profile
            </Button>
            
            <Button
              onClick={handleShortlist}
              variant={isShortlisted ? "default" : "outline"}
              className={`w-full font-bold h-11 ${isShortlisted ? 'bg-amber-500 hover:bg-amber-600 hover:text-white text-white' : 'border-amber-500/20 text-amber-600 hover:bg-amber-50 hover:text-amber-600'}`}
            >
              {isShortlisted ? 'Shortlisted' : 'Shortlist'}
            </Button>

            <div className="w-full h-px bg-border/50 my-1" />

            <Button
              onClick={handleAction}
              disabled={requestPending && !canContact}
              variant="outline"
              className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary font-bold h-11"
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
              className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:text-primary font-bold h-11"
            >
              <UserPlus className="w-4 h-4 mr-2" />
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

      <UpgradeModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        title={upgradeModalContent.title}
        description={upgradeModalContent.description}
      />
    </>
  );
};

export default CandidateCard;
