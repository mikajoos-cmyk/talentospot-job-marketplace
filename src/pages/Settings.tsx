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

import { authService } from '@/services/auth.service';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useUser();
  const { showToast } = useToast();

  // Settings state
  const [isVisible, setIsVisible] = React.useState(user.isVisible ?? true);
  const [showActivity, setShowActivity] = React.useState(user.showActivityStatus ?? true);
  const [loading, setLoading] = React.useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  React.useEffect(() => {
    setIsVisible(user.isVisible ?? true);
    setShowActivity(user.showActivityStatus ?? true);
  }, [user]);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await authService.updateProfile(user.id, {
        is_visible: isVisible,
        show_activity_status: showActivity
      });
      await refreshUser();

      showToast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated successfully',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    showToast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });
    navigate('/');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      showToast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await authService.updatePassword(newPassword);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      showToast({
        title: 'Password Updated',
        description: 'Your password has been changed successfully',
      });
    } catch (error) {
      showToast({
        title: 'Error',
        description: 'Failed to update password. Please check your credentials.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      try {
        setLoading(true);
        await authService.deleteAccount();
        await logout();

        showToast({
          title: 'Account Deleted',
          description: 'Your account has been successfully removed',
        });
        navigate('/');
      } catch (error) {
        console.error('Delete error:', error);
        showToast({
          title: 'Error',
          description: 'Failed to delete account. Please try again or contact support.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    }
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
                  disabled
                  className="bg-muted text-muted-foreground border-border cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Contact support to change your name</p>
              </div>
              <div>
                <Label htmlFor="email" className="text-body-sm font-medium text-foreground mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="bg-muted text-muted-foreground border-border cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 md:p-8 border border-border bg-card">
          <h2 className="text-h3 font-heading text-foreground mb-6">Password Settings</h2>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="new-password" className="text-body-sm font-medium text-foreground mb-2 block">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-body-sm font-medium text-foreground mb-2 block">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background text-foreground border-border"
                />
              </div>
            </div>

            <div className="flex justify-start">
              <Button
                onClick={handleChangePassword}
                variant="outline"
                disabled={loading || !newPassword || !currentPassword}
                className="bg-transparent text-primary border-primary hover:bg-primary/10 font-normal"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
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
              <Switch
                checked={isVisible}
                onCheckedChange={setIsVisible}
              />
            </div>

            <Separator className="bg-border" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm font-medium text-foreground">Show Activity Status</p>
                <p className="text-caption text-muted-foreground">Let others see when you're active</p>
              </div>
              <Switch
                checked={showActivity}
                onCheckedChange={setShowActivity}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSaveSettings}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary-hover font-normal"
            >
              {loading ? 'Saving...' : 'Save Privacy Settings'}
            </Button>
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

          <Separator className="bg-error/10 my-6" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-body-sm font-medium text-foreground">Delete Account</p>
              <p className="text-caption text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              onClick={handleDeleteAccount}
              variant="destructive"
              disabled={loading}
              className="bg-error text-error-foreground hover:bg-error-hover font-normal"
            >
              Delete Profile
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout >
  );
};

export default Settings;
