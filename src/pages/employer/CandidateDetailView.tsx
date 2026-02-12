import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/button';
import { MessageSquare, UserPlus, Heart, Star, Crown } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { ToastAction } from '../../components/ui/toast';
import { useToast } from '../../contexts/ToastContext';
import { toast } from '../../hooks/use-toast';
import { candidateService } from '../../services/candidate.service';
import { jobsService } from '../../services/jobs.service';
import { shortlistsService } from '../../services/shortlists.service';
import { analyticsService } from '../../services/analytics.service';
import ReviewModal from '../../components/shared/ReviewModal';
import { reviewsService } from '../../services/reviews.service';
import UpgradeModal from '../../components/shared/UpgradeModal';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { SharedCandidateProfile } from '../../components/shared/SharedCandidateProfile';
import UpgradeBanner from '../../components/shared/UpgradeBanner';

const CandidateDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { showToast } = useToast();
  const [candidate, setCandidate] = useState<any>(null);
  const [employerJobs, setEmployerJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalContent, setUpgradeModalContent] = useState({ title: '', description: '' });
  const [accessStatus, setAccessStatus] = useState<string>('none');
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [hasActivePackage, setHasActivePackage] = useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [candidateData, jobsData] = await Promise.all([
          candidateService.getCandidateProfile(id),
          (user.role === 'employer' && user.id) ? jobsService.getJobsByEmployer(user.id) : Promise.resolve([])
        ]);
        setCandidate(candidateData);
        setEmployerJobs(jobsData?.filter((j: any) => j.status === 'active') || []);

        if (user.role === 'employer' && user.profile?.id) {
          try {
            const { packagesService } = await import('../../services/packages.service');
            const canMessage = await packagesService.canSendMessages(user.id);
            setHasActivePackage(canMessage);
          } catch (e) {
            console.error("Error checking package", e);
            setHasActivePackage(false);
          }

          const status = await candidateService.checkDataAccess(id, user.profile.id);
          setAccessStatus(status);

          const shortlisted = await shortlistsService.isInShortlist(user.profile.id, id);
          setIsShortlisted(shortlisted);

          try {
            await analyticsService.recordView(user.id, id, 'candidate');
          } catch (analyticsError) {
            console.error('Failed to record profile view:', analyticsError);
          }
        }
      } catch (error) {
        console.error('Error fetching candidate detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user.id, user.role, user.profile?.id]);

  // Admins dürfen immer alles sehen – keine Verpixelung
  const adminOverride = user.role === 'admin';
  const isBlurred = adminOverride ? false : (accessStatus !== 'approved' || (!hasActivePackage && isShortlisted));
  const canContact = adminOverride ? true : (accessStatus === 'approved' && hasActivePackage);
  const displayName = isBlurred ? 'TalentoSPOT Candidate' : candidate?.name;

  const handleShortlist = async () => {
    if (!user?.profile?.id) return;
    try {
      if (isShortlisted) {
        await shortlistsService.removeFromShortlist(user.profile.id, id!);
        setIsShortlisted(false);
        showToast({ title: 'Removed from Shortlist', description: 'Candidate removed from shortlist' });
      } else {
        await shortlistsService.addToShortlist(user.profile.id, id!);
        setIsShortlisted(true);
        showToast({ title: 'Shortlisted', description: 'Candidate added to your shortlist' });
      }
    } catch (error) {
      console.error('Error updating shortlist:', error);
      showToast({ title: 'Error', description: 'Failed to update shortlist', variant: 'destructive' });
    }
  };

  const handleInvite = async (jobTitle: string) => {
    if (user.role === 'employer' && !hasActivePackage) {
      setUpgradeModalContent({
        title: 'Paket erforderlich',
        description: 'Sie benötigen ein aktives Paket, um Einladungen an Talente senden zu können.'
      });
      setUpgradeModalOpen(true);
      return;
    }
    
    try {
      const candidateName = candidate.name || 'candidate';
      
      // Find the job ID for the selected title
      const selectedJob = employerJobs.find(j => j.title === jobTitle);
      if (!selectedJob) {
        showToast({ title: 'Error', description: 'Job not found', variant: 'destructive' });
        return;
      }

      const { invitationsService } = await import('../../services/invitations.service');
      await invitationsService.sendInvitation({
        job_id: selectedJob.id,
        candidate_id: candidate.id,
        employer_id: user.profile.id,
        message: `We would like to invite you to apply for the position: ${jobTitle}`,
      });

      showToast({ title: 'Invitation Sent', description: `${displayName} has been invited to apply for ${jobTitle}` });
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      showToast({ title: 'Error', description: 'Failed to send invitation', variant: 'destructive' });
    }
  };

  const handleMessage = () => {
    if (user.role === 'employer' && !hasActivePackage) {
      setUpgradeModalContent({
        title: 'Paket erforderlich',
        description: 'Sie benötigen ein aktives Paket, um Nachrichten an Talente senden zu können.'
      });
      setUpgradeModalOpen(true);
      return;
    }
    const basePath = user.role === 'admin' ? '/admin/messages' : '/employer/messages';
    navigate(`${basePath}?conversationId=${candidate?.id}`);
  };

  const handleRequestData = async () => {
    if (!user.profile?.id) return;
    if (user.role === 'employer' && !hasActivePackage) {
      setUpgradeModalContent({
        title: 'Paket erforderlich',
        description: 'Sie benötigen ein aktives Paket, um Datenanfragen an Talente senden zu können.'
      });
      setUpgradeModalOpen(true);
      return;
    }
    try {
      const result = await candidateService.requestDataAccess(candidate.id, user.profile.id);
      if (result.status === 'exists') {
        showToast({ title: 'Info', description: 'Request already pending or processed.' });
      } else {
        showToast({ title: 'Request Sent', description: `Personal data request sent.` });
        setAccessStatus('pending');
      }
    } catch (e: any) {
      console.log('[DEBUG] Limit reached error caught in CandidateDetailView:', e);
      const errorMessage = e.message || 'Failed to request data.';
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
          variant: 'destructive'
        });
      }
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!id || !user?.id) return;
    try {
      await reviewsService.submitReview({
        reviewer_id: user.id,
        target_id: id,
        target_role: 'candidate',
        rating,
        comment
      });
      showToast({ title: 'Review Submitted', description: `Your review for ${displayName} has been submitted` });
      setReviewModalOpen(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast({ title: 'Error', description: 'Failed to submit review', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
        <AppLayout isPublic={user.role === 'guest'}>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        </AppLayout>
    );
  }

  if (!candidate) return <AppLayout><div className="text-center py-12">Candidate Not Found</div></AppLayout>;

  // Action Buttons Component
  const ActionButtons = () => {
    if (user.role === 'guest') {
      return (
          <Button size="sm" onClick={() => navigate('/login')} className="bg-primary text-primary-foreground">
            Log In to Connect
          </Button>
      );
    }

    return (
        <>
          <Button
              onClick={handleShortlist}
              variant={isShortlisted ? 'default' : 'outline'}
              className={isShortlisted ? 'bg-primary text-primary-foreground' : 'bg-transparent text-foreground border-border'}
          >
            <Heart className="w-4 h-4 mr-2" strokeWidth={1.5} fill={isShortlisted ? 'currentColor' : 'none'} />
            {isShortlisted ? 'Shortlisted' : 'Shortlist'}
          </Button>

          <Button 
            onClick={handleMessage} 
            variant="outline"
            className="bg-transparent text-foreground border-border"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {adminOverride ? 'Message' : (!isBlurred && candidate?.name ? `Message ${candidate.name.split(' ')[0]}` : 'Message')}
          </Button>

          <Button onClick={() => setInviteDialogOpen(true)} variant="outline">
            <UserPlus className="w-4 h-4 mr-2" /> Invite
          </Button>

          {(canContact || (accessStatus === 'approved')) && (
              <>
                <Button onClick={() => setReviewModalOpen(true)} variant="outline" className="text-accent border-accent hover:bg-accent/10">
                  <Star className="w-4 h-4 mr-2" /> Review
                </Button>
              </>
          )}

          {!canContact && accessStatus !== 'approved' && (
              <Button
                  onClick={handleRequestData}
                  disabled={['pending', 'rejected', 'approved'].includes(accessStatus)}
                  className="bg-primary text-primary-foreground"
              >
                {accessStatus === 'pending' ? 'Request Pending' : accessStatus === 'rejected' ? 'Request Rejected' : 'Request Personal Data'}
              </Button>
          )}
        </>
    );
  };

  return (
      <AppLayout isPublic={user.role === 'guest'}>
        <SharedCandidateProfile
            data={candidate}
            user={{
              name: candidate.name,
              email: candidate.email,
              avatar: candidate.avatar
            }}
            isBlurred={isBlurred}
            isOwnProfile={false}
            actions={<ActionButtons />}
            onBack={() => navigate(user.role === 'guest' ? '/candidates' : '/employer/candidates')}
            bannerBelowHeader={
              !adminOverride && isBlurred ? (
                <UpgradeBanner
                  message="Sie benötigen ein Paket und/oder eine Freigabe, um die Kontaktdaten dieses Talents sehen zu können."
                  upgradeLink="/employer/packages"
                />
              ) : null
            }
        />

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invite to Apply</DialogTitle>
              <DialogDescription>Select a job to invite {displayName} to apply</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
              {employerJobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No active jobs available. Post a job first to invite candidates.
                </p>
              ) : (
                employerJobs.map((job: any) => (
                  <div key={job.id} className="p-4 border border-border rounded-lg hover:bg-muted cursor-pointer" onClick={() => handleInvite(job.title)}>
                    <h4 className="font-medium">{job.title}</h4>
                    <p className="text-sm text-muted-foreground">{job.city}</p>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        <ReviewModal
            open={reviewModalOpen}
            onOpenChange={setReviewModalOpen}
            targetName={displayName}
            targetRole="candidate"
            onSubmit={handleSubmitReview}
        />

        <UpgradeModal
            open={upgradeModalOpen}
            onOpenChange={setUpgradeModalOpen}
            title={upgradeModalContent.title}
            description={upgradeModalContent.description}
        />
      </AppLayout>
  );
};

export default CandidateDetailView;