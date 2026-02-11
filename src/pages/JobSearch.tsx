import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Briefcase, Loader2, ArrowUpDown, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';
import { jobsService } from '@/services/jobs.service';
import { getCoordinates } from '@/utils/geocoding';
import { applicationsService } from '@/services/applications.service';
import { savedJobsService } from '@/services/saved-jobs.service';

import { candidateService } from '@/services/candidate.service';
import { packagesService } from '@/services/packages.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import JobFilters, { JobFiltersState } from '@/components/candidate/JobFilters';
import { calculateJobMatchScore } from '@/utils/match-utils';
import JobListCard from '@/components/landing/JobListCard';

type SortOption = 'newest' | 'random' | 'salary' | 'distance' | 'match';

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [sortAscending, setSortAscending] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.1657, 10.4515]);
  const [filters, setFilters] = useState<JobFiltersState>(() => {
    // 1. Check for URL parameters first
    // 1. Check for URL parameters first

    const hasUrlParams = Array.from(searchParams.keys()).length > 0;

    if (hasUrlParams) {
      const getArray = (key: string) => {
        const val = searchParams.get(key);
        return val ? val.split(',').filter(Boolean) : [];
      };

      const getInt = (key: string, defaultValue: number) => {
        const val = searchParams.get(key);
        return val ? parseInt(val) : defaultValue;
      };

      return {
        title: searchParams.get('title') || '',
        sector: searchParams.get('sector') || '',
        continent: searchParams.get('continent') || '',
        country: searchParams.get('country') || '',
        city: searchParams.get('city') || searchParams.get('location') || '',
        employmentTypes: getArray('jobTypes'),
        salaryRange: [getInt('salaryMin', 0), getInt('salaryMax', 250000)],
        minEntryBonus: getInt('bonusMin', 0),
        contractDuration: searchParams.get('contractDuration') || '',
        skills: getArray('skills'),
        qualifications: getArray('qualifications'),
        languages: (() => {
          const langs = searchParams.get('languages');
          if (!langs) return [];
          try {
            return JSON.parse(langs);
          } catch (e) {
            return [];
          }
        })(),
        careerLevel: searchParams.get('careerLevel') || '',
        experienceYears: searchParams.get('expMin') ? parseInt(searchParams.get('expMin')!) : null,
        drivingLicenses: [
          ...getArray('pkwClasses'),
          ...getArray('lkwClasses')
        ],
        contractTerms: getArray('contractTerms'),
        homeOffice: getArray('homeOffice').length > 0,
        enableFlexibleMatch: searchParams.get('flexibleMatch') === 'true',
        enablePartialMatch: searchParams.get('partialMatch') === 'true',
        minMatchThreshold: getInt('threshold', 50),
        benefits: getArray('benefits'),
        minVacationDays: getInt('vacationMin', 0),
        workRadius: getInt('radius', 200),
      };
    }

    // 2. Fall back to session storage
    const savedFilters = sessionStorage.getItem('job_search_filters');
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters);
      } catch (e) {
        console.error('Error parsing saved filters:', e);
      }
    }

    // 3. Default state
    return {
      title: '',
      sector: '',
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
      minVacationDays: parseInt(searchParams.get('minVacationDays') || '0'),
      benefits: [],
      workRadius: 200,
    };
  });

  useEffect(() => {
    const updateMapCenter = async () => {
      if (filters.city) {
        const coords = await getCoordinates(filters.city, filters.country);
        if (coords) {
          setMapCenter([coords.latitude, coords.longitude]);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      updateMapCenter();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.city, filters.country]);

  const [radiusValue, setRadiusValue] = useState(filters.workRadius || 200);

  useEffect(() => {
    sessionStorage.setItem('job_search_filters', JSON.stringify(filters));
    if (filters.workRadius !== radiusValue) {
      setRadiusValue(filters.workRadius);
    }
  }, [filters, radiusValue]);

  useEffect(() => {
    const checkAccess = async () => {
      if (user.role === 'candidate') {
        const hasPremium = await packagesService.hasActivePackage(user.id);
        setHasPremiumAccess(hasPremium);
      }
      loadJobs();
    };

    checkAccess();
    if (user && user.role === 'candidate') {
      loadSavedJobs();
      loadAppliedJobs();
    }
  }, [user?.role, user?.id, radiusValue]);

  const loadJobs = async (currentFilters: JobFiltersState = filters) => {
    try {
      setLoading(true);
      const searchParams: any = {};

      // Only apply exact filters if neither flexible nor partial matching is enabled
      const useClientSideFiltering = currentFilters.enableFlexibleMatch || currentFilters.enablePartialMatch;

      // Location filters - ALWAYS apply (needed for radius search to work)
      if (currentFilters.continent && currentFilters.continent !== 'all') searchParams.continent = currentFilters.continent;
      if (currentFilters.country && currentFilters.country !== 'all') searchParams.country = currentFilters.country;
      if (currentFilters.city && currentFilters.city !== 'all') searchParams.city = currentFilters.city;

      // Pass partial/flexible match flag to backend so it knows whether to exclude by radius
      searchParams.enablePartialMatch = currentFilters.enablePartialMatch;
      searchParams.enableFlexibleMatch = currentFilters.enableFlexibleMatch;

      // Apply all OTHER filters only when NOT using client-side filtering
      if (!useClientSideFiltering) {
        if (currentFilters.title) searchParams.title = currentFilters.title;
        if (currentFilters.sector && currentFilters.sector !== 'all') searchParams.sector = currentFilters.sector;
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
        if (currentFilters.minVacationDays > 0) searchParams.min_vacation_days = currentFilters.minVacationDays;
        if (currentFilters.benefits && currentFilters.benefits.length > 0) searchParams.benefits = currentFilters.benefits;
      }

      const data = await jobsService.searchJobs(searchParams, radiusValue);
      let results = data || [];

      // Apply client-side filtering/scoring if needed
      // Get coordinates for distance-based scoring if city is selected
      let filtersWithCoords = { ...currentFilters };
      if (currentFilters.city && currentFilters.city !== 'all') {
        const coords = await getCoordinates(currentFilters.city, currentFilters.country);
        if (coords) {
          filtersWithCoords = {
            ...currentFilters,
            latitude: coords.latitude,
            longitude: coords.longitude
          };
          setMapCenter([coords.latitude, coords.longitude]);
        }
      }

      if (useClientSideFiltering) {
        const flexibleMode = currentFilters.enableFlexibleMatch;

        results = results.map(job => ({
          ...job,
          matchScore: calculateJobMatchScore(job, filtersWithCoords, flexibleMode)
        }));

        // Filter by threshold only if partial matching is enabled
        if (currentFilters.enablePartialMatch) {
          results = results.filter(job => job.matchScore >= currentFilters.minMatchThreshold);
        }
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
    if (user.role === 'guest') {
      navigate('/login');
      return;
    }

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
        sector: '',
        continent: profile.preferredLocations?.[0]?.continent || '',
        country: profile.preferredLocations?.[0]?.country || '',
        city: profile.preferredLocations?.[0]?.city || '',
        employmentTypes: profile.jobTypes || [],
        salaryRange: [profile.salary?.min || 0, 250000],
        minEntryBonus: profile.conditions?.entryBonus || 0,
        contractDuration: '',
        skills: (profile.skills || []).map((s: any) => s.name),
        qualifications: profile.qualifications || [],
        languages: (profile.languages || []).map((l: any) =>
          typeof l === 'string' ? l : { name: l.name, level: l.level || l.proficiency_level || 'B2' }
        ),
        careerLevel: profile.careerLevel || '',
        experienceYears: typeof profile.yearsOfExperience === 'number' ? profile.yearsOfExperience : null,
        drivingLicenses: profile.drivingLicenses || [],
        contractTerms: profile.contractTermPreference || [],
        homeOffice: profile.homeOfficePreference && profile.homeOfficePreference !== 'none' ? true : false,
        enableFlexibleMatch: filters.enableFlexibleMatch,
        enablePartialMatch: filters.enablePartialMatch,
        minMatchThreshold: filters.minMatchThreshold,
        benefits: profile.tags || [],
        minVacationDays: 0,
        workRadius: 200,
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
      sector: '',
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
      benefits: [],
      minVacationDays: 0,
      workRadius: 200,
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
    if (user.role === 'guest') {
      navigate('/login');
      return;
    }

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
    if (user.role === 'guest') {
      navigate('/login');
      return;
    }

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

  // Sort jobs based on selected option
  const sortedJobs = React.useMemo(() => {
    let sorted = [...filteredJobs];
    const direction = sortAscending ? 1 : -1;

    switch (sortBy) {
      case 'newest':
        // Sort by created_at or id
        sorted.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return direction * (dateB - dateA || b.id - a.id);
        });
        break;

      case 'random':
        // Shuffle array (ignore direction for random)
        for (let i = sorted.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
        }
        break;

      case 'salary':
        // Sort by salary (using max salary for comparison)
        sorted.sort((a, b) => {
          const salaryA = a.salary_max || 0;
          const salaryB = b.salary_max || 0;
          return direction * (salaryB - salaryA);
        });
        break;

      case 'distance':
        // Sort by distance to search location
        sorted.sort((a, b) => {
          const distA = a.distance || (a.latitude && a.longitude && filters.city ?
            calculateDistance(mapCenter[0], mapCenter[1], a.latitude, a.longitude) : Infinity);
          const distB = b.distance || (b.latitude && b.longitude && filters.city ?
            calculateDistance(mapCenter[0], mapCenter[1], b.latitude, b.longitude) : Infinity);
          return direction * (distA - distB);
        });
        break;

      case 'match':
        // Sort by match score
        sorted.sort((a, b) => {
          const scoreA = a.matchScore || 0;
          const scoreB = b.matchScore || 0;
          return direction * (scoreB - scoreA);
        });
        break;

      default:
        break;
    }

    return sorted;
  }, [filteredJobs, sortBy, sortAscending, mapCenter, filters.city]);

  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case 'newest': return 'Neueste';
      case 'random': return 'Zufällig';
      case 'salary': return 'Gehaltshöhe';
      case 'distance': return 'Nächste zum Standort';
      case 'match': return 'Match %';
      default: return 'Sortieren';
    }
  };

  const toggleSortDirection = () => {
    if (sortBy !== 'random') {
      setSortAscending(!sortAscending);
    }
  };

  return (
    <>
      <AppLayout isPublic={user.role === 'guest'}>
        <div className="space-y-8">
          {user.role === 'guest' ? (
            <div className="text-center pt-8 mb-16">
              <h1 className="text-5xl md:text-7xl font-heading text-foreground mb-6 font-bold tracking-tight">
                Find Your <span className="text-primary">Next Project</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Browse current job openings from top employers.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-h1 font-heading text-foreground mb-2">Find Jobs</h1>
              <p className="text-body text-muted-foreground">
                Discover opportunities that match your skills and interests.
              </p>
            </div>
          )}

          <div className={`flex flex-col ${user.role === 'guest' ? 'layout-sm:flex-row' : 'layout-md:flex-row'} gap-8`}>
            {(user.role === 'guest' || user.role === 'candidate' || user.role === 'admin') && (
              <div className={`w-full ${user.role === 'guest' ? 'layout-sm:w-96' : 'layout-md:w-96'} shrink-0`}>
                <JobFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onMatchProfile={handleMatchProfile}
                  onReset={handleResetFilters}
                  mapCenter={mapCenter}
                />
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-8">
              <div>
                {!hasPremiumAccess && user.role === 'candidate' && (
                  <Card className="p-6 border border-primary/20 bg-primary/5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">Unlock Full Job Details</h4>
                        <p className="text-sm text-muted-foreground">Upgrade your package to see company names, locations and to apply for jobs.</p>
                      </div>
                    </div>
                    <Button onClick={() => navigate('/packages')} className="bg-primary text-primary-foreground hover:bg-primary-hover shrink-0 font-bold">
                      Upgrade Now
                    </Button>
                  </Card>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 flex items-center justify-between">
                        <p className="text-body text-foreground">
                          <span className="font-medium">{filteredJobs.length}</span> jobs found
                        </p>

                        {/* Sort Controls */}
                        <div className="flex items-center gap-2">
                          {/* Sort Direction Toggle (only show if not random) */}
                          {sortBy !== 'random' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={toggleSortDirection}
                              className="px-2"
                            >
                              {sortAscending ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            </Button>
                          )}

                          {/* Sort Dropdown */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <ArrowUpDown className="w-4 h-4 mr-2" />
                                {getSortLabel(sortBy)}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                                Neueste
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSortBy('random')}>
                                Zufällig
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSortBy('salary')}>
                                Gehaltshöhe
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSortBy('distance')}>
                                Nächste zum Standort
                              </DropdownMenuItem>
                              {(filters.enablePartialMatch || filters.enableFlexibleMatch) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setSortBy('match')}>
                                    Match %
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {filteredJobs.length === 0 ? (
                        <Card className="p-12 border border-border bg-card text-center">
                          <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-h3 font-heading text-foreground mb-2">No jobs found</h3>
                          <p className="text-body text-muted-foreground">
                            Try adjusting your search criteria or check back later for new opportunities.
                          </p>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 gap-6">
                          {sortedJobs.map((job) => (
                            <JobListCard
                              key={job.id}
                              job={job}
                              onViewDetail={(id) => hasPremiumAccess || user.role === 'guest' ? navigate(`/jobs/${id}`) : navigate('/packages')}
                              onApply={handleApply}
                              onSave={handleSaveJob}
                              isSaved={savedJobs.includes(job.id)}
                              isApplied={appliedJobIds.includes(job.id)}
                              showMatchScore={true}
                              obfuscate={!hasPremiumAccess && user.role === 'candidate'}
                            />
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
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default JobSearch;
