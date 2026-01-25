import React from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProfileViewsChart: React.FC = () => {
  const data = [
    { day: 'Mon', views: 45 },
    { day: 'Tue', views: 52 },
    { day: 'Wed', views: 38 },
    { day: 'Thu', views: 65 },
    { day: 'Fri', views: 72 },
    { day: 'Sat', views: 48 },
    { day: 'Sun', views: 55 },
    { day: 'Mon', views: 62 },
    { day: 'Tue', views: 58 },
    { day: 'Wed', views: 70 },
    { day: 'Thu', views: 68 },
    { day: 'Fri', views: 75 },
    { day: 'Sat', views: 52 },
    { day: 'Sun', views: 60 },
  ];

  return (
    <Card className="p-6 border border-border bg-card">
      <h3 className="text-h3 font-heading text-foreground mb-6">Profile Views</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(330, 95%, 67%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(330, 95%, 67%)" stopOpacity={0} />
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
            stroke="hsl(330, 95%, 67%)" 
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
