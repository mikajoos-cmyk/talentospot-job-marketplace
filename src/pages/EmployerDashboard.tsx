import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardStatsCard from '@/components/candidate/DashboardStatsCard';
import { Users, Briefcase, Eye, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
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

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-h1 font-heading text-foreground mb-2">Employer Dashboard</h1>
            <p className="text-body text-muted-foreground">Manage your recruitment pipeline.</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal">
            Post New Job
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardStatsCard
            icon={Users}
            label="Total Candidates"
            value={stats.totalCandidates}
            color="primary"
          />
          <DashboardStatsCard
            icon={Briefcase}
            label="Active Jobs"
            value={stats.activeJobs}
            color="accent"
          />
          <DashboardStatsCard
            icon={Eye}
            label="Profile Views"
            value={stats.profileViews}
            color="info"
          />
          <DashboardStatsCard
            icon={CheckCircle}
            label="Hired"
            value={stats.hiredCandidates}
            color="success"
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
                  <Button variant="outline" size="sm" className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal">
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default EmployerDashboard;
