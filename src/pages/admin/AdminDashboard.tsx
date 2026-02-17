import React, { useState, useEffect, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Briefcase, Package, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, subDays, startOfDay, isAfter, parseISO, eachDayOfInterval, subMonths, subYears, startOfMonth, eachMonthOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';

type TimeRange = '7d' | '30d' | '12m' | 'all';

const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalEmployers: 0,
    totalJobs: 0,
    activeSubscriptions: 0,
    revenue: 0,
  });

  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch General Stats
        // Candidates (profiles with role='candidate')
        const { count: candidateCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'candidate');

        // Employers (profiles with role='employer')
        const { count: employerCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'employer');
        
        // Jobs
        const { count: jobCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });

        // Subscriptions (Active & Paid)
        const { data: activePaidSubs, error: subsError } = await supabase
          .from('subscriptions')
          .select('id, packages!inner(price_amount)')
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .gt('packages.price_amount', 0);

        if (subsError) throw subsError;

        // Total Revenue (Sum of all paid subscriptions ever – excluding cancelled)
        const { data: allPaidSubs, error: allPaidError } = await supabase
          .from('subscriptions')
          .select('id, packages!inner(price_amount)')
          .not('status', 'eq', 'cancelled')
          .gt('packages.price_amount', 0);

        if (allPaidError) throw allPaidError;

        const totalRevenue = allPaidSubs?.reduce((acc: number, sub: any) => {
          const pkg = (sub as any).packages as any;
          return acc + (pkg?.price_amount || 0);
        }, 0) || 0;

        setStats({
          totalCandidates: candidateCount || 0,
          totalEmployers: employerCount || 0,
          totalJobs: jobCount || 0,
          activeSubscriptions: activePaidSubs?.length || 0,
          revenue: totalRevenue
        });

        // 2. Fetch Historical Data for Charts
        await fetchHistoricalData();

      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const fetchHistoricalData = async () => {
    // Determine start date based on timeRange
    let startDate = subDays(new Date(), 30);
    let interval: 'day' | 'month' = 'day';

    if (timeRange === '7d') startDate = subDays(new Date(), 7);
    else if (timeRange === '30d') startDate = subDays(new Date(), 30);
    else if (timeRange === '12m') {
      startDate = subMonths(new Date(), 12);
      interval = 'month';
    }
    else if (timeRange === 'all') {
      startDate = new Date(2024, 0, 1); // Project start or earlier
      interval = 'month';
    }

    const startDateStr = startDate.toISOString();

    // Fetch all relevant entities created after startDate
    const [jobsRes, profilesRes, employersRes, subsRes] = await Promise.all([
      supabase.from('jobs').select('created_at').gt('created_at', startDateStr),
      supabase.from('profiles').select('created_at').eq('role', 'candidate').gt('created_at', startDateStr),
      supabase.from('profiles').select('created_at').eq('role', 'employer').gt('created_at', startDateStr),
      supabase.from('subscriptions').select('created_at, packages!inner(price_amount)').gt('created_at', startDateStr).gt('packages.price_amount', 0)
    ]);

    // Process data into intervals
    let chartData: any[] = [];

    if (interval === 'day') {
      const days = eachDayOfInterval({ start: startDate, end: new Date() });
      chartData = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayLabel = format(day, 'dd. MMM', { locale: de });
        
        return {
          name: dayLabel,
          fullDate: dateStr,
          jobs: jobsRes.data?.filter(i => i.created_at.startsWith(dateStr)).length || 0,
          candidates: profilesRes.data?.filter(i => i.created_at.startsWith(dateStr)).length || 0,
          employers: employersRes.data?.filter(i => i.created_at.startsWith(dateStr)).length || 0,
          subs: subsRes.data?.filter(i => i.created_at.startsWith(dateStr)).length || 0,
          revenue: subsRes.data?.filter(i => i.created_at.startsWith(dateStr)).reduce((acc, i) => acc + ((i.packages as any).price_amount || 0), 0) || 0
        };
      });
    } else {
      const months = eachMonthOfInterval({ start: startDate, end: new Date() });
      chartData = months.map(month => {
        const monthKey = format(month, 'yyyy-MM');
        const monthLabel = format(month, 'MMM yy', { locale: de });
        
        return {
          name: monthLabel,
          jobs: jobsRes.data?.filter(i => i.created_at.startsWith(monthKey)).length || 0,
          candidates: profilesRes.data?.filter(i => i.created_at.startsWith(monthKey)).length || 0,
          employers: employersRes.data?.filter(i => i.created_at.startsWith(monthKey)).length || 0,
          subs: subsRes.data?.filter(i => i.created_at.startsWith(monthKey)).length || 0,
          revenue: subsRes.data?.filter(i => i.created_at.startsWith(monthKey)).reduce((acc, i) => acc + ((i.packages as any).price_amount || 0), 0) || 0
        };
      });
    }

    setHistoricalData(chartData);
  };

  return (
      <AppLayout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Plattform-Statistiken und Analyse.</p>
            </div>
            
            <div className="flex items-center gap-2 bg-card p-1 rounded-lg border border-border">
              <Calendar className="w-4 h-4 ml-2 text-muted-foreground" />
              <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="w-full">
                <TabsList className="grid grid-cols-4 w-[300px]">
                  <TabsTrigger value="7d">7T</TabsTrigger>
                  <TabsTrigger value="30d">30T</TabsTrigger>
                  <TabsTrigger value="12m">12M</TabsTrigger>
                  <TabsTrigger value="all">Alle</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatsCard 
              title="Kandidaten" 
              value={stats.totalCandidates} 
              icon={<Users className="w-4 h-4 text-blue-500"/>} 
              description="Gesamtanzahl Talente"
            />
            <StatsCard 
              title="Arbeitgeber" 
              value={stats.totalEmployers} 
              icon={<Users className="w-4 h-4 text-pink-500"/>} 
              description="Registrierte Firmen"
            />
            <StatsCard 
              title="Aktive Jobs" 
              value={stats.totalJobs} 
              icon={<Briefcase className="w-4 h-4 text-green-500"/>} 
              description="Aktuell online"
            />
            <StatsCard 
              title="Premium Subs" 
              value={stats.activeSubscriptions} 
              icon={<Package className="w-4 h-4 text-purple-500"/>} 
              description="Aktive Bezahl-Abos"
            />
            <StatsCard 
              title="Umsatz" 
              value={`€${stats.revenue.toLocaleString('de-DE')}`} 
              icon={<TrendingUp className="w-4 h-4 text-orange-500"/>} 
              description="Gesamtumsatz (Brutto)"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard 
              title="Talent & Employer Wachstum" 
              data={historicalData} 
              lines={[
                { key: 'candidates', color: '#3b82f6', name: 'Talente' },
                { key: 'employers', color: '#ec4899', name: 'Arbeitgeber' }
              ]} 
            />
            <ChartCard 
              title="Job Wachstum" 
              data={historicalData} 
              lines={[
                { key: 'jobs', color: '#10b981', name: 'Jobs' }
              ]} 
            />
            <ChartCard 
              title="Umsatzentwicklung" 
              data={historicalData} 
              type="area"
              lines={[
                { key: 'revenue', color: '#f97316', name: 'Umsatz (€)' }
              ]} 
            />
            <ChartCard 
              title="Neue Premium-Abos" 
              data={historicalData} 
              lines={[
                { key: 'subs', color: '#a855f7', name: 'Abonnements' }
              ]} 
            />
          </div>
        </div>
      </AppLayout>
  );
};

const StatsCard = ({ title, value, icon, description }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-muted rounded-md">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
);

const ChartCard = ({ title, data, lines, type = 'line' }: any) => (
  <Card className="col-span-1">
    <CardHeader>
      <CardTitle className="text-base font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent className="h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#888888' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#888888' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            {lines.map((line: any) => (
              <Line 
                key={line.key}
                type="monotone" 
                dataKey={line.key} 
                name={line.name}
                stroke={line.color} 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        ) : (
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
             <defs>
              {lines.map((line: any) => (
                <linearGradient key={`grad-${line.key}`} id={`color${line.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={line.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={line.color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#888888' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#888888' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
            {lines.map((line: any) => (
              <Area 
                key={line.key}
                type="monotone" 
                dataKey={line.key} 
                name={line.name}
                stroke={line.color} 
                dot={false}
                activeDot={{ r: 4 }}
                fillOpacity={1} 
                fill={`url(#color${line.key})`}
              />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

export default AdminDashboard;