import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar, Building2, Briefcase, Check, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { mockInvitations } from '@/data/mockInvitations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const MyInvitations: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [invitations, setInvitations] = useState(mockInvitations.filter(inv => inv.status === 'pending'));
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<typeof mockInvitations[0] | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  const handleAccept = (invitation: typeof mockInvitations[0]) => {
    setSelectedInvitation(invitation);
    setApplyDialogOpen(true);
  };

  const handleDecline = (invitationId: string, jobTitle: string) => {
    setInvitations(invitations.filter(inv => inv.id !== invitationId));
    showToast({
      title: 'Invitation Declined',
      description: `You declined the invitation for ${jobTitle}`,
    });
  };

  const handleSubmitApplication = () => {
    if (!coverLetter.trim()) {
      showToast({
        title: 'Error',
        description: 'Please write a cover letter',
        variant: 'destructive',
      });
      return;
    }

    showToast({
      title: 'Application Submitted',
      description: `Your application for ${selectedInvitation?.jobTitle} has been submitted`,
    });
    
    if (selectedInvitation) {
      setInvitations(invitations.filter(inv => inv.id !== selectedInvitation.id));
    }
    
    setApplyDialogOpen(false);
    setCoverLetter('');
    setSelectedInvitation(null);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">My Invitations</h1>
          <p className="text-body text-muted-foreground">
            Companies have invited you to apply for these positions.
          </p>
        </div>

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
          <div>
            <p className="text-body text-foreground mb-6">
              <span className="font-medium">{invitations.length}</span> pending invitations
            </p>

            <div className="space-y-4">
              {invitations.map((invitation) => (
                <Card key={invitation.id} className="p-6 border border-border bg-card hover:shadow-md transition-all duration-normal">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={invitation.companyLogo}
                        alt={invitation.companyName}
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
                          onClick={() => navigate(`/jobs/${invitation.jobId}`)}
                        >
                          {invitation.jobTitle}
                        </h3>
                        <p className="text-body-sm text-muted-foreground mb-3">{invitation.companyName}</p>
                        
                        {invitation.message && (
                          <p className="text-body-sm text-foreground mb-3 italic">
                            "{invitation.message}"
                          </p>
                        )}

                        <div className="flex items-center text-caption text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          <span>Invited {new Date(invitation.sentDate).toLocaleDateString()}</span>
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
                        onClick={() => handleDecline(invitation.id, invitation.jobTitle)}
                        variant="outline"
                        className="bg-transparent text-error border-error hover:bg-error hover:text-error-foreground font-normal"
                      >
                        <X className="w-4 h-4 mr-2" strokeWidth={2} />
                        Decline
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Apply for {selectedInvitation?.jobTitle}</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Submit your application to {selectedInvitation?.companyName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="coverLetter" className="text-body-sm font-medium text-foreground mb-2 block">
                Cover Letter <span className="text-error">*</span>
              </Label>
              <textarea
                id="coverLetter"
                placeholder="Tell us why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full min-h-[200px] px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
