import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { MapPin, DollarSign, Briefcase, Search, Bookmark, Building2, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';
import { jobsService } from '@/services/jobs.service';
import { applicationsService } from '@/services/applications.service';
import { savedJobsService } from '@/services/saved-jobs.service';
import { candidateService } from '@/services/candidate.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const JobSearch: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadJobs();
    if (user.role === 'candidate') {
      loadSavedJobs();
    }
  }, [user.role]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsService.searchJobs({});
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSavedJobs = async () => {
    try {
      if (!user.profile?.id) return;
      const saved = await savedJobsService.getSavedJobs(user.profile.id);
      setSavedJobs(saved.map((s: any) => s.job_id));
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  };

  const handleSaveJob = async (jobId: string) => {
    if (user.role !== 'candidate') {
      showToast({
        title: 'Error',
        description: 'Only candidates can save jobs',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (!user.profile?.id) {
        const candidateProfile = await candidateService.getCandidateProfile(user.id);
        user.profile = candidateProfile;
      }

      if (savedJobs.includes(jobId)) {
        await savedJobsService.unsaveJob(user.profile.id, jobId);
        setSavedJobs(savedJobs.filter(id => id !== jobId));
        showToast({ title: 'Job removed from saved' });
      } else {
        await savedJobsService.saveJob(user.profile.id, jobId);
        setSavedJobs([...savedJobs, jobId]);
        showToast({ title: 'Job saved successfully' });
      }
    } catch (error: any) {
      showToast({
        title: 'Error',
        description: error?.message || 'Failed to save job',
        variant: 'destructive',
      });
    }
  };

  const handleApply = (job: any) => {
    if (user.role !== 'candidate') {
      showToast({
        title: 'Error',
        description: 'Only candidates can apply to jobs',
        variant: 'destructive',
      });
      return;
    }
    setSelectedJob(job);
    setApplyDialogOpen(true);
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

    try {
      setApplying(true);
      if (!user.profile?.id) {
        const candidateProfile = await candidateService.getCandidateProfile(user.id);
        user.profile = candidateProfile;
      }

      await applicationsService.applyToJob({
        job_id: selectedJob.id,
        candidate_id: user.profile.id,
        employer_id: selectedJob.employer_id,
        cover_letter: coverLetter,
      });

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

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.employer_profiles?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Find Jobs</h1>
          <p className="text-body text-muted-foreground">
            Discover opportunities that match your skills and interests.
          </p>
        </div>

        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          <Input
            type="search"
            placeholder="Search by job title or company..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-background text-foreground border-border"
          />
        </div>

        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <p className="text-body text-foreground mb-6">
                <span className="font-medium">{filteredJobs.length}</span> jobs found
              </p>

              {filteredJobs.length === 0 ? (
                <Card className="p-12 border border-border bg-card text-center">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-h3 font-heading text-foreground mb-2">No jobs found</h3>
                  <p className="text-body text-muted-foreground">
                    Try adjusting your search criteria or check back later for new opportunities.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.map((job) => (
                    <Card key={job.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div
                            className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/companies/${job.employer_id}`);
                            }}
                          >
                            {job.employer_profiles?.logo_url ? (
                              <img
                                src={job.employer_profiles.logo_url}
                                alt={job.employer_profiles.company_name}
                                className="w-full h-full rounded-lg object-cover"
                              />
                            ) : (
                              <Building2 className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveJob(job.id)}
                            className={`bg-transparent hover:bg-muted ${savedJobs.includes(job.id) ? 'text-accent' : 'text-muted-foreground'
                              } hover:text-foreground`}
                            aria-label={savedJobs.includes(job.id) ? 'Remove from saved' : 'Save job'}
                          >
                            <Bookmark className="w-5 h-5" strokeWidth={1.5} fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} />
                          </Button>
                        </div>

                        <div>
                          <h3 className="text-h4 font-heading text-foreground mb-1">{job.title}</h3>
                          <p
                            className="text-body-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/companies/${job.employer_id}`);
                            }}
                          >
                            {job.employer_profiles?.company_name || 'Company'}
                          </p>
                        </div>

                        <p className="text-body-sm text-foreground line-clamp-2">
                          {job.description?.replace(/<[^>]*>/g, '').substring(0, 150) || 'No description available'}
                        </p>

                        <div className="space-y-2">
                          <div className="flex items-center text-body-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            <span>{job.city || job.country || 'Remote'}</span>
                          </div>
                          {(job.salary_min || job.salary_max) && (
                            <div className="flex items-center text-body-sm text-muted-foreground">
                              <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
                              <span>
                                {job.salary_min && job.salary_max
                                  ? `${job.salary_currency || 'EUR'} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
                                  : job.salary_min
                                    ? `${job.salary_currency || 'EUR'} ${job.salary_min.toLocaleString()}+`
                                    : `${job.salary_currency || 'EUR'} ${job.salary_max.toLocaleString()}`}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center text-body-sm text-muted-foreground">
                            <Briefcase className="w-4 h-4 mr-2" strokeWidth={1.5} />
                            <span className="capitalize">{job.employment_type?.replace(/_/g, ' ') || 'Full Time'}</span>
                          </div>
                        </div>

                        {job.entry_bonus && job.entry_bonus > 0 && (
                          <div className="bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
                            <span className="text-body-sm font-medium text-warning">
                              Entry Bonus: {job.salary_currency || 'EUR'} {job.entry_bonus.toLocaleString()}
                            </span>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            variant="outline"
                            className="flex-1 bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                          >
                            View Details
                          </Button>
                          <Button
                            onClick={() => handleApply(job)}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                            disabled={user.role !== 'candidate'}
                          >
                            Apply Now
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Submit your application to {selectedJob?.employer_profiles?.company_name || 'this company'}
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
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setApplyDialogOpen(false);
                setCoverLetter('');
              }}
              disabled={applying}
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
    </AppLayout >
  );
};

export default JobSearch;
