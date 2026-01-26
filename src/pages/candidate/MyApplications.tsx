import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import RichTextEditor from '../../components/ui/rich-text-editor';
import { MapPin, DollarSign, Calendar, MessageSquare, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { applicationsService } from '../../services/applications.service';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';


const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useUser();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await applicationsService.getApplicationsByCandidate(user.id);
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [user?.id]);

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
          <h1 className="text-h1 font-heading text-foreground mb-2">My Applications</h1>
          <p className="text-body text-muted-foreground">
            Track the status of your job applications.
          </p>
        </div>

        <div>
          <p className="text-body text-foreground mb-6">
            <span className="font-medium">{applications.length}</span> applications
          </p>

          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="p-6 border border-border bg-card hover:shadow-md transition-all duration-normal">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <img
                      src={application.jobs?.employer_profiles?.logo_url || "https://via.placeholder.com/64"}
                      alt={application.jobs?.employer_profiles?.company_name}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-h4 font-heading text-foreground mb-1">{application.jobs?.title}</h3>
                      <p className="text-body-sm text-muted-foreground mb-3">{application.jobs?.employer_profiles?.company_name}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex items-center text-body-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          <span>{application.jobs?.city}, {application.jobs?.country}</span>
                        </div>
                        <div className="flex items-center text-body-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          <span>{application.jobs?.salary_min && application.jobs?.salary_max ? `${application.jobs.salary_min} - ${application.jobs.salary_max} ${application.jobs.salary_currency || 'EUR'}` : 'Competitive'}</span>
                        </div>
                        <div className="flex items-center text-body-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          <span>Applied {new Date(application.applied_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-caption font-medium border ${application.status === 'pending' ? 'bg-warning/10 text-warning border-warning/30' :
                      application.status === 'interview' ? 'bg-info/10 text-info border-info/30' :
                        application.status === 'rejected' ? 'bg-error/10 text-error border-error/30' :
                          application.status === 'accepted' ? 'bg-success/10 text-success border-success/30' :
                            'bg-muted text-muted-foreground'
                      }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    {(application.status === 'interview' || application.status === 'accepted') && (
                      <Button
                        size="sm"
                        onClick={() => navigate(`/candidate/messages?conversationId=${application.id}`)}
                        className="bg-info text-info-foreground hover:bg-info/90 font-normal"
                      >
                        <MessageSquare className="w-4 h-4 mr-1" strokeWidth={1.5} />
                        Message
                      </Button>
                    )}
                    <Button
                      onClick={() => navigate(`/jobs/${application.job_id}`)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-h3 font-heading text-foreground">Apply for {selectedJob?.title}</DialogTitle>
              <DialogDescription className="text-body text-muted-foreground">
                Submit your application to {selectedJob?.company}
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
                onClick={() => {
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
                    description: `Your application for ${selectedJob?.title} has been submitted`,
                  });
                  setApplyDialogOpen(false);
                  setCoverLetter('');
                  setSelectedJob(null);
                }}
                disabled={!coverLetter.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
              >
                Submit Application
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default MyApplications;
