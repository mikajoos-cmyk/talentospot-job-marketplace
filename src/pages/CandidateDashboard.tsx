import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardStatsCard from '@/components/candidate/DashboardStatsCard';
import ProfileViewsChart from '@/components/candidate/ProfileViewsChart';
import ActivityFeed from '@/components/candidate/ActivityFeed';
import { Briefcase, Eye, Star, CheckCircle, MapPin, DollarSign, Calendar, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockJobs } from '@/data/mockJobs';
import { mockCompanies } from '@/data/mockCompanies';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Application {
  id: string;
  job: typeof mockJobs[0];
  appliedDate: string;
  status: 'pending' | 'interview' | 'rejected' | 'accepted';
}

const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'applied' | 'reviews' | 'views' | 'shortlisted' | null>(null);
  
  const [stats, setStats] = useState({
    appliedJobs: 0,
    reviews: 0,
    profileViews: 0,
    shortlisted: 0,
  });

  useEffect(() => {
    const targetStats = {
      appliedJobs: 24,
      reviews: 12,
      profileViews: 156,
      shortlisted: 8,
    };

    const duration = 1000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats({
        appliedJobs: Math.floor(targetStats.appliedJobs * progress),
        reviews: Math.floor(targetStats.reviews * progress),
        profileViews: Math.floor(targetStats.profileViews * progress),
        shortlisted: Math.floor(targetStats.shortlisted * progress),
      });

      if (currentStep >= steps) {
        setStats(targetStats);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const mockApplications: Application[] = [
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
  ];

  const mockReviews = [
    { id: '1', company: 'TechCorp', rating: 5, comment: 'Excellent candidate, great communication skills!', date: '2024-01-14' },
    { id: '2', company: 'StartupXYZ', rating: 4, comment: 'Strong technical skills, would recommend.', date: '2024-01-10' },
    { id: '3', company: 'DesignHub', rating: 5, comment: 'Very professional and talented.', date: '2024-01-08' },
  ];

  const mockProfileViews = [
    { id: '1', company: 'TechCorp', companyLogo: mockJobs[0].image, viewedDate: '2024-01-15', jobTitle: 'Senior Frontend Developer' },
    { id: '2', company: 'StartupXYZ', companyLogo: mockJobs[1].image, viewedDate: '2024-01-14', jobTitle: 'Product Manager' },
    { id: '3', company: 'DataCo', companyLogo: mockJobs[3].image, viewedDate: '2024-01-13', jobTitle: 'Backend Engineer' },
  ];

  const mockShortlisted = [
    { id: '1', job: mockJobs[0], shortlistedDate: '2024-01-15' },
    { id: '2', job: mockJobs[1], shortlistedDate: '2024-01-13' },
  ];

  const handleOpenModal = (type: 'applied' | 'reviews' | 'views' | 'shortlisted') => {
    setModalType(type);
    setModalOpen(true);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'applied': return 'Applied Jobs';
      case 'reviews': return 'Reviews';
      case 'views': return 'Profile Views';
      case 'shortlisted': return 'Shortlisted';
      default: return '';
    }
  };

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
            icon={Star}
            label="Reviews"
            value={stats.reviews}
            color="accent"
            onClick={() => handleOpenModal('reviews')}
          />
          <DashboardStatsCard
            icon={Eye}
            label="Profile Views"
            value={stats.profileViews}
            color="info"
            onClick={() => handleOpenModal('views')}
          />
          <DashboardStatsCard
            icon={CheckCircle}
            label="Shortlisted"
            value={stats.shortlisted}
            color="success"
            onClick={() => handleOpenModal('shortlisted')}
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
                {[
                  { job: 'Senior Frontend Developer', company: 'TechCorp', status: 'interview', date: '2 days ago' },
                  { job: 'Product Manager', company: 'StartupXYZ', status: 'pending', date: '5 days ago' },
                  { job: 'UX Designer', company: 'DesignHub', status: 'pending', date: '1 week ago' },
                ].map((app, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex-1">
                      <p className="text-body-sm font-medium text-foreground">{app.job}</p>
                      <p className="text-caption text-muted-foreground">{app.company} • {app.date}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-caption font-medium border ${
                      app.status === 'interview' 
                        ? 'bg-info/10 text-info border-info/30'
                        : 'bg-warning/10 text-warning border-warning/30'
                    }`}>
                      {app.status === 'interview' ? 'Interview' : 'Pending'}
                    </span>
                  </div>
                ))}
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
              {modalType === 'reviews' && 'Reviews from employers'}
              {modalType === 'views' && 'Companies that viewed your profile'}
              {modalType === 'shortlisted' && 'Jobs where you have been shortlisted'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {modalType === 'applied' && (
              <div className="space-y-4">
                {mockApplications.map((application) => (
                  <Card 
                    key={application.id} 
                    className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal cursor-pointer"
                    onClick={() => {
                      setModalOpen(false);
                      navigate(`/jobs/${application.job.id}`);
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={application.job.image}
                        alt={application.job.company}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-h4 font-heading text-foreground mb-1">{application.job.title}</h4>
                        <p className="text-body-sm text-muted-foreground mb-2">{application.job.company}</p>
                        <div className="flex flex-wrap items-center gap-3 text-caption text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            {application.job.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            Applied {new Date(application.appliedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {modalType === 'reviews' && (
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <Card key={review.id} className="p-4 border border-border bg-background">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-body font-medium text-foreground mb-1">{review.company}</h4>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`} 
                              strokeWidth={1.5}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-caption text-muted-foreground">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-body-sm text-foreground italic">"{review.comment}"</p>
                  </Card>
                ))}
              </div>
            )}

            {modalType === 'views' && (
              <div className="space-y-4">
                {mockProfileViews.map((view) => (
                  <Card 
                    key={view.id} 
                    className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal cursor-pointer"
                    onClick={() => {
                      setModalOpen(false);
                      const company = mockCompanies.find(c => c.name === view.company);
                      if (company) navigate(`/companies/${company.id}`);
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={view.companyLogo}
                        alt={view.company}
                        className="w-12 h-12 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <h4 className="text-body font-medium text-foreground mb-1">{view.company}</h4>
                        <p className="text-body-sm text-muted-foreground mb-1">{view.jobTitle}</p>
                        <div className="flex items-center text-caption text-muted-foreground">
                          <Eye className="w-3 h-3 mr-1" strokeWidth={1.5} />
                          Viewed {new Date(view.viewedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {modalType === 'shortlisted' && (
              <div className="space-y-4">
                {mockShortlisted.map((item) => (
                  <Card 
                    key={item.id} 
                    className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal cursor-pointer"
                    onClick={() => {
                      setModalOpen(false);
                      navigate(`/jobs/${item.job.id}`);
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.job.image}
                        alt={item.job.company}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-success/10 text-success text-caption rounded-md border border-success/30">
                            Shortlisted
                          </span>
                        </div>
                        <h4 className="text-h4 font-heading text-foreground mb-1">{item.job.title}</h4>
                        <p className="text-body-sm text-muted-foreground mb-2">{item.job.company}</p>
                        <div className="flex flex-wrap gap-3 text-caption text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            {item.job.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            {item.job.salary}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            {new Date(item.shortlistedDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default CandidateDashboard;
