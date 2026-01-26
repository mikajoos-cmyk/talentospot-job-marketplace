import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CandidateFilters from '@/components/employer/CandidateFilters';
import CandidateCard from '@/components/employer/CandidateCard';
import { useUser } from '@/contexts/UserContext';
import { CandidateFilters as CandidateFiltersType } from '@/types/candidate';
import { candidateService } from '@/services/candidate.service';
import { Loader2 } from 'lucide-react';

const CandidateSearch: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filters, setFilters] = useState<CandidateFiltersType>({
    salary: [30000, 120000],
    bonus: [0, 50000],
    workRadius: 50,
    isRefugee: false,
    originCountry: '',
    skills: [],
    qualifications: [],
    location: {
      continent: '',
      country: '',
      cities: [],
    },
  });

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        setLoading(true);
        const searchFilters: any = {
          min_salary: filters.salary[0],
          max_salary: filters.salary[1],
          work_radius: filters.workRadius,
        };

        if (filters.isRefugee) {
          searchFilters.is_refugee = true;
        }

        if (filters.originCountry) {
          searchFilters.origin_country = filters.originCountry;
        }

        if (filters.location.continent) {
          searchFilters.continent = filters.location.continent;
        }

        if (filters.location.country) {
          searchFilters.country = filters.location.country;
        }

        const data = await candidateService.searchCandidates(searchFilters);
        setCandidates(data || []);
      } catch (error) {
        console.error('Error loading candidates:', error);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, [filters.salary, filters.workRadius, filters.isRefugee, filters.originCountry, filters.location]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Find Candidates</h1>
          <p className="text-body text-muted-foreground">
            Discover talented professionals for your team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CandidateFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          <div className="lg:col-span-3">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {candidates.map((candidate) => (
                      <CandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        packageTier={user.subscription?.packages?.tier || 'free'}
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
  );
};

export default CandidateSearch;
