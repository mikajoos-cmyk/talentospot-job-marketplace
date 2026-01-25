export interface LocationHierarchy {
  continent: string;
  country: string;
  cities: string[];
}

export interface CandidateConditions {
  entryBonus?: number;
  startDate?: string;
  noticePeriod?: string;
  salaryExpectation: { min: number; max: number };
  workRadius: number;
  homeOfficePreference: 'full' | 'hybrid' | 'none';
  vacationDays: number;
}

export interface CandidateProfile {
  id: string;
  name: string;
  title: string;
  location: string;
  salary: { min: number; max: number };
  skills: Array<{ name: string; percentage: number }>;
  qualifications: string[];
  isRefugee: boolean;
  originCountry?: string;
  avatar?: string;
  videoUrl?: string;
  portfolioImages?: string[];
  conditions: CandidateConditions;
  locationPreference: LocationHierarchy;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    period: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    period: string;
  }>;
}

export interface CandidateFilters {
  salary: number[];
  bonus: number[];
  workRadius: number;
  isRefugee: boolean;
  originCountry: string;
  skills: string[];
  qualifications: string[];
  location: {
    continent: string;
    country: string;
    cities: string[];
  };
}
