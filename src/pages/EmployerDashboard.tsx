import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardStatsCard from '@/components/candidate/DashboardStatsCard';
import { Users, Briefcase, Eye, CheckCircle, MapPin, DollarSign, Calendar, Mail, Phone, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { jobsService } from '@/services/jobs.service';
import { applicationsService } from '@/services/applications.service';
import { employerService } from '@/services/employer.service';
import { followsService } from '@/services/follows.service';
import { analyticsService } from '@/services/analytics.service';
import ProfileViewsChart from '@/components/candidate/ProfileViewsChart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'candidates' | 'jobs' | 'applications' | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    profileViews: 0,
    totalApplications: 0,
    followers: 0,
  });

  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [viewStats, setViewStats] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user.id || user.role !== 'employer') return;

      try {
        setLoading(true);

        const employerProfile = user.profile || await employerService.getEmployerProfile(user.id);
        setProfile(employerProfile);

        const [jobsData, applicationsData, followersCount, statsData, totalViewsCount] = await Promise.all([
          jobsService.getJobsByEmployer(employerProfile.id),
          applicationsService.getApplicationsByEmployer(employerProfile.id),
          followsService.getFollowersCount(employerProfile.id),
          analyticsService.getViewStats(user.id),
          analyticsService.getTotalViews(user.id)
        ]);

        setViewStats(statsData);

        setJobs(jobsData || []);
        setApplications(applicationsData || []);

        const activeJobsCount = jobsData?.filter((j: any) => j.status === 'active').length || 0;

        setStats({
          totalCandidates: applicationsData?.length || 0,
          activeJobs: activeJobsCount,
          profileViews: totalViewsCount || 0,
          totalApplications: applicationsData?.length || 0,
          followers: followersCount || 0,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user.id, user.role, user.profile]);

  const handleOpenModal = (type: 'candidates' | 'jobs' | 'applications') => {
    setModalType(type);
    setModalOpen(true);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'candidates': return 'All Candidates';
      case 'jobs': return 'Active Jobs';
      case 'applications': return 'All Applications';
      default: return '';
    }
  };

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
            <h1 className="text-h1 font-heading text-foreground mb-2">Employer Dashboard</h1>
            <p className="text-body text-muted-foreground">Manage your recruitment pipeline.</p>
          </div>
          <Button
            onClick={() => navigate('/employer/post-job')}
            className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
          >
            Post New Job
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatsCard
            icon={Users}
            label="Total Applications"
            value={stats.totalApplications}
            color="primary"
            onClick={() => handleOpenModal('applications')}
          />
          <DashboardStatsCard
            icon={Briefcase}
            label="Active Jobs"
            value={stats.activeJobs}
            color="accent"
            onClick={() => handleOpenModal('jobs')}
          />
          <DashboardStatsCard
            icon={Eye}
            label="Profile Views"
            value={stats.profileViews}
            color="info"
            onClick={() => navigate('/employer/profile')}
          />
          <DashboardStatsCard
            icon={Users}
            label="Candidates"
            value={stats.totalCandidates}
            color="success"
            onClick={() => navigate('/candidates')}
          />
          <DashboardStatsCard
            icon={Users}
            label="Followers"
            value={stats.followers}
            color="primary"
            onClick={() => navigate('/employer/network')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <ProfileViewsChart data={viewStats} />
          </div>

          <Card className="p-6 border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3 font-heading text-foreground">Recent Applications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenModal('applications')}
                className="bg-transparent text-primary hover:bg-primary/10 hover:text-primary font-normal"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {applications.length === 0 ? (
                <p className="text-body-sm text-muted-foreground text-center py-4">
                  No applications yet
                </p>
              ) : (
                applications.slice(0, 4).map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/employer/applications/${app.id}`)}>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={app.candidate_profiles?.profiles?.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {app.candidate_profiles?.profiles?.full_name?.charAt(0) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-body-sm font-medium text-foreground">
                          {app.candidate_profiles?.profiles?.full_name || 'Candidate'}
                        </p>
                        <p className="text-caption text-muted-foreground">
                          {app.jobs?.title || 'Position'} • {formatDate(app.applied_at)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/employer/applications/${app.id}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                    >
                      View
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6 border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h3 font-heading text-foreground">Active Job Postings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/employer/jobs')}
                className="bg-transparent text-primary hover:bg-primary/10 hover:text-primary font-normal"
              >
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {jobs.filter(j => j.status === 'active').length === 0 ? (
                <p className="text-body-sm text-muted-foreground text-center py-4">
                  No active jobs yet
                </p>
              ) : (
                jobs.filter(j => j.status === 'active').slice(0, 4).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}>
                    <div>
                      <p className="text-body-sm font-medium text-foreground">{job.title}</p>
                      <p className="text-caption text-muted-foreground">
                        {job.applications_count || 0} applications • Posted {formatDate(job.created_at)}
                      </p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/employer/jobs/${job.id}/edit`);
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                    >
                      Manage
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* KPI Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">{getModalTitle()}</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              {modalType === 'candidates' && 'Browse all candidates through the search page'}
              {modalType === 'jobs' && 'All your active job postings'}
              {modalType === 'applications' && 'All applications received for your job postings'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {modalType === 'candidates' && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-body text-muted-foreground mb-4">
                  Search and browse candidates through the candidate search page
                </p>
                <Button
                  onClick={() => {
                    setModalOpen(false);
                    navigate('/candidates');
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
                >
                  Go to Candidate Search
                </Button>
              </div>
            )}

            {modalType === 'jobs' && (
              <div className="space-y-4">
                {jobs.filter(j => j.status === 'active').length === 0 ? (
                  <p className="text-body-sm text-muted-foreground text-center py-8">
                    No active jobs yet
                  </p>
                ) : (
                  jobs.filter(j => j.status === 'active').map((job) => (
                    <Card
                      key={job.id}
                      className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal cursor-pointer"
                      onClick={() => {
                        setModalOpen(false);
                        navigate(`/employer/jobs/${job.id}/edit`);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-h4 font-heading text-foreground mb-2">{job.title}</h4>
                          <div className="flex flex-wrap gap-3 text-caption text-muted-foreground mb-3">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" strokeWidth={1.5} />
                              {job.location || 'Location not specified'}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" strokeWidth={1.5} />
                              {job.salary_min && job.salary_max
                                ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                                : 'Salary not specified'}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" strokeWidth={1.5} />
                              {job.applications_count || 0} applicants
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" strokeWidth={1.5} />
                              Posted {formatDate(job.created_at)}
                            </div>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-success/10 text-success text-caption rounded-md border border-success/30">
                          Active
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {modalType === 'applications' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground text-center py-8">
                    No applications yet
                  </p>
                ) : (
                  applications.map((app) => (
                    <Card
                      key={app.id}
                      className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal cursor-pointer"
                      onClick={() => {
                        setModalOpen(false);
                        navigate(`/employer/applications/${app.id}`);
                      }}
                    >
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={app.candidate_profiles?.profiles?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {app.candidate_profiles?.profiles?.full_name?.charAt(0) || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-h4 font-heading text-foreground">
                              {app.candidate_profiles?.profiles?.full_name || 'Candidate'}
                            </h4>
                            <span className={`px-2 py-1 text-caption rounded-md border ${app.status === 'accepted' ? 'bg-success/10 text-success border-success/30' :
                              app.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                                'bg-muted text-muted-foreground border-border'
                              }`}>
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-body-sm text-muted-foreground mb-2">
                            Applied for: {app.jobs?.title || 'Position'}
                          </p>
                          <div className="flex flex-wrap gap-3 text-caption text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" strokeWidth={1.5} />
                              {formatDate(app.applied_at)}
                            </div>
                            {app.candidate_profiles?.title && (
                              <div className="flex items-center">
                                <Briefcase className="w-3 h-3 mr-1" strokeWidth={1.5} />
                                {app.candidate_profiles.title}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default EmployerDashboard;
