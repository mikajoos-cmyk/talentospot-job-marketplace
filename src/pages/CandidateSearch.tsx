import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CandidateFilters from '@/components/employer/CandidateFilters';
import CandidateCard from '@/components/employer/CandidateCard';
import { useUser } from '@/contexts/UserContext';
import { CandidateFilters as CandidateFiltersType } from '@/types/candidate';
import { mockCandidates } from '@/data/mockCandidates';

const CandidateSearch: React.FC = () => {
  const { user } = useUser();
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

  const filteredCandidates = mockCandidates.filter((candidate) => {
    if (filters.isRefugee && !candidate.isRefugee) return false;
    if (filters.originCountry && candidate.originCountry !== filters.originCountry) return false;
    if (candidate.salary.min < filters.salary[0] || candidate.salary.max > filters.salary[1]) return false;
    
    if (candidate.conditions.entryBonus) {
      if (candidate.conditions.entryBonus < filters.bonus[0] || candidate.conditions.entryBonus > filters.bonus[1]) return false;
    }
    
    if (filters.workRadius < candidate.conditions.workRadius) return false;
    
    if (filters.skills.length > 0) {
      const hasSkills = filters.skills.some(skill => 
        candidate.skills.some(cs => cs.name.toLowerCase().includes(skill.toLowerCase()))
      );
      if (!hasSkills) return false;
    }
    
    if (filters.qualifications.length > 0) {
      const hasQualifications = filters.qualifications.some(qual => 
        candidate.qualifications.some(cq => cq.toLowerCase().includes(qual.toLowerCase()))
      );
      if (!hasQualifications) return false;
    }
    
    if (filters.location.continent && candidate.locationPreference.continent !== filters.location.continent) return false;
    if (filters.location.country && candidate.locationPreference.country !== filters.location.country) return false;
    if (filters.location.cities.length > 0) {
      const hasCity = filters.location.cities.some(city => 
        candidate.locationPreference.cities.includes(city)
      );
      if (!hasCity) return false;
    }
    
    return true;
  });

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
            <div className="mb-4">
              <p className="text-body text-foreground">
                <span className="font-medium">{filteredCandidates.length}</span> candidates found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  packageTier={user.packageTier || 'free'}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CandidateSearch;
