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
import { applicationsService } from '../../services/applications.service';
import { candidateService } from '../../services/candidate.service';
import { packagesService } from '../../services/packages.service';
import BlurredContent from '../../components/shared/BlurredContent';
import UpgradeBanner from '../../components/shared/UpgradeBanner';
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
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [applying, setApplying] = useState(false);
  const [hasActivePackage, setHasActivePackage] = useState(false);

  React.useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [savedData, appsData, hasPackage] = await Promise.all([
          savedJobsService.getSavedJobs(user.id),
          loadAppliedJobIds(user.id),
          packagesService.canViewSavedJobsDetails(user.id)
        ]);
        setSavedJobs(savedData);
        setAppliedJobIds(appsData);
        setHasActivePackage(hasPackage);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, [user?.id]);

  const loadAppliedJobIds = async (userId: string) => {
    try {
      let profileId = user.profile?.id;
      if (!profileId) {
        const profile = await candidateService.getCandidateProfile(userId);
        profileId = profile?.id;
      }
      if (profileId) {
        const apps = await applicationsService.getApplicationsByCandidate(profileId);
        return apps.map((a: any) => a.job_id);
      }
    } catch (e) {
      console.error('Error loading applied jobs:', e);
    }
    return [];
  };

  const handleRemove = (jobTitle: string) => {
    showToast({
      title: 'Job Removed',
      description: `${jobTitle} has been removed from saved jobs`,
    });
  };

  const handleApply = (job: any) => {
    if (!hasActivePackage) {
      navigate('/candidate/packages');
      return;
    }
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

  const handleSubmitApplication = async () => {
    if (!coverLetter.trim()) {
      showToast({
        title: 'Error',
        description: 'Please write a cover letter',
        variant: 'destructive',
      });
      return;
    }

    try {
      setApplying(true);
      let profileId = user.profile?.id;
      if (!profileId) {
        const profile = await candidateService.getCandidateProfile(user.id);
        if (!profile) throw new Error('Candidate profile not found');
        profileId = profile.id;
      }

      await applicationsService.applyToJob({
        job_id: selectedJob.id,
        candidate_id: profileId,
        employer_id: selectedJob.employer_id,
        cover_letter: coverLetter,
      });

      setAppliedJobIds([...appliedJobIds, selectedJob.id]);
      showToast({
        title: 'Application Submitted',
        description: `Your application for ${selectedJob?.title} has been submitted`,
      });
      setApplyDialogOpen(false);
      setCoverLetter('');
      setSelectedJob(null);
    } catch (error: any) {
      showToast({
        title: 'Error',
        description: error?.message || 'Failed to submit application',
        variant: 'destructive',
      });
    } finally {
      setApplying(false);
    }
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
          {/* Hinweis-Banner oben, wenn Paket fehlt */}
          {!hasActivePackage && (
            <UpgradeBanner
              message="Sie benötigen ein Paket, um Kontaktdaten und vollständige Jobdetails sehen zu können."
              upgradeLink="/candidate/packages"
            />
          )}

          <p className="text-body text-foreground mb-6">
            <span className="font-medium">{savedJobs.length}</span> saved jobs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((job) => {
              const cardContent = (
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={!hasActivePackage ? 'blur-sm select-none' : ''}>
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
                      </div>
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
                        className={`text-body-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors ${!hasActivePackage ? 'blur-sm select-none' : ''}`}
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

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => navigate(`/jobs/${job.job_id}`)}
                      variant="outline"
                      className="flex-1 min-w-[120px] bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                    >
                      <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleApply(job.jobs)}
                      className={`flex-1 min-w-[120px] font-normal ${appliedJobIds.includes(job.job_id)
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary text-primary-foreground hover:bg-primary-hover'
                        }`}
                      disabled={appliedJobIds.includes(job.job_id)}
                    >
                      {appliedJobIds.includes(job.job_id) ? 'Already Applied' : 'Apply Now'}
                    </Button>
                  </div>
                </div>
              );

              return (
                <Card key={job.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
                  {cardContent}
                </Card>
              );
            })}
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
              disabled={!coverLetter.trim() || applying}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SavedJobs;
