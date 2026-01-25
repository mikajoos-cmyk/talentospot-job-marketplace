import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Briefcase, Trash2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { mockJobs } from '@/data/mockJobs';

const SavedJobs: React.FC = () => {
  const { showToast } = useToast();
  const savedJobs = mockJobs.slice(0, 4);

  const handleRemove = (jobTitle: string) => {
    showToast({
      title: 'Job Removed',
      description: `${jobTitle} has been removed from saved jobs`,
    });
  };

  const handleApply = (jobTitle: string) => {
    showToast({
      title: 'Application Submitted',
      description: `Your application for ${jobTitle} has been submitted`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Saved Jobs</h1>
          <p className="text-body text-muted-foreground">
            Jobs you've bookmarked for later review.
          </p>
        </div>

        <div>
          <p className="text-body text-foreground mb-6">
            <span className="font-medium">{savedJobs.length}</span> saved jobs
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map((job) => (
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
                      onClick={() => handleRemove(job.title)}
                      className="bg-transparent text-error hover:bg-error/10 hover:text-error"
                      aria-label="Remove from saved"
                    >
                      <Trash2 className="w-5 h-5" strokeWidth={1.5} />
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

export default SavedJobs;
