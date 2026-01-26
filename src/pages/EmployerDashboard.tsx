import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardStatsCard from '@/components/candidate/DashboardStatsCard';
import { Users, Briefcase, Eye, CheckCircle, MapPin, DollarSign, Calendar, Mail, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockCandidates } from '@/data/mockCandidates';
import { mockJobs } from '@/data/mockJobs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface JobWithApplicants {
  id: string;
  title: string;
  location: string;
  salary: string;
  applicants: number;
  status: 'active' | 'draft' | 'closed';
}

const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'candidates' | 'jobs' | 'views' | 'hired' | null>(null);
  
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    profileViews: 0,
    hiredCandidates: 0,
  });

  useEffect(() => {
    const targetStats = {
      totalCandidates: 342,
      activeJobs: 12,
      profileViews: 1248,
      hiredCandidates: 28,
    };

    const duration = 1000;
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats({
        totalCandidates: Math.floor(targetStats.totalCandidates * progress),
        activeJobs: Math.floor(targetStats.activeJobs * progress),
        profileViews: Math.floor(targetStats.profileViews * progress),
        hiredCandidates: Math.floor(targetStats.hiredCandidates * progress),
      });

      if (currentStep >= steps) {
        setStats(targetStats);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const mockActiveJobs: JobWithApplicants[] = [
    { id: '1', title: 'Senior Frontend Developer', location: 'New York, NY', salary: '$100k - $140k', applicants: 24, status: 'active' },
    { id: '2', title: 'Product Manager', location: 'San Francisco, CA', salary: '$120k - $160k', applicants: 18, status: 'active' },
    { id: '3', title: 'UX Designer', location: 'Austin, TX', salary: '$80k - $110k', applicants: 15, status: 'active' },
  ];

  const mockCompanyViews = [
    { id: '1', candidate: mockCandidates[0], viewedDate: '2024-01-15' },
    { id: '2', candidate: mockCandidates[1], viewedDate: '2024-01-14' },
    { id: '3', candidate: mockCandidates[2], viewedDate: '2024-01-13' },
  ];

  const mockHiredCandidates = [
    { id: '1', candidate: mockCandidates[0], jobTitle: 'Senior Frontend Developer', hiredDate: '2024-01-10' },
    { id: '2', candidate: mockCandidates[1], jobTitle: 'Product Manager', hiredDate: '2024-01-08' },
  ];

  const handleOpenModal = (type: 'candidates' | 'jobs' | 'views' | 'hired') => {
    setModalType(type);
    setModalOpen(true);
  };

  const getModalTitle = () => {
    switch (modalType) {
      case 'candidates': return 'All Candidates';
      case 'jobs': return 'Active Jobs';
      case 'views': return 'Profile Views';
      case 'hired': return 'Hired Candidates';
      default: return '';
    }
  };

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
            label="Total Candidates"
            value={stats.totalCandidates}
            color="primary"
            onClick={() => handleOpenModal('candidates')}
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
            onClick={() => handleOpenModal('views')}
          />
          <DashboardStatsCard
            icon={CheckCircle}
            label="Hired"
            value={stats.hiredCandidates}
            color="success"
            onClick={() => handleOpenModal('hired')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border border-border bg-card">
            <h3 className="text-h3 font-heading text-foreground mb-4">Recent Applications</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      JD
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-foreground">John Doe</p>
                      <p className="text-caption text-muted-foreground">Senior Developer</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate(`/employer/applications/${i}`)}
                    variant="outline" 
                    size="sm" 
                    className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border border-border bg-card">
            <h3 className="text-h3 font-heading text-foreground mb-4">Active Job Postings</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors duration-200">
                  <div>
                    <p className="text-body-sm font-medium text-foreground">Senior Frontend Developer</p>
                    <p className="text-caption text-muted-foreground">24 applications</p>
                  </div>
                  <Button 
                    onClick={() => navigate(`/employer/jobs/${i}/edit`)}
                    variant="outline" 
                    size="sm" 
                    className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
                  >
                    Manage
                  </Button>
                </div>
              ))}
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
              {modalType === 'candidates' && 'Browse all candidates in the platform'}
              {modalType === 'jobs' && 'All your active job postings'}
              {modalType === 'views' && 'Candidates who viewed your company profile'}
              {modalType === 'hired' && 'Successfully hired candidates'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {modalType === 'candidates' && (
              <div className="space-y-4">
                {mockCandidates.slice(0, 6).map((candidate) => (
                  <Card 
                    key={candidate.id} 
                    className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal cursor-pointer"
                    onClick={() => {
                      setModalOpen(false);
                      navigate(`/employer/candidates/${candidate.id}`);
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={candidate.avatar} alt={candidate.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {candidate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        {candidate.isRefugee && (
                          <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-caption rounded-md mb-1">
                            Refugee/Immigrant
                          </span>
                        )}
                        <h4 className="text-h4 font-heading text-foreground mb-1">{candidate.name}</h4>
                        <p className="text-body-sm text-muted-foreground mb-2">{candidate.title}</p>
                        <div className="flex flex-wrap gap-3 text-caption text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            {candidate.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            ${candidate.salary.min.toLocaleString()} - ${candidate.salary.max.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {modalType === 'jobs' && (
              <div className="space-y-4">
                {mockActiveJobs.map((job) => (
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
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            {job.salary}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            {job.applicants} applicants
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-success/10 text-success text-caption rounded-md border border-success/30">
                        Active
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {modalType === 'views' && (
              <div className="space-y-4">
                {mockCompanyViews.map((view) => (
                  <Card 
                    key={view.id} 
                    className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal cursor-pointer"
                    onClick={() => {
                      setModalOpen(false);
                      navigate(`/employer/candidates/${view.candidate.id}`);
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={view.candidate.avatar} alt={view.candidate.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {view.candidate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="text-body font-medium text-foreground mb-1">{view.candidate.name}</h4>
                        <p className="text-body-sm text-muted-foreground mb-1">{view.candidate.title}</p>
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

            {modalType === 'hired' && (
              <div className="space-y-4">
                {mockHiredCandidates.map((item) => (
                  <Card 
                    key={item.id} 
                    className="p-4 border border-border bg-background hover:shadow-md transition-all duration-normal cursor-pointer"
                    onClick={() => {
                      setModalOpen(false);
                      navigate(`/employer/candidates/${item.candidate.id}`);
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={item.candidate.avatar} alt={item.candidate.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {item.candidate.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-success/10 text-success text-caption rounded-md border border-success/30">
                            Hired
                          </span>
                        </div>
                        <h4 className="text-h4 font-heading text-foreground mb-1">{item.candidate.name}</h4>
                        <p className="text-body-sm text-muted-foreground mb-2">Hired for: {item.jobTitle}</p>
                        <div className="flex flex-wrap gap-3 text-caption text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            {item.candidate.location}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            {new Date(item.hiredDate).toLocaleDateString()}
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

export default EmployerDashboard;
