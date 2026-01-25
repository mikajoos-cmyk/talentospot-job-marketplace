import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, DollarSign, Users, MoreVertical } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Job {
  id: string;
  title: string;
  location: string;
  salary: string;
  applicants: number;
  status: 'active' | 'draft' | 'closed';
  postedDate: string;
}

const EmployerJobs: React.FC = () => {
  const { showToast } = useToast();

  const jobs: Job[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      location: 'New York, NY',
      salary: '$100k - $140k',
      applicants: 24,
      status: 'active',
      postedDate: '2 days ago',
    },
    {
      id: '2',
      title: 'Product Manager',
      location: 'San Francisco, CA',
      salary: '$120k - $160k',
      applicants: 18,
      status: 'active',
      postedDate: '5 days ago',
    },
    {
      id: '3',
      title: 'UX Designer',
      location: 'Austin, TX',
      salary: '$80k - $110k',
      applicants: 0,
      status: 'draft',
      postedDate: '1 week ago',
    },
    {
      id: '4',
      title: 'Backend Engineer',
      location: 'Seattle, WA',
      salary: '$110k - $150k',
      applicants: 32,
      status: 'closed',
      postedDate: '2 weeks ago',
    },
  ];

  const activeJobs = jobs.filter(job => job.status === 'active');
  const draftJobs = jobs.filter(job => job.status === 'draft');
  const closedJobs = jobs.filter(job => job.status === 'closed');

  const handleManageJob = (jobTitle: string) => {
    showToast({
      title: 'Opening Job Management',
      description: `Managing ${jobTitle}`,
    });
  };

  const JobCard: React.FC<{ job: Job }> = ({ job }) => (
    <Card className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-h4 font-heading text-foreground mb-1">{job.title}</h3>
          <p className="text-body-sm text-muted-foreground">{job.postedDate}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          className="bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
        </Button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-body-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center text-body-sm text-muted-foreground">
          <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>{job.salary}</span>
        </div>
        <div className="flex items-center text-body-sm text-muted-foreground">
          <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>{job.applicants} applicants</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button 
          onClick={() => handleManageJob(job.title)}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
        >
          Manage
        </Button>
        <Button 
          variant="outline"
          className="flex-1 bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
        >
          View
        </Button>
      </div>
    </Card>
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-h1 font-heading text-foreground mb-2">My Jobs</h1>
            <p className="text-body text-muted-foreground">Manage your job postings and applications.</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal">
            Post New Job
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="bg-muted">
            <TabsTrigger value="active" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
              Active ({activeJobs.length})
            </TabsTrigger>
            <TabsTrigger value="draft" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
              Draft ({draftJobs.length})
            </TabsTrigger>
            <TabsTrigger value="closed" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
              Closed ({closedJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="draft" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {draftJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="closed" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default EmployerJobs;
