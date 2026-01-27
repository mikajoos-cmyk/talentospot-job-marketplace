import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import RichTextEditor from '../../components/ui/rich-text-editor';
import { MapPin, DollarSign, Briefcase, Calendar, ArrowLeft, Building2, Map } from 'lucide-react';
import { jobsService } from '../../services/jobs.service';
// import { employerService } from '../../services/employer.service';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { applicationsService } from '../../services/applications.service';
import { messagesService } from '../../services/messages.service';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
// import { Input } from '../../components/ui/input';

const JobDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, isAuthenticated } = useUser();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  React.useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await jobsService.getJobById(id);
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };
    const checkApplicationStatus = async () => {
      if (id && user?.id && user.role === 'candidate') {
        try {
          const applied = await applicationsService.hasApplied(id, user.id);
          setHasApplied(applied);
        } catch (error) {
          console.error('Error checking application status:', error);
        }
      }
    };

    fetchJob();
    checkApplicationStatus();
  }, [id, user?.id, user?.role]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      showToast({
        title: 'Authentication Required',
        description: 'Please log in as a candidate to apply for this job',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (user.role !== 'candidate') {
      showToast({
        title: 'Only Candidates Can Apply',
        description: 'Your account type does not allow job applications',
        variant: 'destructive',
      });
      return;
    }

    try {
      // 1. Submit Application
      await applicationsService.applyToJob({
        job_id: id!,
        candidate_id: user.id,
        employer_id: job.employer_id,
        cover_letter: coverLetter,
      });

      // 2. Notify Employer via Message
      try {
        // Find or create conversation with the employer
        // job.employer_profiles.id is the employer's profile ID (which is the user ID in this case)
        const conversation = await messagesService.getOrCreateConversation(user.id, job.employer_id);

        // Send notification message
        await messagesService.sendMessage(
          conversation.id,
          user.id,
          `I have applied for the position: **${job.title}**. You can review my application in your dashboard.`
        );
      } catch (msgError) {
        console.error('Error sending notification message:', msgError);
        // We don't fail the whole process if message fails, application is the most important
      }

      showToast({
        title: 'Application Submitted',
        description: `Your application for ${job?.title} has been submitted successfully`,
      });
      setApplyDialogOpen(false);
      setCoverLetter('');
      navigate('/candidate/applications');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      showToast({
        title: 'Application Failed',
        description: error.message || 'There was an error submitting your application. Please try again.',
        variant: 'destructive',
      });
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

  if (!job) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-h2 font-heading text-foreground mb-4">Job Not Found</h2>
          <Button onClick={() => navigate(-1)} className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal">
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Button>
          <div>
            <h1 className="text-h1 font-heading text-foreground">{job.title}</h1>
          </div>
        </div>

        <Card className="p-8 border border-border bg-card">
          <div
            className="flex items-start space-x-6 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              if (job.employer_id) navigate(`/companies/${job.employer_id}`);
            }}
          >
            <img
              src={job.employer_profiles?.logo_url || "https://via.placeholder.com/80"}
              alt={job.employer_profiles?.company_name}
              className="w-20 h-20 rounded-lg object-cover"
              loading="lazy"
            />
            <div className="flex-1">
              <h2 className="text-h2 font-heading text-foreground mb-2 hover:text-primary transition-colors">{job.employer_profiles?.company_name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center text-body text-foreground">
                  <MapPin className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{job.city}, {job.country}</span>
                </div>
                <div className="flex items-center text-body text-foreground">
                  <DollarSign className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max} ${job.salary_currency || 'EUR'}` : 'Competitive'}</span>
                </div>
                <div className="flex items-center text-body text-foreground">
                  <Briefcase className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{job.employment_type?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center text-body text-foreground">
                  <Calendar className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {job.entry_bonus && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-warning">Entry Bonus</span>
                <span className="text-h3 font-heading text-warning">€{job.entry_bonus.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-h3 font-heading text-foreground mb-4">Job Description</h3>
              <div
                className="text-body text-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.contract_duration && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-caption text-muted-foreground mb-1">Contract Duration</p>
                  <p className="text-body font-medium text-foreground">{job.contract_duration}</p>
                </div>
              )}
              {job.required_languages && job.required_languages.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-caption text-muted-foreground mb-1">Languages</p>
                  <p className="text-body font-medium text-foreground">{job.required_languages.join(', ')}</p>
                </div>
              )}
              {job.home_office_available !== undefined && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-caption text-muted-foreground mb-1">Home Office</p>
                  <p className="text-body font-medium text-foreground">{job.home_office_available ? 'Available' : 'Not Available'}</p>
                </div>
              )}
            </div>

            {job.required_qualifications && job.required_qualifications.length > 0 && (
              <div>
                <h3 className="text-h3 font-heading text-foreground mb-4">Required Qualifications</h3>
                <div className="flex flex-wrap gap-2">
                  {job.required_qualifications.map((qual: string) => (
                    <span
                      key={qual}
                      className="px-3 py-2 bg-accent/10 text-accent text-body-sm rounded-lg"
                    >
                      {qual}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-border space-y-6">
            <div>
              <h3 className="text-h3 font-heading text-foreground mb-4 flex items-center">
                <Map className="w-6 h-6 mr-2 text-primary" strokeWidth={1.5} />
                Location
              </h3>
              <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center border border-border">
                <div className="text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-primary" strokeWidth={1.5} />
                  <p className="text-body font-medium text-foreground">{job.city}, {job.country}</p>
                  <p className="text-caption text-muted-foreground">Interactive map view</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setApplyDialogOpen(true)}
              disabled={hasApplied}
              className={`w-full md:w-auto font-normal h-12 px-8 ${hasApplied
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary-hover'
                }`}
            >
              {hasApplied ? 'Already Applied' : 'Apply for this Position'}
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Apply for {job.title}</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Submit your application to {job.employer_profiles?.company_name}
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
              onClick={() => setApplyDialogOpen(false)}
              className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
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

export default JobDetailView;
