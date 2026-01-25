import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, DollarSign, Briefcase, Search, Bookmark } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  image: string;
}

const JobSearch: React.FC = () => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const jobs: Job[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'New York, NY',
      salary: '$100k - $140k',
      type: 'Full-time',
      description: 'Build amazing user experiences with React and TypeScript.',
      image: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'San Francisco, CA',
      salary: '$120k - $160k',
      type: 'Full-time',
      description: 'Lead product strategy and development for our core platform.',
      image: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_2.png',
    },
    {
      id: '3',
      title: 'UX Designer',
      company: 'DesignHub',
      location: 'Austin, TX',
      salary: '$80k - $110k',
      type: 'Full-time',
      description: 'Create intuitive and beautiful user interfaces.',
      image: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_3.png',
    },
    {
      id: '4',
      title: 'Backend Engineer',
      company: 'DataCo',
      location: 'Seattle, WA',
      salary: '$110k - $150k',
      type: 'Full-time',
      description: 'Build scalable APIs and microservices.',
      image: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_4.png',
    },
    {
      id: '5',
      title: 'DevOps Engineer',
      company: 'CloudTech',
      location: 'Boston, MA',
      salary: '$105k - $145k',
      type: 'Full-time',
      description: 'Manage cloud infrastructure and CI/CD pipelines.',
      image: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_5.png',
    },
    {
      id: '6',
      title: 'Data Scientist',
      company: 'AI Solutions',
      location: 'Chicago, IL',
      salary: '$115k - $155k',
      type: 'Full-time',
      description: 'Develop machine learning models and data pipelines.',
      image: 'https://c.animaapp.com/mktjfn7fdsCv0P/img/ai_1.png',
    },
  ];

  const handleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
      showToast({ title: 'Job removed from saved' });
    } else {
      setSavedJobs([...savedJobs, jobId]);
      showToast({ title: 'Job saved successfully' });
    }
  };

  const handleApply = (jobTitle: string) => {
    showToast({
      title: 'Application Submitted',
      description: `Your application for ${jobTitle} has been submitted`,
    });
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Find Jobs</h1>
          <p className="text-body text-muted-foreground">
            Discover opportunities that match your skills and interests.
          </p>
        </div>

        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          <Input
            type="search"
            placeholder="Search by job title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-background text-foreground border-border"
          />
        </div>

        <div>
          <p className="text-body text-foreground mb-6">
            <span className="font-medium">{filteredJobs.length}</span> jobs found
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <img
                      src={job.image}
                      alt={job.company}
                      className="w-12 h-12 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveJob(job.id)}
                      className={`bg-transparent hover:bg-muted ${
                        savedJobs.includes(job.id) ? 'text-accent' : 'text-muted-foreground'
                      } hover:text-foreground`}
                      aria-label={savedJobs.includes(job.id) ? 'Remove from saved' : 'Save job'}
                    >
                      <Bookmark className="w-5 h-5" strokeWidth={1.5} fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} />
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-h4 font-heading text-foreground mb-1">{job.title}</h3>
                    <p className="text-body-sm text-muted-foreground">{job.company}</p>
                  </div>

                  <p className="text-body-sm text-foreground line-clamp-2">{job.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <Briefcase className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      <span>{job.type}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleApply(job.title)}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                  >
                    Apply Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default JobSearch;
