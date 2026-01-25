import React from 'react';
import { Card } from '@/components/ui/card';
import { Briefcase, Eye, Star } from 'lucide-react';

interface Activity {
  id: string;
  type: 'application' | 'view' | 'shortlist';
  title: string;
  company: string;
  time: string;
}

const ActivityFeed: React.FC = () => {
  const activities: Activity[] = [
    { id: '1', type: 'application', title: 'Senior Developer', company: 'TechCorp', time: '2 hours ago' },
    { id: '2', type: 'view', title: 'Product Manager', company: 'StartupXYZ', time: '5 hours ago' },
    { id: '3', type: 'shortlist', title: 'UX Designer', company: 'DesignHub', time: '1 day ago' },
    { id: '4', type: 'application', title: 'Frontend Engineer', company: 'WebSolutions', time: '2 days ago' },
    { id: '5', type: 'view', title: 'Data Analyst', company: 'DataCo', time: '3 days ago' },
  ];

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'application':
        return <Briefcase className="w-5 h-5 text-primary" strokeWidth={1.5} />;
      case 'view':
        return <Eye className="w-5 h-5 text-info" strokeWidth={1.5} />;
      case 'shortlist':
        return <Star className="w-5 h-5 text-accent" strokeWidth={1.5} />;
    }
  };

  const getLabel = (type: Activity['type']) => {
    switch (type) {
      case 'application':
        return 'Applied to';
      case 'view':
        return 'Viewed by';
      case 'shortlist':
        return 'Shortlisted for';
    }
  };

  return (
    <Card className="p-6 border border-border bg-card">
      <h3 className="text-h3 font-heading text-foreground mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted transition-colors duration-200 cursor-pointer"
          >
            <div className="mt-1">{getIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm text-foreground font-medium truncate">{activity.title}</p>
              <p className="text-caption text-muted-foreground">
                {getLabel(activity.type)} {activity.company}
              </p>
              <p className="text-caption text-muted-foreground mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ActivityFeed;
