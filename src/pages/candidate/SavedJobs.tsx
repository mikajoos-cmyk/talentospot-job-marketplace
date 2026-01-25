import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, DollarSign, Briefcase, Trash2, Building2, Eye } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { mockJobs } from '@/data/mockJobs';
import { mockCompanies } from '@/data/mockCompanies';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SavedJobs: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const savedJobs = mockJobs.slice(0, 4);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<typeof mockJobs[0] | null>(null);
  const [coverLetter, setCoverLetter] = useState('');

  const handleRemove = (jobTitle: string) => {
    showToast({
      title: 'Job Removed',
      description: `${jobTitle} has been removed from saved jobs`,
    });
  };

  const handleApply = (job: typeof mockJobs[0]) => {
    setSelectedJob(job);
    setApplyDialogOpen(true);
  };

  const handleSubmitApplication = () => {
    if (!coverLetter.trim()) {
      showToast({
        title: 'Error',
        description: 'Please write a cover letter',
        variant: 'destructive',
      });
      return;
    }

    showToast({
      title: 'Application Submitted',
      description: `Your application for ${selectedJob?.title} has been submitted`,
    });
    setApplyDialogOpen(false);
    setCoverLetter('');
    setSelectedJob(null);
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
                      className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      loading="lazy"
                      onClick={(e) => {
                        e.stopPropagation();
                        const company = mockCompanies.find(c => c.name === job.company);
                        if (company) navigate(`/companies/${company.id}`);
                      }}
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
                    <p 
                      className="text-body-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        const company = mockCompanies.find(c => c.name === job.company);
                        if (company) navigate(`/companies/${company.id}`);
                      }}
                    >
                      {job.company}
                    </p>
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

                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      variant="outline"
                      className="flex-1 bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                    >
                      <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      View Details
                    </Button>
                    <Button 
                      onClick={() => handleApply(job)}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                    >
                      Apply Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Submit your application to {selectedJob?.company}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="coverLetter" className="text-body-sm font-medium text-foreground mb-2 block">
                Cover Letter <span className="text-error">*</span>
              </Label>
              <textarea
                id="coverLetter"
                placeholder="Tell us why you're a great fit for this role..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full min-h-[200px] px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <Label className="text-body-sm font-medium text-foreground mb-2 block">
                Attach CV
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-body-sm text-foreground">Click to upload your CV</p>
                <p className="text-caption text-muted-foreground">PDF, DOC up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setApplyDialogOpen(false);
                setCoverLetter('');
              }}
              className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={!coverLetter.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              Submit Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default SavedJobs;
