import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import CandidateFilters from '@/components/employer/CandidateFilters';
import CandidateCard from '@/components/employer/CandidateCard';
import Footer from '@/components/layout/Footer';
import { useUser } from '@/contexts/UserContext';
import { CandidateFilters as CandidateFiltersType } from '@/types/candidate';
import { candidateService } from '@/services/candidate.service';
import { jobsService, Job } from '@/services/jobs.service';
import { Loader2, Briefcase } from 'lucide-react';
import { calculateCandidateMatchScore } from '@/utils/match-utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CandidateSearch: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [accessRequests, setAccessRequests] = useState<Record<string, string>>({});
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<CandidateFiltersType>(() => {
    // 1. First, check if there are URL parameters (these should override everything)
    // 1. First, check if there are URL parameters (these should override everything)

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
        salary: [getInt('salaryMin', 20000), getInt('salaryMax', 200000)],
        bonus: [getInt('bonusMin', 0), getInt('bonusMax', 100000)],
        workRadius: getInt('radius', 200),
        isRefugee: searchParams.get('isRefugee') === 'true',
        originCountry: searchParams.get('originCountry') || '',
        skills: getArray('skills'),
        qualifications: getArray('qualifications'),
        location: {
          continent: searchParams.get('continent') || '',
          country: searchParams.get('country') || '',
          cities: searchParams.get('city') ? [searchParams.get('city')!] : (searchParams.get('location') ? [searchParams.get('location')!] : []),
        },
        jobTitle: searchParams.get('title') || '',
        jobTypes: getArray('jobTypes'),
        careerLevel: getArray('careerLevel'),
        yearsOfExperience: [getInt('expMin', 0), getInt('expMax', 30)],
        languages: (() => {
          const langs = searchParams.get('languages');
          if (!langs) return [];
          try {
            return JSON.parse(langs);
          } catch (e) {
            return [];
          }
        })(),
        contractTerm: getArray('contractTerms'),
        travelWillingness: [getInt('travelMin', 0), getInt('travelMax', 100)],
        drivingLicenses: [
          ...getArray('pkwClasses'),
          ...getArray('lkwClasses')
        ],
        candidateStatus: getArray('status') as any,
        sector: searchParams.get('sector') !== 'any' ? searchParams.get('sector') || '' : '',
        enablePartialMatch: searchParams.get('partialMatch') === 'true',
        minMatchThreshold: getInt('threshold', 50),
        homeOfficePreference: getArray('homeOffice') as any,
        vacationDays: [getInt('vacationMin', 0), getInt('vacationMax', 50)],
        noticePeriod: getArray('noticePeriod'),
        preferredWorkLocations: [],
        customTags: getArray('tags'),
      };
    }

    // 2. fall back to session storage
    const savedFilters = sessionStorage.getItem('candidate_search_filters');
    if (savedFilters) {
      try {
        return JSON.parse(savedFilters);
      } catch (e) {
        console.error('Error parsing saved filters:', e);
      }
    }

    // 3. Default state
    return {
      salary: [20000, 200000],
      bonus: [0, 100000],
      workRadius: 200,
      isRefugee: false,
      originCountry: '',
      skills: [],
      qualifications: [],
      location: {
        continent: '',
        country: '',
        cities: [],
      },
      jobTitle: '',
      jobTypes: [],
      careerLevel: [],
      yearsOfExperience: [0, 30],
      languages: [],
      contractTerm: [],
      travelWillingness: [0, 100],
      drivingLicenses: [],
      enablePartialMatch: false,
      minMatchThreshold: 50,
      sector: '',
      candidateStatus: [],
      homeOfficePreference: [],
      vacationDays: [0, 50],
      noticePeriod: [],
      preferredWorkLocations: [],
      customTags: [],
    };
  });

  useEffect(() => {
    sessionStorage.setItem('candidate_search_filters', JSON.stringify(filters));
  }, [filters]);

  // Load employer's jobs
  useEffect(() => {
    const loadJobs = async () => {
      if (user?.role === 'employer' && user.profile?.id) {
        setLoadingJobs(true);
        try {
          const jobs = await jobsService.getJobsByEmployer(user.profile.id);
          setMyJobs(jobs.filter(job => job.status === 'active'));
        } catch (error) {
          console.error('Error loading jobs:', error);
        } finally {
          setLoadingJobs(false);
        }
      }
    };
    loadJobs();
  }, [user]);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);

    // Map job requirements to candidate filters
    const newFilters: CandidateFiltersType = {
      salary: [job.salary_min || 20000, job.salary_max || 200000],
      bonus: [0, job.entry_bonus || 100000],
      workRadius: 200,
      isRefugee: false,
      originCountry: '',
      skills: job.required_skills || [],
      qualifications: job.required_qualifications || [],
      location: {
        continent: job.continent || '',
        country: job.country || '',
        cities: job.city ? [job.city] : [],
      },
      jobTitle: job.title || '',
      jobTypes: job.employment_type ? [job.employment_type] : [],
      careerLevel: job.career_level ? [job.career_level] : [],
      yearsOfExperience: [0, job.experience_years || 30],
      languages: (job.required_languages || []).map((l: any) =>
        typeof l === 'string' ? l : l.name
      ),
      contractTerm: job.contract_terms || [],
      travelWillingness: [0, 100],
      drivingLicenses: job.driving_licenses || [],
      enablePartialMatch: true,
      minMatchThreshold: 50,
    };

    setFilters(newFilters);
  };

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        const searchFilters: any = {};

        if (!filters.enablePartialMatch) {
          if (filters.salary[0] > 20000) searchFilters.min_salary = filters.salary[0];
          if (filters.salary[1] < 200000) searchFilters.max_salary = filters.salary[1];
          if (filters.bonus[0] > 0) searchFilters.min_bonus = filters.bonus[0];
          if (filters.bonus[1] < 100000) searchFilters.max_bonus = filters.bonus[1];
          if (filters.bonus[0] > 0) searchFilters.min_bonus = filters.bonus[0];
          if (filters.bonus[1] < 100000) searchFilters.max_bonus = filters.bonus[1];
          // Pass radius parameter SEPARATELY from candidate attribute filters
          // We pass it even if it is 200 (max) to allow "Search in 200km radius"
          if (filters.location.cities && filters.location.cities.length > 0) {
            searchFilters.searchRadius = filters.workRadius;
          }

          if (filters.jobTitle) {
            searchFilters.job_title = filters.jobTitle;
          }

          if (filters.jobTypes && filters.jobTypes.length > 0) {
            searchFilters.job_types = filters.jobTypes;
          }

          if (filters.careerLevel && filters.careerLevel.length > 0) {
            searchFilters.career_level = filters.careerLevel;
          }

          if (filters.yearsOfExperience) {
            if (filters.yearsOfExperience[0] > 0) searchFilters.min_years_experience = filters.yearsOfExperience[0];
            if (filters.yearsOfExperience[1] < 30) searchFilters.max_years_experience = filters.yearsOfExperience[1];
          }

          if (filters.contractTerm && filters.contractTerm.length > 0) {
            searchFilters.contract_term = filters.contractTerm;
          }

          if (filters.travelWillingness) {
            if (filters.travelWillingness[0] > 0) searchFilters.min_travel_willingness = filters.travelWillingness[0];
            if (filters.travelWillingness[1] < 100) searchFilters.max_travel_willingness = filters.travelWillingness[1];
          }

          if (filters.languages && filters.languages.length > 0) {
            searchFilters.languages = filters.languages;
          }

          if (filters.skills && filters.skills.length > 0) {
            searchFilters.skills = filters.skills;
          }

          if (filters.drivingLicenses && filters.drivingLicenses.length > 0) {
            searchFilters.driving_licenses = filters.drivingLicenses;
          }

          if (filters.isRefugee) {
            searchFilters.is_refugee = true;
          }

          if (filters.originCountry) {
            searchFilters.origin_country = filters.originCountry;
          }

          if (filters.sector) {
            searchFilters.sector = filters.sector;
          }

          if (filters.candidateStatus && filters.candidateStatus.length > 0) {
            searchFilters.employment_status = filters.candidateStatus;
          }

          if (filters.homeOfficePreference && filters.homeOfficePreference.length > 0) {
            searchFilters.home_office_preference = filters.homeOfficePreference;
          }

          if (filters.vacationDays) {
            if (filters.vacationDays[0] > 0) searchFilters.min_vacation_days = filters.vacationDays[0];
            if (filters.vacationDays[1] < 50) searchFilters.max_vacation_days = filters.vacationDays[1];
          }

          if (filters.noticePeriod && filters.noticePeriod.length > 0) {
            searchFilters.notice_period = filters.noticePeriod;
          }

          if (filters.customTags && filters.customTags.length > 0) {
            searchFilters.tags = filters.customTags;
          }

          if (filters.qualifications && filters.qualifications.length > 0) {
            searchFilters.qualifications = filters.qualifications;
          }

          if (filters.location.continent) {
            searchFilters.continent = filters.location.continent;
          }

          if (filters.location.country) {
            searchFilters.country = filters.location.country;
          }

          if (filters.location.cities && filters.location.cities.length > 0) {
            searchFilters.city = filters.location.cities[0];
          }
        }

        const data = await candidateService.searchCandidates(searchFilters);
        let results = data || [];

        if (filters.enablePartialMatch) {
          results = results.map(candidate => ({
            ...candidate,
            matchScore: calculateCandidateMatchScore(candidate, filters)
          })).filter(candidate => candidate.matchScore >= (filters.minMatchThreshold || 50))
            .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        }

        setCandidates(results);

        if (user && user.role === 'employer' && user.profile?.id) {
          // Fetch access requests for this employer
          const { data: requests } = await candidateService.getEmployerAccessRequests(user.profile.id);
          const requestMap: Record<string, string> = {};
          requests?.forEach((r: any) => {
            requestMap[r.candidate_id] = r.status;
          });
          setAccessRequests(requestMap);
        }
      } catch (error) {
        console.error('Error loading candidates:', error);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [filters]);

  return (
    <>
      <AppLayout isPublic={user.role === 'guest'}>
        <div className="space-y-8">
          {user.role === 'guest' ? (
            <div className="text-center pt-8 mb-16">
              <h1 className="text-5xl md:text-7xl font-heading text-foreground mb-6 font-bold tracking-tight">
                Find the <span className="text-primary">Perfect Talent</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with skilled professionals ready for their next challenge.
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-h1 font-heading text-foreground mb-2">Find Candidates</h1>
              <p className="text-body text-muted-foreground">
                Discover talented professionals for your team.
              </p>
            </div>
          )}

          {/* Job Selection Button */}
          {user?.role === 'employer' && (
            <div className="space-y-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Find Candidates for Job
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[300px] max-h-[400px] overflow-y-auto">
                  {loadingJobs ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : myJobs.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">
                      No active jobs found
                    </div>
                  ) : (
                    myJobs.map((job) => (
                      <DropdownMenuItem
                        key={job.id}
                        onClick={() => handleSelectJob(job)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{job.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {job.city}, {job.country}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedJob && (
                <p className="text-sm text-muted-foreground">
                  Searching candidates for: <span className="font-medium text-foreground">{selectedJob.title}</span>
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col layout-sm:flex-row gap-8">
            <div className="w-full layout-sm:w-96 shrink-0">
              <CandidateFilters filters={filters} onFiltersChange={setFilters} />
            </div>

            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-body text-foreground">
                      <span className="font-medium">{candidates.length}</span> candidates found
                    </p>
                  </div>

                  {candidates.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-body text-muted-foreground">
                        No candidates found matching your criteria.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {candidates.map((candidate) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          accessStatus={accessRequests[candidate.id]}
                          matchScore={candidate.matchScore}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
      <Footer />
    </>
  );
};

export default CandidateSearch;
