import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Briefcase, Calendar, ArrowLeft, Building2 } from 'lucide-react';
import { mockJobs } from '@/data/mockJobs';
import { mockCompanies } from '@/data/mockCompanies';
import { useToast } from '@/contexts/ToastContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const JobDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const job = mockJobs.find(j => j.id === id);

  const handleApply = () => {
    showToast({
      title: 'Application Submitted',
      description: `Your application for ${job?.title} has been submitted successfully`,
    });
    setApplyDialogOpen(false);
    setCoverLetter('');
  };

  if (!job) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-h2 font-heading text-foreground mb-4">Job Not Found</h2>
          <Button onClick={() => navigate(-1)} className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal">
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-transparent text-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </Button>
          <div>
            <h1 className="text-h1 font-heading text-foreground">{job.title}</h1>
          </div>
        </div>

        <Card className="p-8 border border-border bg-card">
          <div 
            className="flex items-start space-x-6 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              const company = mockCompanies.find(c => c.name === job.company);
              if (company) navigate(`/companies/${company.id}`);
            }}
          >
            <img
              src={job.image}
              alt={job.company}
              className="w-20 h-20 rounded-lg object-cover"
              loading="lazy"
            />
            <div className="flex-1">
              <h2 className="text-h2 font-heading text-foreground mb-2 hover:text-primary transition-colors">{job.company}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center text-body text-foreground">
                  <MapPin className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-body text-foreground">
                  <DollarSign className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center text-body text-foreground">
                  <Briefcase className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center text-body text-foreground">
                  <Calendar className="w-5 h-5 mr-2 text-muted-foreground" strokeWidth={1.5} />
                  <span>Posted {new Date(job.datePosted).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {job.attributes?.entryBonus && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-body font-medium text-warning">Entry Bonus</span>
                <span className="text-h3 font-heading text-warning">€{job.attributes.entryBonus.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="text-h3 font-heading text-foreground mb-4">Job Description</h3>
              <p className="text-body text-foreground whitespace-pre-line">{job.description}</p>
            </div>

            {job.attributes && (
              <div>
                <h3 className="text-h3 font-heading text-foreground mb-4">Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.attributes.contractDuration && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-caption text-muted-foreground mb-1">Contract Duration</p>
                      <p className="text-body font-medium text-foreground">{job.attributes.contractDuration}</p>
                    </div>
                  )}
                  {job.attributes.languages && job.attributes.languages.length > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-caption text-muted-foreground mb-1">Languages</p>
                      <p className="text-body font-medium text-foreground">{job.attributes.languages.join(', ')}</p>
                    </div>
                  )}
                  {job.attributes.homeOffice !== undefined && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-caption text-muted-foreground mb-1">Home Office</p>
                      <p className="text-body font-medium text-foreground">{job.attributes.homeOffice ? 'Available' : 'Not Available'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {job.qualifications && job.qualifications.length > 0 && (
              <div>
                <h3 className="text-h3 font-heading text-foreground mb-4">Required Qualifications</h3>
                <div className="flex flex-wrap gap-2">
                  {job.qualifications.map((qual) => (
                    <span
                      key={qual}
                      className="px-3 py-2 bg-accent/10 text-accent text-body-sm rounded-lg"
                    >
                      {qual}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <Button 
              onClick={() => setApplyDialogOpen(true)}
              className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary-hover font-normal h-12 px-8"
            >
              Apply for this Position
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">Apply for {job.title}</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              Submit your application to {job.company}
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
              onClick={() => setApplyDialogOpen(false)}
              className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
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

export default JobDetailView;
