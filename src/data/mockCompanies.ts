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
    id: '1',
    name: 'TechCorp',
    logo: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
    description: 'Leading technology company building innovative solutions for the future.',
    industry: 'Technology',
    size: '1000-5000',
    location: 'New York, NY',
    openForRefugees: true,
    website: 'https://techcorp.example.com',
    activeJobs: 24,
  },
  {
    id: '2',
    name: 'StartupXYZ',
    logo: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_2.png',
    description: 'Fast-growing startup revolutionizing the e-commerce industry.',
    industry: 'E-commerce',
    size: '50-200',
    location: 'San Francisco, CA',
    openForRefugees: true,
    website: 'https://startupxyz.example.com',
    activeJobs: 12,
  },
  {
    id: '3',
    name: 'DesignHub',
    logo: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_3.png',
    description: 'Creative agency specializing in digital design and branding.',
    industry: 'Design',
    size: '20-50',
    location: 'Austin, TX',
    openForRefugees: false,
    website: 'https://designhub.example.com',
    activeJobs: 8,
  },
  {
    id: '4',
    name: 'DataCo',
    logo: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_4.png',
    description: 'Data analytics platform helping businesses make data-driven decisions.',
    industry: 'Analytics',
    size: '200-500',
    location: 'Seattle, WA',
    openForRefugees: true,
    website: 'https://dataco.example.com',
    activeJobs: 18,
  },
  {
    id: '5',
    name: 'CloudTech',
    logo: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_5.png',
    description: 'Cloud infrastructure provider with global reach and reliability.',
    industry: 'Cloud Services',
    size: '500-1000',
    location: 'Boston, MA',
    openForRefugees: true,
    website: 'https://cloudtech.example.com',
    activeJobs: 32,
  },
  {
    id: '6',
    name: 'AI Solutions',
    logo: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
    description: 'Artificial intelligence company developing cutting-edge ML solutions.',
    industry: 'AI/ML',
    size: '100-500',
    location: 'Chicago, IL',
    openForRefugees: false,
    website: 'https://aisolutions.example.com',
    activeJobs: 15,
  },
];
