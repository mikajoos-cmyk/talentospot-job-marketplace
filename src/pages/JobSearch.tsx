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
import JobFilters, { JobFiltersState } from '@/components/candidate/JobFilters';
import { calculateJobMatchScore } from '@/utils/match-utils';

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
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [applying, setApplying] = useState(false);

  const [filters, setFilters] = useState<JobFiltersState>(() => {
    const savedFilters = sessionStorage.getItem('job_search_filters');
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters);
      } catch (e) {
        console.error('Error parsing saved filters:', e);
      }
    }
    return {
      title: '',
      continent: '',
      country: '',
      city: '',
      employmentTypes: [],
      salaryRange: [0, 250000],
      minEntryBonus: 0,
      contractDuration: '',
      skills: [],
      qualifications: [],
      languages: [],
      careerLevel: '',
      experienceYears: null,
      drivingLicenses: [],
      contractTerms: [],
      homeOffice: false,
      enableFlexibleMatch: false,
      enablePartialMatch: false,
      minMatchThreshold: 50,
    };
  });

  useEffect(() => {
    sessionStorage.setItem('job_search_filters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    loadJobs();
    if (user.role === 'candidate') {
      loadSavedJobs();
      loadAppliedJobs();
    }
  }, [user.role, user.id]);

  const loadJobs = async (currentFilters: JobFiltersState = filters) => {
    try {
      setLoading(true);
      const searchParams: any = {};

      // Only apply exact filters if neither flexible nor partial matching is enabled
      const useClientSideFiltering = currentFilters.enableFlexibleMatch || currentFilters.enablePartialMatch;

      if (!useClientSideFiltering) {
        if (currentFilters.title) searchParams.title = currentFilters.title;
        if (currentFilters.continent && currentFilters.continent !== 'all') searchParams.continent = currentFilters.continent;
        if (currentFilters.country && currentFilters.country !== 'all') searchParams.country = currentFilters.country;
        if (currentFilters.city && currentFilters.city !== 'all') searchParams.city = currentFilters.city;
        if (currentFilters.employmentTypes.length > 0) searchParams.employment_type = currentFilters.employmentTypes;
        if (currentFilters.salaryRange[0] > 0) searchParams.min_salary = currentFilters.salaryRange[0];
        if (currentFilters.salaryRange[1] < 250000) searchParams.max_salary = currentFilters.salaryRange[1];
        if (currentFilters.minEntryBonus > 0) searchParams.min_entry_bonus = currentFilters.minEntryBonus;
        if (currentFilters.contractDuration) searchParams.contract_duration = currentFilters.contractDuration;
        if (currentFilters.skills.length > 0) searchParams.required_skills = currentFilters.skills;
        if (currentFilters.qualifications.length > 0) searchParams.required_qualifications = currentFilters.qualifications;
        if (currentFilters.languages.length > 0) searchParams.required_languages = currentFilters.languages;
        if (currentFilters.careerLevel && currentFilters.careerLevel !== 'all') searchParams.career_level = currentFilters.careerLevel;
        if (currentFilters.experienceYears !== null) searchParams.experience_years = currentFilters.experienceYears;
        if (currentFilters.drivingLicenses && currentFilters.drivingLicenses.length > 0) searchParams.driving_licenses = currentFilters.drivingLicenses;
        if (currentFilters.contractTerms && currentFilters.contractTerms.length > 0) searchParams.contract_terms = currentFilters.contractTerms;
        if (currentFilters.homeOffice) searchParams.home_office_available = true;
      }

      const data = await jobsService.searchJobs(searchParams);
      let results = data || [];

      // Apply client-side filtering/scoring if needed
      if (useClientSideFiltering) {
        const flexibleMode = currentFilters.enableFlexibleMatch;

        results = results.map(job => ({
          ...job,
          matchScore: calculateJobMatchScore(job, currentFilters, flexibleMode)
        }));

        // Filter by threshold only if partial matching is enabled
        if (currentFilters.enablePartialMatch) {
          results = results.filter(job => job.matchScore >= currentFilters.minMatchThreshold);
        }

        // Sort by match score
        results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      }

      setJobs(results);
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

  useEffect(() => {
    loadJobs();
  }, [filters]);

  const handleMatchProfile = async () => {
    if (user.role !== 'candidate') {
      showToast({
        title: 'Not Available',
        description: 'Profile matching is only available for candidates.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let profile = user.profile;
      if (!profile) {
        profile = await candidateService.getCandidateProfile(user.id);
      }

      if (!profile) {
        showToast({
          title: 'Profile Missing',
          description: 'Please complete your profile to use this feature.',
          variant: 'destructive',
        });
        return;
      }

      // Map profile fields to filters
      const matchedFilters: JobFiltersState = {
        title: profile.title || '',
        continent: profile.preferredLocations?.[0]?.continent || '',
        country: profile.preferredLocations?.[0]?.country || '',
        city: profile.preferredLocations?.[0]?.city || '',
        employmentTypes: profile.jobTypes || [],
        salaryRange: [profile.salary?.min || 0, 250000],
        minEntryBonus: profile.conditions?.entryBonus || 0,
        contractDuration: '',
        skills: (profile.skills || []).map((s: any) => s.name),
        qualifications: profile.qualifications || [],
        languages: (profile.languages || []).map((l: any) => l.name),
        careerLevel: profile.careerLevel || '',
        experienceYears: typeof profile.yearsOfExperience === 'number' ? profile.yearsOfExperience : null,
        drivingLicenses: profile.drivingLicenses || [],
        contractTerms: profile.contractTermPreference || [],
        homeOffice: profile.homeOfficePreference && profile.homeOfficePreference !== 'none' ? true : false,
        enableFlexibleMatch: filters.enableFlexibleMatch,
        enablePartialMatch: filters.enablePartialMatch,
        minMatchThreshold: filters.minMatchThreshold,
      };

      setFilters(matchedFilters);
      showToast({
        title: 'Profile Matched',
        description: 'Filters have been updated based on your profile settings.',
      });
    } catch (error) {
      console.error('Error matching profile:', error);
      showToast({
        title: 'Error',
        description: 'Failed to match profile settings.',
        variant: 'destructive',
      });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      title: '',
      continent: '',
      country: '',
      city: '',
      employmentTypes: [],
      salaryRange: [0, 250000],
      minEntryBonus: 0,
      contractDuration: '',
      skills: [],
      qualifications: [],
      languages: [],
      careerLevel: '',
      experienceYears: null,
      drivingLicenses: [],
      contractTerms: [],
      homeOffice: false,
      enableFlexibleMatch: false,
      enablePartialMatch: false,
      minMatchThreshold: 50,
    });
    setSearchQuery('');
  };

  const loadAppliedJobs = async () => {
    try {
      if (!user.profile?.id) {
        const candidateProfile = await candidateService.getCandidateProfile(user.id);
        if (candidateProfile) {
          const apps = await applicationsService.getApplicationsByCandidate(candidateProfile.id);
          setAppliedJobIds(apps.map((a: any) => a.job_id));
        }
        return;
      }
      const apps = await applicationsService.getApplicationsByCandidate(user.profile.id);
      setAppliedJobIds(apps.map((a: any) => a.job_id));
    } catch (error) {
      console.error('Error loading applied jobs:', error);
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

        <div className="flex flex-col lg:flex-row gap-8">
          {user.role === 'candidate' && (
            <div className="w-full lg:w-80 flex-shrink-0">
              <JobFilters
                filters={filters}
                onFiltersChange={setFilters}
                onMatchProfile={handleMatchProfile}
                onReset={handleResetFilters}
              />
            </div>
          )}

          <div className="flex-1 space-y-8">


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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredJobs.map((job) => (
                        <Card key={job.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1 flex flex-col">
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
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-h4 font-heading text-foreground">{job.title}</h3>
                                {job.matchScore !== undefined && (
                                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${job.matchScore >= 80 ? 'bg-success/20 text-success' :
                                    job.matchScore >= 50 ? 'bg-warning/20 text-warning' :
                                      'bg-muted text-muted-foreground'
                                    }`}>
                                    {job.matchScore}% Match
                                  </div>
                                )}
                              </div>
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

                            <div className="flex flex-wrap gap-2">
                              <Button
                                onClick={() => navigate(`/jobs/${job.id}`)}
                                variant="outline"
                                className="flex-1 min-w-[120px] bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                              >
                                View Details
                              </Button>
                              <Button
                                onClick={() => handleApply(job)}
                                className={`flex-1 min-w-[120px] font-normal ${appliedJobIds.includes(job.id)
                                  ? 'bg-muted text-muted-foreground'
                                  : 'bg-primary text-primary-foreground hover:bg-primary-hover'
                                  }`}
                                disabled={user.role !== 'candidate' || appliedJobIds.includes(job.id)}
                              >
                                {appliedJobIds.includes(job.id) ? 'Already Applied' : 'Apply Now'}
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
