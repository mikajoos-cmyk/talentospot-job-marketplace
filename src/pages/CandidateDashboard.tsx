import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DashboardStatsCard from '@/components/candidate/DashboardStatsCard';
import ProfileViewsChart from '@/components/candidate/ProfileViewsChart';
import ActivityFeed from '@/components/candidate/ActivityFeed';
import { Briefcase, Eye, Star, CheckCircle } from 'lucide-react';

const CandidateDashboard: React.FC = () => {
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
          <div className="lg:col-span-2">
            <ProfileViewsChart />
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
