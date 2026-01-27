export interface Company {
  id: string;
  name: string;
  logo: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  openForRefugees: boolean;
  website?: string;
  activeJobs: number;
}

export const mockCompanies: Company[] = [
  {
    id: 'techcorp',
    name: 'TechCorp',
    logo: 'https://ui-avatars.com/api/?name=TechCorp&background=6366f1&color=fff',
    description: 'Leading technology company building innovative solutions for the future.',
    industry: 'Technology',
    size: '1000-5000',
    location: 'New York, NY',
    openForRefugees: true,
    website: 'https://techcorp.example.com',
    activeJobs: 24,
  },
  {
    id: 'startupxyz',
    name: 'StartupXYZ',
    logo: 'https://ui-avatars.com/api/?name=StartupXYZ&background=ec4899&color=fff',
    description: 'Fast-growing startup revolutionizing the e-commerce industry.',
    industry: 'E-commerce',
    size: '50-200',
    location: 'San Francisco, CA',
    openForRefugees: true,
    website: 'https://startupxyz.example.com',
    activeJobs: 12,
  },
  {
    id: 'designhub',
    name: 'DesignHub',
    logo: 'https://ui-avatars.com/api/?name=DesignHub&background=10b981&color=fff',
    description: 'Creative agency specializing in digital design and branding.',
    industry: 'Design',
    size: '20-50',
    location: 'Austin, TX',
    openForRefugees: false,
    website: 'https://designhub.example.com',
    activeJobs: 8,
  },
  {
    id: 'dataco',
    name: 'DataCo',
    logo: 'https://ui-avatars.com/api/?name=DataCo&background=f59e0b&color=fff',
    description: 'Data analytics platform helping businesses make data-driven decisions.',
    industry: 'Analytics',
    size: '200-500',
    location: 'Seattle, WA',
    openForRefugees: true,
    website: 'https://dataco.example.com',
    activeJobs: 18,
  },
  {
    id: 'cloudtech',
    name: 'CloudTech',
    logo: 'https://ui-avatars.com/api/?name=CloudTech&background=3b82f6&color=fff',
    description: 'Cloud infrastructure provider with global reach and reliability.',
    industry: 'Cloud Services',
    size: '500-1000',
    location: 'Boston, MA',
    openForRefugees: true,
    website: 'https://cloudtech.example.com',
    activeJobs: 32,
  },
  {
    id: 'aisolutions',
    name: 'AI Solutions',
    logo: 'https://ui-avatars.com/api/?name=AISolutions&background=8b5cf6&color=fff',
    description: 'Artificial intelligence company developing cutting-edge ML solutions.',
    industry: 'AI/ML',
    size: '100-500',
    location: 'Chicago, IL',
    openForRefugees: false,
    website: 'https://aisolutions.example.com',
    activeJobs: 15,
  },
];
