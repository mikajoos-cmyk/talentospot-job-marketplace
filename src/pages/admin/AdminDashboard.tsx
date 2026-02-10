import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Briefcase, Package, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    activeSubscriptions: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      // Beispielhafte Abfragen - müsste an echte DB angepasst werden
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
      const { count: subCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');

      setStats({
        totalUsers: userCount || 0,
        totalJobs: jobCount || 0,
        activeSubscriptions: subCount || 0,
        revenue: 125000 // Mock-Wert oder komplexe Calculation
      });
    };
    fetchStats();
  }, []);

  return (
      <AppLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard Übersicht</h1>
            <p className="text-muted-foreground">Willkommen im Admin-Bereich.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Users" value={stats.totalUsers} icon={<Users className="w-4 h-4 text-muted-foreground"/>} />
            <StatsCard title="Active Jobs" value={stats.totalJobs} icon={<Briefcase className="w-4 h-4 text-muted-foreground"/>} />
            <StatsCard title="Active Subs" value={stats.activeSubscriptions} icon={<Package className="w-4 h-4 text-muted-foreground"/>} />
            <StatsCard title="Revenue (Est.)" value={`€${stats.revenue.toLocaleString()}`} icon={<TrendingUp className="w-4 h-4 text-muted-foreground"/>} />
          </div>
        </div>
      </AppLayout>
  );
};

const StatsCard = ({ title, value, icon }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
);

export default AdminDashboard;