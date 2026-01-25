import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Calendar } from 'lucide-react';
import { mockJobs } from '@/data/mockJobs';

interface Application {
  id: string;
  job: typeof mockJobs[0];
  appliedDate: string;
  status: 'pending' | 'interview' | 'rejected' | 'accepted';
}

const MyApplications: React.FC = () => {
  const applications: Application[] = [
    {
      id: '1',
      job: mockJobs[0],
      appliedDate: '2024-01-15',
      status: 'interview',
    },
    {
      id: '2',
      job: mockJobs[1],
      appliedDate: '2024-01-14',
      status: 'pending',
    },
    {
      id: '3',
      job: mockJobs[2],
      appliedDate: '2024-01-12',
      status: 'pending',
    },
    {
      id: '4',
      job: mockJobs[3],
      appliedDate: '2024-01-10',
      status: 'rejected',
    },
  ];

  const getStatusBadge = (status: Application['status']) => {
    const styles = {
      pending: 'bg-warning/10 text-warning border-warning/30',
      interview: 'bg-info/10 text-info border-info/30',
      rejected: 'bg-error/10 text-error border-error/30',
      accepted: 'bg-success/10 text-success border-success/30',
    };

    const labels = {
      pending: 'Pending',
      interview: 'Interview',
      rejected: 'Rejected',
      accepted: 'Accepted',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-caption font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">My Applications</h1>
          <p className="text-body text-muted-foreground">
            Track the status of your job applications.
          </p>
        </div>

        <div>
          <p className="text-body text-foreground mb-6">
            <span className="font-medium">{applications.length}</span> applications
          </p>

          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="p-6 border border-border bg-card hover:shadow-md transition-all duration-normal">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <img
                      src={application.job.image}
                      alt={application.job.company}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-h4 font-heading text-foreground mb-1">{application.job.title}</h3>
                      <p className="text-body-sm text-muted-foreground mb-3">{application.job.company}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex items-center text-body-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          <span>{application.job.location}</span>
                        </div>
                        <div className="flex items-center text-body-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          <span>{application.job.salary}</span>
                        </div>
                        <div className="flex items-center text-body-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          <span>Applied {new Date(application.appliedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {getStatusBadge(application.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MyApplications;
