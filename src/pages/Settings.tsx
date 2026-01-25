import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, switchRole, logout } = useUser();
  const { showToast } = useToast();

  const handleSaveSettings = () => {
    showToast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated successfully',
    });
  };

  const handleRoleSwitch = () => {
    const newRole = user.role === 'candidate' ? 'employer' : 'candidate';
    switchRole(newRole);
    showToast({
      title: 'Role Switched',
      description: `You are now viewing as ${newRole}`,
    });
  };

  const handleLogout = () => {
    logout();
    showToast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-h1 font-heading text-foreground mb-2">Settings</h1>
          <p className="text-body text-muted-foreground">Manage your account preferences and settings.</p>
        </div>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <h2 className="text-h3 font-heading text-foreground mb-6">Account Information</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-body-sm font-medium text-foreground mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  defaultValue={user.name}
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-body-sm font-medium text-foreground mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email}
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-body-sm font-medium text-foreground mb-2 block">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className="bg-background text-foreground border-border"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <h2 className="text-h3 font-heading text-foreground mb-6">Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm font-medium text-foreground">Email Notifications</p>
                <p className="text-caption text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator className="bg-border" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm font-medium text-foreground">Job Alerts</p>
                <p className="text-caption text-muted-foreground">Get notified about new opportunities</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator className="bg-border" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm font-medium text-foreground">Application Updates</p>
                <p className="text-caption text-muted-foreground">Track your application status</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <h2 className="text-h3 font-heading text-foreground mb-6">Privacy</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm font-medium text-foreground">Profile Visibility</p>
                <p className="text-caption text-muted-foreground">Make your profile visible to employers</p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator className="bg-border" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm font-medium text-foreground">Show Activity Status</p>
                <p className="text-caption text-muted-foreground">Let others see when you're active</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <h2 className="text-h3 font-heading text-foreground mb-6">Demo Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm font-medium text-foreground">Current Role</p>
                <p className="text-caption text-muted-foreground capitalize">
                  You are viewing as {user.role}
                </p>
              </div>
              <Button 
                onClick={handleRoleSwitch}
                variant="outline"
                className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
              >
                Switch to {user.role === 'candidate' ? 'Employer' : 'Candidate'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 border border-error/20 bg-error/5">
          <h2 className="text-h3 font-heading text-foreground mb-6">Danger Zone</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm font-medium text-foreground">Logout</p>
              <p className="text-caption text-muted-foreground">
                Sign out of your account
              </p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="bg-transparent text-error border-error hover:bg-error hover:text-error-foreground font-normal"
            >
              Logout
            </Button>
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline"
            className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSettings}
            className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
