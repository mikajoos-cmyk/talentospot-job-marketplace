export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  image: string;
  featured: boolean;
  datePosted: string;
  attributes?: {
    entryBonus?: number;
    contractDuration?: string;
    languages?: string[];
    homeOffice?: boolean;
  };
  qualifications?: string[];
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp',
    location: 'New York, NY',
    salary: '$100k - $140k',
    type: 'Full-time',
    description: 'Build amazing user experiences with React and TypeScript. Join our innovative team working on cutting-edge web applications.',
    image: 'https://ui-avatars.com/api/?name=Frontend&background=6366f1&color=fff',
    featured: true,
    datePosted: '2024-01-15',
    attributes: {
      entryBonus: 5000,
      contractDuration: 'Permanent',
      languages: ['English', 'German'],
      homeOffice: true,
    },
    qualifications: ['React', 'TypeScript', 'Node.js'],
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'StartupXYZ',
    location: 'San Francisco, CA',
    salary: '$120k - $160k',
    type: 'Full-time',
    description: 'Lead product strategy and development for our core platform. Work with cross-functional teams to deliver exceptional products.',
    image: 'https://ui-avatars.com/api/?name=Product&background=ec4899&color=fff',
    featured: true,
    datePosted: '2024-01-14',
    attributes: {
      entryBonus: 8000,
      contractDuration: 'Permanent',
      languages: ['English'],
      homeOffice: true,
    },
    qualifications: ['Product Management', 'Agile', 'Analytics'],
  },
  {
    id: '3',
    title: 'UX Designer',
    company: 'DesignHub',
    location: 'Austin, TX',
    salary: '$80k - $110k',
    type: 'Full-time',
    description: 'Create intuitive and beautiful user interfaces. Collaborate with developers and stakeholders to bring designs to life.',
    image: 'https://ui-avatars.com/api/?name=Design&background=10b981&color=fff',
    featured: true,
    datePosted: '2024-01-13',
    attributes: {
      contractDuration: 'Permanent',
      languages: ['English', 'Spanish'],
      homeOffice: true,
    },
    qualifications: ['Figma', 'UI/UX', 'Prototyping'],
  },
  {
    id: '4',
    title: 'Backend Engineer',
    company: 'DataCo',
    location: 'Seattle, WA',
    salary: '$110k - $150k',
    type: 'Full-time',
    description: 'Build scalable APIs and microservices. Work with modern cloud technologies and distributed systems.',
    image: 'https://ui-avatars.com/api/?name=Backend&background=f59e0b&color=fff',
    featured: false,
    datePosted: '2024-01-12',
    attributes: {
      entryBonus: 6000,
      contractDuration: 'Permanent',
      languages: ['English'],
      homeOffice: false,
    },
    qualifications: ['Python', 'AWS', 'Docker'],
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudTech',
    location: 'Boston, MA',
    salary: '$105k - $145k',
    type: 'Full-time',
    description: 'Manage cloud infrastructure and CI/CD pipelines. Ensure high availability and performance of our systems.',
    image: 'https://ui-avatars.com/api/?name=DevOps&background=3b82f6&color=fff',
    featured: false,
    datePosted: '2024-01-11',
    attributes: {
      contractDuration: 'Permanent',
      languages: ['English'],
      homeOffice: true,
    },
    qualifications: ['Kubernetes', 'Terraform', 'CI/CD'],
  },
  {
    id: '6',
    title: 'Data Scientist',
    company: 'AI Solutions',
    location: 'Chicago, IL',
    salary: '$115k - $155k',
    type: 'Full-time',
    description: 'Develop machine learning models and data pipelines. Turn data into actionable insights for business decisions.',
    image: 'https://ui-avatars.com/api/?name=Data&background=8b5cf6&color=fff',
    featured: true,
    datePosted: '2024-01-10',
    attributes: {
      entryBonus: 7000,
      contractDuration: 'Permanent',
      languages: ['English', 'French'],
      homeOffice: true,
    },
    qualifications: ['Python', 'Machine Learning', 'SQL'],
  },
  {
    id: '7',
    title: 'Mobile Developer',
    company: 'AppWorks',
    location: 'Los Angeles, CA',
    salary: '$95k - $135k',
    type: 'Full-time',
    description: 'Build native mobile applications for iOS and Android. Create seamless user experiences across platforms.',
    image: 'https://ui-avatars.com/api/?name=Mobile&background=6366f1&color=fff',
    featured: false,
    datePosted: '2024-01-09',
    attributes: {
      contractDuration: 'Contract - 12 months',
      languages: ['English'],
      homeOffice: true,
    },
    qualifications: ['React Native', 'Swift', 'Kotlin'],
  },
  {
    id: '8',
    title: 'Security Engineer',
    company: 'SecureNet',
    location: 'Washington, DC',
    salary: '$120k - $170k',
    type: 'Full-time',
    description: 'Protect our infrastructure and applications from security threats. Implement security best practices and conduct audits.',
    image: 'https://ui-avatars.com/api/?name=Security&background=ec4899&color=fff',
    featured: false,
    datePosted: '2024-01-08',
    attributes: {
      entryBonus: 10000,
      contractDuration: 'Permanent',
      languages: ['English'],
      homeOffice: false,
    },
    qualifications: ['Security', 'Penetration Testing', 'Compliance'],
  },
];
