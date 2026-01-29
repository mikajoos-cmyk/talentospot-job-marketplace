import React from 'react';
import { Card } from '@/components/ui/card';
import { Briefcase, Eye, Star, UserPlus, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Activity {
  id: string;
  type: 'application' | 'view' | 'shortlist' | 'invitation' | 'data_access';
  title: string;
  company: string;
  time: string; // ISO string for sorting and formatting
  raw_data?: any;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'application':
        return <Briefcase className="w-5 h-5 text-primary" strokeWidth={1.5} />;
      case 'view':
        return <Eye className="w-5 h-5 text-info" strokeWidth={1.5} />;
      case 'shortlist':
        return <Star className="w-5 h-5 text-accent" strokeWidth={1.5} />;
      case 'invitation':
        return <UserPlus className="w-5 h-5 text-success" strokeWidth={1.5} />;
      case 'data_access':
        return <FileText className="w-5 h-5 text-warning" strokeWidth={1.5} />;
      default:
        return <Briefcase className="w-5 h-5 text-primary" strokeWidth={1.5} />;
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
      case 'invitation':
        return 'Invited to join';
      case 'data_access':
        return 'Requested data for';
    }
  };

  const formatActivityTime = (time: string) => {
    try {
      const date = new Date(time);
      if (isNaN(date.getTime())) return time;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return time;
    }
  };

  return (
    <Card className="p-6 border border-border bg-card">
      <h3 className="text-h3 font-heading text-foreground mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-body-sm text-muted-foreground text-center py-4">
            No recent activity to show.
          </p>
        ) : (
          activities.map((activity) => (
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
                <p className="text-caption text-muted-foreground mt-1">{formatActivityTime(activity.time)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ActivityFeed;
