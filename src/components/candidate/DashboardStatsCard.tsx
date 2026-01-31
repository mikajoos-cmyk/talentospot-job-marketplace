import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DashboardStatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: 'primary' | 'accent' | 'info' | 'success';
  onClick?: () => void;
}

const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({ icon: Icon, label, value, color, onClick }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    info: 'bg-info/10 text-info',
    success: 'bg-success/10 text-success',
  };

  return (
    <Card
      className={`p-6 border border-border bg-card hover:shadow-lg transition-all duration-normal hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''
        }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-body-sm text-muted-foreground mb-2">{label}</p>
          <p className="text-h2 font-heading text-foreground">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>
    </Card>
  );
};

export default DashboardStatsCard;
