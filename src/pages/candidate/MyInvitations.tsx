import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import RichTextEditor from '../../components/ui/rich-text-editor';
import { Calendar, Building2, Briefcase, Check, X, Loader2, UserCheck, Eye } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { invitationsService } from '../../services/invitations.service';
import { applicationsService } from '../../services/applications.service';
import { candidateService } from '../../services/candidate.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const MyInvitations: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useUser();
  const [invitations, setInvitations] = useState<any[]>([]);
  const [dataRequests, setDataRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  React.useEffect(() => {
    const fetchAll = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [invData, reqData] = await Promise.all([
          invitationsService.getInvitationsByCandidate(user.id),
          candidateService.getDataAccessRequests(user.id)
        ]);

        setInvitations(invData.filter((inv: any) => inv.status === 'pending'));
        setDataRequests(reqData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user?.id]);

  const handleAccept = (invitation: any) => {
    setSelectedInvitation(invitation);
    setApplyDialogOpen(true);
  };

  const handleDecline = async (invitationId: string, jobTitle: string) => {
    try {
      await invitationsService.respondToInvitation(invitationId, 'declined');
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      showToast({
        title: 'Invitation Declined',
        description: `You declined the invitation for ${jobTitle}`,
      });
    } catch (error) {
      console.error('Error declining invitation:', error);
      showToast({
        title: 'Error',
        description: 'Failed to decline invitation.',
        variant: 'destructive',
      });
    }
  };

  const handleRequestResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await candidateService.respondToDataAccessRequest(requestId, status);
      setDataRequests(dataRequests.filter(r => r.id !== requestId));
      showToast({
        title: status === 'accepted' ? 'Request Accepted' : 'Request Declined',
        description: status === 'accepted' ? 'Employer can now view your full profile.' : 'Request declined.',
      });
    } catch (e) {
      console.error(e);
      showToast({ title: 'Error', description: 'Failed to update request.', variant: 'destructive' });
    }
  };

  const handleSubmitApplication = async () => {
    if (!coverLetter.trim()) {
      showToast({
        title: 'Error',
        description: 'Please write a cover letter',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedInvitation || !user?.id) return;

    try {
      setLoading(true);

      // 1. Submit Application
      await applicationsService.applyToJob({
        job_id: selectedInvitation.job_id,
        candidate_id: user.id,
        employer_id: selectedInvitation.employer_id || selectedInvitation.jobs?.employer_id,
        cover_letter: coverLetter,
      });

      // 2. The invitation is already marked as 'accepted' by applyToJob service
      // But we still need to update the local state
      setInvitations(invitations.filter(inv => inv.id !== selectedInvitation.id));

      showToast({
        title: 'Application Submitted',
        description: `Your application for ${selectedInvitation?.jobs?.title} has been submitted`,
      });

      setApplyDialogOpen(false);
      setCoverLetter('');
      setSelectedInvitation(null);
      navigate('/candidate/applications');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      showToast({
        title: 'Application Failed',
        description: error.message || 'There was an error submitting your application.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">My Invitations & Requests</h1>
          <p className="text-body text-muted-foreground">
            Manage job invitations and profile access requests.
          </p>
        </div>

        <Tabs defaultValue="invitations" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="invitations" className="relative">
              Job Invitations
              {invitations.length > 0 && <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 text-xs">{invitations.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Data Requests
              {dataRequests.length > 0 && <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 text-xs">{dataRequests.length}</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invitations">
            {invitations.length === 0 ? (
              <Card className="p-12 border border-border bg-card text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground mb-2">No Invitations Yet</h3>
                <p className="text-body text-muted-foreground mb-6">
                  When companies invite you to apply, they'll appear here.
                </p>
                <Button
                  onClick={() => navigate('/candidate/jobs')}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                >
                  Browse Jobs
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <Card key={invitation.id} className="p-6 border border-border bg-card hover:shadow-md transition-all duration-normal">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <img
                          src={invitation.jobs?.employer_profiles?.logo_url || "https://via.placeholder.com/64"}
                          alt={invitation.jobs?.employer_profiles?.company_name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-caption rounded-md">
                              Invitation
                            </span>
                          </div>
                          <h3
                            className="text-h4 font-heading text-foreground mb-1 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => navigate(`/jobs/${invitation.job_id}`)}
                          >
                            {invitation.jobs?.title}
                          </h3>
                          <p className="text-body-sm text-muted-foreground mb-3">{invitation.jobs?.employer_profiles?.company_name}</p>

                          {invitation.message && (
                            <p className="text-body-sm text-foreground mb-3 italic">
                              "{invitation.message}"
                            </p>
                          )}

                          <div className="flex items-center text-caption text-muted-foreground">
                            <Calendar className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            <span>Invited {invitation.sent_at ? new Date(invitation.sent_at).toLocaleDateString() : (invitation.created_at ? new Date(invitation.created_at).toLocaleDateString() : 'Date N/A')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => handleAccept(invitation)}
                          className="bg-success text-success-foreground hover:bg-success/90 font-normal"
                        >
                          <Check className="w-4 h-4 mr-2" strokeWidth={2} />
                          Accept & Apply
                        </Button>
                        <Button
                          onClick={() => handleDecline(invitation.id, invitation.jobs?.title)}
                          variant="outline"
                          className="bg-transparent text-error border-error hover:bg-error/10 hover:text-error font-normal"
                        >
                          <X className="w-4 h-4 mr-2" strokeWidth={2} />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            {dataRequests.length === 0 ? (
              <Card className="p-12 border border-border bg-card text-center">
                <UserCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" strokeWidth={1.5} />
                <h3 className="text-h3 font-heading text-foreground mb-2">No Pending Requests</h3>
                <p className="text-body text-muted-foreground mb-6">
                  Requests from employers to view your full profile will appear here.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {dataRequests.map((req) => (
                  <Card key={req.id} className="p-6 border border-border bg-card">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start space-x-4 flex-1">
                        <img
                          src={req.employer?.logo_url || "https://via.placeholder.com/64"}
                          alt={req.employer?.company_name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                          <h3 className="text-h4 font-heading text-foreground mb-1">{req.employer?.company_name}</h3>
                          <p className="text-body-sm text-muted-foreground mb-2">wants to view your full profile (contact info, name, photos).</p>
                          <p className="text-caption text-muted-foreground">Requested on {new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          onClick={() => handleRequestResponse(req.id, 'accepted')}
                          className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                        >
                          <Check className="w-4 h-4 mr-2" strokeWidth={2} />
                          Allow Access
                        </Button>
                        <Button
                          onClick={() => handleRequestResponse(req.id, 'rejected')}
                          variant="outline"
                          className="bg-transparent text-error border-error hover:bg-error hover:text-error-foreground font-normal"
                        >
                          <X className="w-4 h-4 mr-2" strokeWidth={2} />
                          Decline
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigate(`/companies/${req.employer?.id}`)} // Assuming company profile route
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Company
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Apply for {selectedInvitation?.jobs?.title}</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Submit your application to {selectedInvitation?.employer_profiles?.company_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="coverLetter" className="text-body-sm font-medium text-foreground mb-2 block">
                Cover Letter <span className="text-error">*</span>
              </Label>
              <RichTextEditor
                value={coverLetter}
                onChange={setCoverLetter}
                placeholder="Tell us why you're a great fit for this role..."
                minHeight="200px"
              />
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Attach CV
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-body-sm text-foreground">Click to upload your CV</p>
                <p className="text-caption text-muted-foreground">PDF, DOC up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setApplyDialogOpen(false);
                setCoverLetter('');
              }}
              className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={!coverLetter.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              Submit Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default MyInvitations;
