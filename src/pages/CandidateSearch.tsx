import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CandidateFilters from '@/components/employer/CandidateFilters';
import CandidateCard from '@/components/employer/CandidateCard';
import { useUser } from '@/contexts/UserContext';

interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  salary: { min: number; max: number };
  skills: string[];
  isRefugee: boolean;
  country?: string;
  avatar?: string;
}

const CandidateSearch: React.FC = () => {
  const { user } = useUser();
  const [filters, setFilters] = useState({
    salary: [30000, 120000],
    bonus: [0, 50000],
    radius: 50,
    isRefugee: false,
    country: '',
    skills: [] as string[],
  });

  const candidates: Candidate[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Senior Frontend Developer',
      location: 'New York, NY',
      salary: { min: 80000, max: 120000 },
      skills: ['React', 'TypeScript', 'Node.js'],
      isRefugee: true,
      country: 'Syria',
      avatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
    },
    {
      id: '2',
      name: 'Michael Chen',
      title: 'Full Stack Engineer',
      location: 'San Francisco, CA',
      salary: { min: 90000, max: 140000 },
      skills: ['Python', 'Django', 'React'],
      isRefugee: false,
      avatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_2.png',
    },
    {
      id: '3',
      name: 'Amira Hassan',
      title: 'UX/UI Designer',
      location: 'Austin, TX',
      salary: { min: 70000, max: 100000 },
      skills: ['Figma', 'Adobe XD', 'User Research'],
      isRefugee: true,
      country: 'Afghanistan',
      avatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_3.png',
    },
    {
      id: '4',
      name: 'David Martinez',
      title: 'DevOps Engineer',
      location: 'Seattle, WA',
      salary: { min: 95000, max: 130000 },
      skills: ['AWS', 'Docker', 'Kubernetes'],
      isRefugee: false,
      avatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_4.png',
    },
    {
      id: '5',
      name: 'Fatima Al-Rashid',
      title: 'Data Scientist',
      location: 'Boston, MA',
      salary: { min: 85000, max: 125000 },
      skills: ['Python', 'Machine Learning', 'SQL'],
      isRefugee: true,
      country: 'Iraq',
      avatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_5.png',
    },
    {
      id: '6',
      name: 'James Wilson',
      title: 'Product Manager',
      location: 'Chicago, IL',
      salary: { min: 100000, max: 150000 },
      skills: ['Agile', 'Product Strategy', 'Analytics'],
      isRefugee: false,
      avatar: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
    },
  ];

  const filteredCandidates = candidates.filter((candidate) => {
    if (filters.isRefugee && !candidate.isRefugee) return false;
    if (filters.country && candidate.country !== filters.country) return false;
    if (candidate.salary.min < filters.salary[0] || candidate.salary.max > filters.salary[1]) return false;
    if (filters.skills.length > 0) {
      const hasSkills = filters.skills.some(skill => 
        candidate.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
      );
      if (!hasSkills) return false;
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
