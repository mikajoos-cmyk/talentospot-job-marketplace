import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import RichTextEditor from '../../components/ui/rich-text-editor';
import { MapPin, DollarSign, Briefcase, Trash2, Building2, Eye, Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { savedJobsService } from '../../services/saved-jobs.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

const SavedJobs: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useUser();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  React.useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await savedJobsService.getSavedJobs(user.id);
        setSavedJobs(data);
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, [user?.id]);

  const handleRemove = (jobTitle: string) => {
    showToast({
      title: 'Job Removed',
      description: `${jobTitle} has been removed from saved jobs`,
    });
  };

  const handleApply = (job: any) => {
    setSelectedJob(job);
    setApplyDialogOpen(true);
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
      description: `Your application for ${selectedJob?.title} has been submitted`,
    });
    setApplyDialogOpen(false);
    setCoverLetter('');
    setSelectedJob(null);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Saved Jobs</h1>
          <p className="text-body text-muted-foreground">
            Jobs you've bookmarked for later review.
          </p>
        </div>

        <div>
          <p className="text-body text-foreground mb-6">
            <span className="font-medium">{savedJobs.length}</span> saved jobs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((job) => (
              <Card key={job.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <img
                      src={job.jobs?.employer_profiles?.logo_url || "https://via.placeholder.com/48"}
                      alt={job.jobs?.employer_profiles?.company_name}
                      className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      loading="lazy"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (job.jobs?.employer_id) navigate(`/companies/${job.jobs.employer_id}`);
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(job.jobs?.title)}
                      className="bg-transparent text-error hover:bg-error/10 hover:text-error"
                      aria-label="Remove from saved"
                    >
                      <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-h4 font-heading text-foreground mb-1">{job.jobs?.title}</h3>
                    <p
                      className="text-body-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (job.jobs?.employer_id) navigate(`/companies/${job.jobs.employer_id}`);
                      }}
                    >
                      {job.jobs?.employer_profiles?.company_name}
                    </p>
                  </div>

                  <p className="text-body-sm text-foreground line-clamp-2">
                    {job.jobs?.description?.replace(/<[^>]*>/g, '') || 'No description available'}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      <span>{job.jobs?.city}, {job.jobs?.country}</span>
                    </div>
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      <span>{job.jobs?.salary_min && job.jobs?.salary_max ? `${job.jobs.salary_min} - ${job.jobs.salary_max} ${job.jobs.salary_currency || 'EUR'}` : 'Competitive'}</span>
                    </div>
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <Briefcase className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      <span className="capitalize">{job.jobs?.employment_type?.replace(/_/g, ' ') || 'Full Time'}</span>
                    </div>
                  </div>

                  {job.jobs?.entry_bonus && job.jobs.entry_bonus > 0 && (
                    <div className="bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
                      <span className="text-body-sm font-medium text-warning">
                        Entry Bonus: {job.jobs.salary_currency || 'EUR'} {job.jobs.entry_bonus.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => navigate(`/jobs/${job.job_id}`)}
                      variant="outline"
                      className="flex-1 bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                    >
                      <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleApply(job.jobs)}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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

export default SavedJobs;
