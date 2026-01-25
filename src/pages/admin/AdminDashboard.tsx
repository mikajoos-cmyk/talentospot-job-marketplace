import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Users, Briefcase, Building2, TrendingUp, Ban } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'employer';
  status: 'active' | 'banned';
  joinedDate: string;
}

const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  const stats = {
    totalUsers: 15342,
    totalJobs: 1248,
    totalCompanies: 5234,
    revenue: 124500,
  };

  const users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'candidate', status: 'active', joinedDate: '2024-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'employer', status: 'active', joinedDate: '2024-01-14' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'candidate', status: 'active', joinedDate: '2024-01-13' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'employer', status: 'banned', joinedDate: '2024-01-12' },
  ];

  const handleBanUser = (userId: string, userName: string) => {
    showToast({
      title: 'User Banned',
      description: `${userName} has been banned from the platform`,
    });
  };

  const handleUnbanUser = (userId: string, userName: string) => {
    showToast({
      title: 'User Unbanned',
      description: `${userName} has been unbanned`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-body text-muted-foreground">Manage platform settings and users.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border border-border bg-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-body-sm text-muted-foreground mb-2">Total Users</p>
                <p className="text-h2 font-heading text-foreground">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                <Users className="w-6 h-6" strokeWidth={1.5} />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border bg-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-body-sm text-muted-foreground mb-2">Total Jobs</p>
                <p className="text-h2 font-heading text-foreground">{stats.totalJobs.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-accent/10 text-accent">
                <Briefcase className="w-6 h-6" strokeWidth={1.5} />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border bg-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-body-sm text-muted-foreground mb-2">Total Companies</p>
                <p className="text-h2 font-heading text-foreground">{stats.totalCompanies.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-info/10 text-info">
                <Building2 className="w-6 h-6" strokeWidth={1.5} />
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border bg-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-body-sm text-muted-foreground mb-2">Revenue</p>
                <p className="text-h2 font-heading text-foreground">€{stats.revenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-success/10 text-success">
                <TrendingUp className="w-6 h-6" strokeWidth={1.5} />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <h2 className="text-h3 font-heading text-foreground mb-6">Platform Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance" className="text-body-sm font-medium text-foreground block mb-1">
                  Maintenance Mode
                </Label>
                <p className="text-caption text-muted-foreground">
                  Temporarily disable access to the platform
                </p>
              </div>
              <Switch
                id="maintenance"
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="registration" className="text-body-sm font-medium text-foreground block mb-1">
                  Registration Open
                </Label>
                <p className="text-caption text-muted-foreground">
                  Allow new users to register
                </p>
              </div>
              <Switch
                id="registration"
                checked={registrationOpen}
                onCheckedChange={setRegistrationOpen}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <h2 className="text-h3 font-heading text-foreground mb-6">User Management</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-body-sm font-medium text-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-body-sm font-medium text-foreground">Email</th>
                  <th className="text-left py-3 px-4 text-body-sm font-medium text-foreground">Role</th>
                  <th className="text-left py-3 px-4 text-body-sm font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-body-sm font-medium text-foreground">Joined</th>
                  <th className="text-left py-3 px-4 text-body-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted transition-colors">
                    <td className="py-3 px-4 text-body-sm text-foreground">{user.name}</td>
                    <td className="py-3 px-4 text-body-sm text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-md text-caption ${
                        user.role === 'employer' 
                          ? 'bg-accent/10 text-accent' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-md text-caption ${
                        user.status === 'active' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-error/10 text-error'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-body-sm text-muted-foreground">
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {user.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBanUser(user.id, user.name)}
                          className="bg-transparent text-error border-error hover:bg-error hover:text-error-foreground font-normal"
                        >
                          <Ban className="w-4 h-4 mr-1" strokeWidth={1.5} />
                          Ban
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnbanUser(user.id, user.name)}
                          className="bg-transparent text-success border-success hover:bg-success hover:text-success-foreground font-normal"
                        >
                          Unban
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
