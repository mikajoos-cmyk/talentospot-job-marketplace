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
  currency: string;
  workRadius: number;
  homeOfficePreference: 'full' | 'hybrid' | 'none';
  vacationDays: number;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  title: string;
  location: string;
  city?: string;
  country?: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  state?: string;
  tags?: string[];
  cvUrl?: string;
  nationalityCode?: string;
  salary: { min: number; max: number };
  currency: string;
  skills: Array<{ name: string; percentage: number }>;
  qualifications: string[];
  requirements: string[];
  isRefugee: boolean;
  originCountry?: string;
  description?: string;
  avatar?: string;
  videoUrl?: string;
  portfolioImages?: Array<{ images: string[]; title?: string; description?: string }>;
  sector?: string;
  careerLevel?: string;
  employmentStatus?: string;
  jobTypes?: string[];
  travelWillingness?: number;
  languages?: Array<{ name: string; level: string }>;
  drivingLicenses?: string[];
  contractTermPreference?: string[];
  yearsOfExperience?: number;
  conditions: CandidateConditions;
  preferredLocations: Array<{
    continent: string;
    country: string;
    city: string;
  }>;
  availableFrom?: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    period: string;
    isCurrent?: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    startDate?: string;
    endDate?: string;
    period: string;
    description?: string;
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
  jobTitle?: string;
  jobTypes?: string[];
  careerLevel?: string[];
  yearsOfExperience?: number[];
  languages?: { name: string; level: string }[] | string[]; // Support both formats
  contractTerm?: string[];
  travelWillingness?: number[];
  drivingLicenses?: string[];
  enablePartialMatch?: boolean;
  minMatchThreshold?: number;
  // New fields
  sector?: string;
  candidateStatus?: string[];
  homeOfficePreference?: ('yes' | 'no' | 'hybrid')[];
  vacationDays?: number[];
  noticePeriod?: string[];
  preferredWorkLocations?: Array<{ continent: string; country: string; city: string; radius: number }>;
  customTags?: string[];
}
