import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardStatsCard from '@/components/candidate/DashboardStatsCard';
import ProfileViewsChart from '@/components/candidate/ProfileViewsChart';
import ActivityFeed from '@/components/candidate/ActivityFeed';
import { Briefcase, Eye, Star, CheckCircle, MapPin, Calendar, Building2, Loader2, Users, Mail, Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { applicationsService } from '@/services/applications.service';
import { invitationsService } from '@/services/invitations.service';
import { candidateService } from '@/services/candidate.service';
import { savedJobsService } from '@/services/saved-jobs.service';
import { shortlistsService } from '@/services/shortlists.service';
import { analyticsService } from '@/services/analytics.service';
import { dataAccessService } from '@/services/data-access.service';
import { Activity } from '@/components/candidate/ActivityFeed';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'applied' | 'reviews' | 'views' | 'shortlisted' | 'invitations' | 'saved' | 'requests' | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    appliedJobs: 0,
    reviews: 0,
    profileViews: 0,
    shortlisted: 0,
    invitations: 0,
    savedJobs: 0,
    dataRequests: 0,
  });

  const [applications, setApplications] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [shortlistedBy, setShortlistedBy] = useState<any[]>([]);
  const [dataRequests, setDataRequests] = useState<any[]>([]);
  const [viewStats, setViewStats] = useState<any[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user.id || user.role !== 'candidate') return;

      try {
        setLoading(true);

        const candidateProfile = user.profile || await candidateService.getCandidateProfile(user.id);

        const [appsData, invitationsData, savedJobsData, followersData, requestsData, statsData, totalViewsCount] = await Promise.all([
          applicationsService.getApplicationsByCandidate(candidateProfile.id),
          invitationsService.getInvitationsByCandidate(candidateProfile.id),
          savedJobsService.getSavedJobs(candidateProfile.id),
          shortlistsService.getCompaniesShortlistingCandidate(candidateProfile.id),
          dataAccessService.getRequestsByCandidate(candidateProfile.id),
          analyticsService.getViewStats(user.id),
          analyticsService.getTotalViews(user.id)
        ]);

        setViewStats(statsData);
        setApplications(appsData || []);
        const appliedJobIds = new Set(appsData?.map((app: any) => app.job_id) || []);
        const filteredInvitations = invitationsData?.filter((inv: any) =>
          inv.status === 'pending' && !appliedJobIds.has(inv.job_id)
        ) || [];

        setInvitations(filteredInvitations);
        setSavedJobs(savedJobsData || []);
        setShortlistedBy(followersData || []);
        setDataRequests(requestsData || []);

        setStats({
          appliedJobs: appsData?.length || 0,
          reviews: 0,
          profileViews: totalViewsCount || 0,
          shortlisted: followersData?.length || 0,
          invitations: filteredInvitations.length,
          savedJobs: savedJobsData?.length || 0,
          dataRequests: requestsData?.length || 0,
        });

        // Compute activities
        const allActivities: Activity[] = [
          ...(appsData || []).map((app: any) => ({
            id: `app-${app.id}`,
            type: 'application' as const,
            title: app.jobs?.title || 'Job Application',
            company: app.jobs?.employer_profiles?.company_name || 'Unknown Company',
            time: app.applied_at,
          })),
          ...(invitationsData || []).map((inv: any) => ({
            id: `inv-${inv.id}`,
            type: 'invitation' as const,
            title: inv.jobs?.title || 'Job Invitation',
            company: inv.jobs?.employer_profiles?.company_name || 'Unknown Company',
            time: inv.sent_at || inv.created_at,
          })),
          ...(followersData || []).map((folder: any) => ({
            id: `short-${folder.id}`,
            type: 'shortlist' as const,
            title: 'Candidate Profile',
            company: folder.employer_profiles?.company_name || 'Unknown Company',
            time: folder.created_at,
          })),
          ...(requestsData || []).map((req: any) => ({
            id: `data-${req.id}`,
            type: 'data_access' as const,
            title: 'Personal Data',
            company: req.employer_profiles?.company_name || 'Unknown Company',
            time: req.requested_at,
          })),
        ];

        // Sort by time descending and take most recent 10
        const sortedActivities = allActivities
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 10);

        setActivities(sortedActivities);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user.id, user.role, user.profile]);


  const handleOpenModal = (type: 'applied' | 'reviews' | 'views' | 'shortlisted' | 'invitations' | 'saved' | 'requests') => {
    setModalType(type);
    setModalOpen(true);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'applied': return 'Applied Jobs';
      case 'reviews': return 'Reviews';
      case 'views': return 'Profile Views';
      case 'shortlisted': return 'Shortlisted';
      case 'invitations': return 'Job Invitations';
      case 'saved': return 'Saved Jobs';
      case 'requests': return 'Data Requests';
      default: return '';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning/10 text-warning border-warning/30',
      interview: 'bg-info/10 text-info border-info/30',
      rejected: 'bg-error/10 text-error border-error/30',
      accepted: 'bg-success/10 text-success border-success/30',
    };

    const labels: Record<string, string> = {
      pending: 'Pending',
      interview: 'Interview',
      rejected: 'Rejected',
      accepted: 'Accepted',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-caption font-medium border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 font-heading text-foreground mb-2">Dashboard</h1>
            <p className="text-body text-muted-foreground">Welcome back! Here's your activity overview.</p>
          </div>
          <Button
            onClick={() => navigate('/candidate/alerts')}
            className="bg-primary text-primary-foreground hover:bg-primary-hover flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Job Alarm
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <DashboardStatsCard
            icon={Briefcase}
            label="Applied Jobs"
            value={stats.appliedJobs}
            color="primary"
            onClick={() => handleOpenModal('applied')}
          />
          <DashboardStatsCard
            icon={CheckCircle}
            label="Invitations"
            value={stats.invitations}
            color="success"
            onClick={() => handleOpenModal('invitations')}
          />
          <DashboardStatsCard
            icon={Mail}
            label="Data Requests"
            value={stats.dataRequests}
            color="info"
            onClick={() => handleOpenModal('requests')}
          />
          <DashboardStatsCard
            icon={Eye}
            label="Profile Views"
            value={stats.profileViews}
            color="info"
            onClick={() => handleOpenModal('views')}
          />
          <DashboardStatsCard
            icon={Users}
            label="Shortlisted"
            value={stats.shortlisted}
            color="accent"
            onClick={() => handleOpenModal('shortlisted')}
          />
          <DashboardStatsCard
            icon={Star}
            label="Saved Jobs"
            value={stats.savedJobs || 0}
            color="accent"
            onClick={() => handleOpenModal('saved')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileViewsChart data={viewStats} />

            <Card className="p-6 border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-h3 font-heading text-foreground">Recent Applications</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/candidate/applications')}
                  className="bg-transparent text-primary hover:bg-primary/10 hover:text-primary font-normal"
                >
                  View All
                </Button>
              </div>

              <div className="space-y-3">
                {applications.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground text-center py-4">
                    No applications yet. Start applying to jobs!
                  </p>
                ) : (
                  applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate(`/jobs/${app.job_id}`)}>
                      <div className="flex-1">
                        <p className="text-body-sm font-medium text-foreground">{app.jobs?.title || 'Job Title'}</p>
                        <p className="text-caption text-muted-foreground">
                          {app.jobs?.employer_profiles?.company_name || 'Company'} • {formatDate(app.applied_at)}
                        </p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
          <div>
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>

      {/* KPI Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-h3 font-heading text-foreground">{getModalTitle()}</DialogTitle>
                <DialogDescription className="text-body text-muted-foreground">
                  {modalType === 'applied' && 'All jobs you have applied to'}
                  {modalType === 'invitations' && 'Job invitations from employers'}
                  {modalType === 'saved' && 'Jobs you have saved for later'}
                  {modalType === 'views' && 'Your profile visibility over the last 14 days'}
                  {modalType === 'shortlisted' && 'Companies that have shortlisted you'}
                  {modalType === 'requests' && 'Employer requests for your personal data'}
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                {modalType === 'views' && (
                  <Button onClick={() => { setModalOpen(false); navigate('/candidate/profile'); }} size="sm" variant="outline">
                    View Profile
                  </Button>
                )}
                {modalType === 'shortlisted' && (
                  <Button onClick={() => { setModalOpen(false); navigate('/candidate/network'); }} size="sm" variant="outline">
                    View Network
                  </Button>
                )}
                {modalType === 'requests' && (
                  <Button onClick={() => { setModalOpen(false); navigate('/candidate/messages'); }} size="sm" variant="outline">
                    View Messages
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            {modalType === 'applied' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground text-center py-8">
                    No applications yet
                  </p>
                ) : (
                  applications.map((application) => (
                    <Card
                      key={application.id}
                      className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal cursor-pointer"
                      onClick={() => {
                        setModalOpen(false);
                        navigate(`/jobs/${application.job_id}`);
                      }}
                    >
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12 rounded-lg">
                          <AvatarImage src={application.jobs?.employer_profiles?.logo_url || ''} className="object-cover" />
                          <AvatarFallback className="rounded-lg">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-h4 font-heading text-foreground mb-1">
                            {application.jobs?.title || 'Job Title'}
                          </h4>
                          <p className="text-body-sm text-muted-foreground mb-2">
                            {application.jobs?.employer_profiles?.company_name || 'Company'}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-caption text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" strokeWidth={1.5} />
                              {application.jobs?.city || 'Location'}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" strokeWidth={1.5} />
                              Applied {formatDate(application.applied_at)}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {modalType === 'invitations' && (
              <div className="space-y-4">
                {(() => {
                  const appliedJobIds = new Set(applications.map(app => app.job_id));
                  const pendingInvitations = invitations.filter((i: any) => i.status === 'pending' && !appliedJobIds.has(i.job_id));

                  if (pendingInvitations.length === 0) {
                    return (
                      <p className="text-body-sm text-muted-foreground text-center py-8">
                        No invitations yet
                      </p>
                    );
                  }

                  return pendingInvitations.map((invitation) => (
                    <Card
                      key={invitation.id}
                      className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal"
                    >
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12 rounded-lg">
                          <AvatarImage src={invitation.jobs?.employer_profiles?.logo_url || ''} className="object-cover" />
                          <AvatarFallback className="rounded-lg">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusBadge(invitation.status)}
                          </div>
                          <h4 className="text-h4 font-heading text-foreground mb-1">
                            {invitation.jobs?.title || 'Job Title'}
                          </h4>
                          <p className="text-body-sm text-muted-foreground mb-2">
                            {invitation.jobs?.employer_profiles?.company_name || 'Company'}
                          </p>
                          {invitation.message && (
                            <p className="text-body-sm text-foreground italic mb-2">
                              "{invitation.message}"
                            </p>
                          )}
                          <div className="flex flex-wrap gap-3 text-caption text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" strokeWidth={1.5} />
                              {formatDate(invitation.sent_at || invitation.created_at || new Date().toISOString())}
                            </div>
                          </div>
                          {invitation.status === 'pending' && (
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => navigate('/candidate/invitations')}
                                className="bg-primary text-primary-foreground hover:bg-primary-hover"
                              >
                                View Details
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                })()}
              </div>
            )}

            {modalType === 'saved' && (
              <div className="space-y-4">
                {savedJobs.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground text-center py-8">
                    No saved jobs yet
                  </p>
                ) : (
                  savedJobs.map((saved) => (
                    <Card
                      key={saved.id}
                      className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal cursor-pointer"
                      onClick={() => {
                        setModalOpen(false);
                        navigate(`/jobs/${saved.job_id}`);
                      }}
                    >
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-12 h-12 rounded-lg">
                          <AvatarImage src={saved.jobs?.employer_profiles?.logo_url || ''} className="object-cover" />
                          <AvatarFallback className="rounded-lg">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-h4 font-heading text-foreground mb-1">
                            {saved.jobs?.title || 'Job Title'}
                          </h4>
                          <p className="text-body-sm text-muted-foreground mb-2">
                            {saved.jobs?.employer_profiles?.company_name || 'Company'}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-caption text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" strokeWidth={1.5} />
                              {saved.jobs?.city || 'Location'}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" strokeWidth={1.5} />
                              Saved {formatDate(saved.saved_at)}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/jobs/${saved.job_id}`);
                          }}
                        >
                          View Job
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {modalType === 'views' && (
              <div className="space-y-6">
                <ProfileViewsChart data={viewStats} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="p-4 bg-background border-border">
                    <p className="text-caption text-muted-foreground mb-1">Total Views</p>
                    <p className="text-h3 font-heading text-foreground">{stats.profileViews}</p>
                  </Card>
                </div>
              </div>
            )}

            {modalType === 'shortlisted' && (
              <div className="space-y-4">
                {shortlistedBy.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground text-center py-8">
                    No companies have shortlisted you yet
                  </p>
                ) : (
                  shortlistedBy.map((item) => (
                    <Card
                      key={item.id}
                      className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal cursor-pointer"
                      onClick={() => {
                        setModalOpen(false);
                        navigate(`/employer-profile/${item.employer_id}`);
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12 rounded-lg">
                          <AvatarImage src={item.employer_profiles?.logo_url || ''} className="object-cover" />
                          <AvatarFallback className="rounded-lg">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="text-body font-heading text-foreground">
                            {item.employer_profiles?.company_name || 'Employer'}
                          </h4>
                          <p className="text-caption text-muted-foreground">
                            Shortlisted {formatDate(item.created_at)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {modalType === 'requests' && (
              <div className="space-y-4">
                {dataRequests.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground text-center py-8">
                    No data requests yet
                  </p>
                ) : (
                  dataRequests.map((req) => (
                    <Card
                      key={req.id}
                      className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal cursor-pointer"
                      onClick={() => {
                        setModalOpen(false);
                        navigate('/candidate/messages');
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12 rounded-lg">
                          <AvatarImage src={req.employer_profiles?.logo_url || ''} className="object-cover" />
                          <AvatarFallback className="rounded-lg">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="text-body font-heading text-foreground">
                            {req.employer_profiles?.company_name || 'Employer'}
                          </h4>
                          <p className="text-body-sm text-muted-foreground">
                            {req.status === 'pending' ? 'Requested' : req.status.charAt(0).toUpperCase() + req.status.slice(1)} access to your profile
                          </p>
                          <p className="text-caption text-muted-foreground">
                            {formatDate(req.requested_at)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-caption rounded-md border ${req.status === 'granted' ? 'bg-success/10 text-success border-success/30' :
                          req.status === 'denied' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                            'bg-warning/10 text-warning border-warning/30'
                          }`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
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

export default CandidateDashboard;
