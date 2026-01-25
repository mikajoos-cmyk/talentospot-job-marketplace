import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import DashboardStatsCard from '@/components/candidate/DashboardStatsCard';
import ProfileViewsChart from '@/components/candidate/ProfileViewsChart';
import ActivityFeed from '@/components/candidate/ActivityFeed';
import { Briefcase, Eye, Star, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CandidateDashboard: React.FC = () => {
  const navigate = useNavigate();
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
          />
          <DashboardStatsCard
            icon={Star}
            label="Reviews"
            value={stats.reviews}
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
            label="Shortlisted"
            value={stats.shortlisted}
            color="success"
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
    </AppLayout>
  );
};

export default CandidateDashboard;
