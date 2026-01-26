import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, DollarSign, Users, MoreVertical, Edit, Eye, Archive, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';
import { jobsService } from '@/services/jobs.service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const EmployerJobs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      if (!user.profile || user.role !== 'employer') return;

      try {
        setLoading(true);
        const jobsData = await jobsService.getJobsByEmployer(user.profile.id);
        setJobs(jobsData || []);
      } catch (error) {
        console.error('Error loading jobs:', error);
        showToast({
          title: 'Error',
          description: 'Failed to load jobs. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [user.profile, user.role]);

  const activeJobs = jobs.filter(job => job.status === 'active');
  const draftJobs = jobs.filter(job => job.status === 'draft');
  const closedJobs = jobs.filter(job => job.status === 'closed');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleManageJob = (jobId: string) => {
    navigate(`/employer/jobs/${jobId}/edit`);
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleChangeStatus = async (jobId: string, newStatus: 'active' | 'draft' | 'closed') => {
    try {
      await jobsService.updateJob(jobId, { status: newStatus });

      setJobs(jobs.map(job =>
        job.id === jobId ? { ...job, status: newStatus } : job
      ));

      const statusLabels = {
        active: 'activated',
        draft: 'moved to draft',
        closed: 'closed',
      };

      showToast({
        title: 'Status Updated',
        description: `Job has been ${statusLabels[newStatus]}`,
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      showToast({
        title: 'Error',
        description: 'Failed to update job status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    try {
      await jobsService.deleteJob(jobId);

      setJobs(jobs.filter(job => job.id !== jobId));
      showToast({
        title: 'Job Deleted',
        description: `${jobTitle} has been permanently deleted`,
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      showToast({
        title: 'Error',
        description: 'Failed to delete job. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const JobCard: React.FC<{ job: any }> = ({ job }) => {
    const salaryText = job.salary_min && job.salary_max
      ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
      : 'Salary not specified';

    return (
      <Card className="p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-h4 font-heading text-foreground mb-1">{job.title}</h3>
            <p className="text-body-sm text-muted-foreground">Posted {formatDate(job.created_at)}</p>
          </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            <DropdownMenuItem 
              onClick={() => handleManageJob(job.id)}
              className="cursor-pointer text-foreground hover:bg-muted focus:bg-muted"
            >
              <Edit className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Edit Job
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleViewJob(job.id)}
              className="cursor-pointer text-foreground hover:bg-muted focus:bg-muted"
            >
              <Eye className="w-4 h-4 mr-2" strokeWidth={1.5} />
              View Public Page
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-border" />
            
            {job.status !== 'active' && (
              <DropdownMenuItem 
                onClick={() => handleChangeStatus(job.id, 'active')}
                className="cursor-pointer text-success hover:bg-success/10 focus:bg-success/10"
              >
                <CheckCircle className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Mark as Active
              </DropdownMenuItem>
            )}
            
            {job.status !== 'draft' && (
              <DropdownMenuItem 
                onClick={() => handleChangeStatus(job.id, 'draft')}
                className="cursor-pointer text-warning hover:bg-warning/10 focus:bg-warning/10"
              >
                <Archive className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Move to Draft
              </DropdownMenuItem>
            )}
            
            {job.status !== 'closed' && (
              <DropdownMenuItem 
                onClick={() => handleChangeStatus(job.id, 'closed')}
                className="cursor-pointer text-muted-foreground hover:bg-muted focus:bg-muted"
              >
                <Archive className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Close Job
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator className="bg-border" />
            
            <DropdownMenuItem 
              onClick={() => handleDeleteJob(job.id, job.title)}
              className="cursor-pointer text-error hover:bg-error/10 focus:bg-error/10"
            >
              <Trash2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Delete Job
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-body-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>{job.location || 'Location not specified'}</span>
        </div>
        <div className="flex items-center text-body-sm text-muted-foreground">
          <DollarSign className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>{salaryText}</span>
        </div>
        <div className="flex items-center text-body-sm text-muted-foreground">
          <Users className="w-4 h-4 mr-2" strokeWidth={1.5} />
          <span>{job.applications_count || 0} applicants</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          onClick={() => handleManageJob(job.id)}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
        >
          Manage
        </Button>
        <Button
          onClick={() => handleViewJob(job.id)}
          variant="outline"
          className="flex-1 bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
        >
          View
        </Button>
      </div>
    </Card>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-h1 font-heading text-foreground mb-2">My Jobs</h1>
            <p className="text-body text-muted-foreground">Manage your job postings and applications.</p>
          </div>
          <Button
            onClick={() => navigate('/employer/post-job')}
            className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
          >
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
            {activeJobs.length === 0 ? (
              <Card className="p-12 border border-border bg-card text-center">
                <p className="text-body text-muted-foreground">No active jobs</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="draft" className="mt-6">
            {draftJobs.length === 0 ? (
              <Card className="p-12 border border-border bg-card text-center">
                <p className="text-body text-muted-foreground">No draft jobs</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="closed" className="mt-6">
            {closedJobs.length === 0 ? (
              <Card className="p-12 border border-border bg-card text-center">
                <p className="text-body text-muted-foreground">No closed jobs</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {closedJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default EmployerJobs;
