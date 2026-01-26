import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardStatsCard from '@/components/candidate/DashboardStatsCard';
import ProfileViewsChart from '@/components/candidate/ProfileViewsChart';
import ActivityFeed from '@/components/candidate/ActivityFeed';
import { Briefcase, Eye, Star, CheckCircle, MapPin, DollarSign, Calendar, Building2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { applicationsService } from '@/services/applications.service';
import { invitationsService } from '@/services/invitations.service';
import { candidateService } from '@/services/candidate.service';
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
  const [modalType, setModalType] = useState<'applied' | 'reviews' | 'views' | 'shortlisted' | 'invitations' | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    appliedJobs: 0,
    reviews: 0,
    profileViews: 0,
    shortlisted: 0,
    invitations: 0,
  });

  const [applications, setApplications] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user.id || user.role !== 'candidate') return;

      try {
        setLoading(true);

        const candidateProfile = user.profile || await candidateService.getCandidateProfile(user.id);
        setProfile(candidateProfile);

        const [appsData, invitationsData] = await Promise.all([
          applicationsService.getApplicationsByCandidate(candidateProfile.id),
          invitationsService.getInvitationsByCandidate(candidateProfile.id),
        ]);

        setApplications(appsData || []);
        setInvitations(invitationsData || []);

        setStats({
          appliedJobs: appsData?.length || 0,
          reviews: 0,
          profileViews: candidateProfile?.profile_views || 0,
          shortlisted: 0,
          invitations: invitationsData?.filter((inv: any) => inv.status === 'pending').length || 0,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user.id, user.role, user.profile]);


  const handleOpenModal = (type: 'applied' | 'reviews' | 'views' | 'shortlisted' | 'invitations') => {
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
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Dashboard</h1>
          <p className="text-body text-muted-foreground">Welcome back! Here's your activity overview.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
            icon={Eye}
            label="Profile Views"
            value={stats.profileViews}
            color="info"
            onClick={() => navigate('/candidate/profile')}
          />
          <DashboardStatsCard
            icon={Star}
            label="Saved Jobs"
            value={0}
            color="accent"
            onClick={() => navigate('/candidate/saved-jobs')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileViewsChart />
            
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
            <ActivityFeed />
          </div>
        </div>
      </div>

      {/* KPI Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-h3 font-heading text-foreground">{getModalTitle()}</DialogTitle>
            <DialogDescription className="text-body text-muted-foreground">
              {modalType === 'applied' && 'All jobs you have applied to'}
              {modalType === 'invitations' && 'Job invitations from employers'}
            </DialogDescription>
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
                        <Building2 className="w-12 h-12 text-muted-foreground" />
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
                {invitations.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground text-center py-8">
                    No invitations yet
                  </p>
                ) : (
                  invitations.map((invitation) => (
                    <Card
                      key={invitation.id}
                      className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal"
                    >
                      <div className="flex items-start space-x-4">
                        <Building2 className="w-12 h-12 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 text-caption rounded-md border ${
                              invitation.status === 'pending'
                                ? 'bg-warning/10 text-warning border-warning/30'
                                : invitation.status === 'accepted'
                                ? 'bg-success/10 text-success border-success/30'
                                : 'bg-error/10 text-error border-error/30'
                            }`}>
                              {invitation.status}
                            </span>
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
                              {formatDate(invitation.sent_at)}
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
