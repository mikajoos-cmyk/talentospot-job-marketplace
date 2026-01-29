import React from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfileViewsChartProps {
  data?: { day: string; views: number }[];
}

const ProfileViewsChart: React.FC<ProfileViewsChartProps> = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { day: 'Mon', views: 0 },
    { day: 'Tue', views: 0 },
    { day: 'Wed', views: 0 },
    { day: 'Thu', views: 0 },
    { day: 'Fri', views: 0 },
    { day: 'Sat', views: 0 },
    { day: 'Sun', views: 0 },
  ];

  return (
    <Card className="p-6 border border-border bg-card">
      <h3 className="text-h3 font-heading text-foreground mb-6">Profile Views</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217, 33%, 50%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(217, 33%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
          <XAxis
            dataKey="day"
            stroke="hsl(220, 9%, 46%)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="hsl(220, 9%, 46%)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(220, 15%, 90%)',
              borderRadius: '8px',
              color: 'hsl(220, 15%, 20%)'
            }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="hsl(217, 33%, 50%)"
            strokeWidth={2}
            fill="url(#colorViews)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ProfileViewsChart;
