import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Loader2, ArrowLeft, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { packagesService } from '../../services/packages.service';
import { useNavigate } from 'react-router-dom';

const Usage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const loadUsage = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const sub = await packagesService.getUserSubscription(user.id);
        setSubscription(sub);
      } catch (error) {
        console.error('Error loading usage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsage();
  }, [user?.id]);

  const renderUsageItem = (label: string, used: number, limit: number | null) => {
    const percentage = limit === null ? 0 : (limit === 0 ? 0 : Math.min(100, (used / limit) * 100));
    const isUnlimited = limit === null;
    const isZero = limit === 0;

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-body-sm font-medium text-foreground">{label}</p>
            <p className="text-caption text-muted-foreground">
              {isUnlimited ? `${used} used / Unlimited` : (isZero ? `0 of 0 used (Upgrade needed)` : `${used} of ${limit} used`)}
            </p>
          </div>
          {!isUnlimited && !isZero && (
            <span className={`text-caption font-medium ${percentage >= 90 ? 'text-destructive' : 'text-primary'}`}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
        {!isUnlimited && !isZero && (
          <Progress value={percentage} className="h-2" />
        )}
        {isZero && (
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden" />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-body text-muted-foreground">Loading usage data...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </div>

        <div className="space-y-2">
          <h1 className="text-h1 font-heading text-foreground">Usage Overview</h1>
          <p className="text-body text-muted-foreground">
            Track your current package limits and consumption
          </p>
        </div>

        {!subscription ? (
          <div className="grid gap-6">
            <Card className="p-6 md:p-8 border-border bg-card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-muted p-3 rounded-full">
                    <BarChart3 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-h3 font-heading text-foreground">
                      No Active Plan
                    </h2>
                    <p className="text-body-sm text-muted-foreground">
                      You are currently using the limited free features
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 px-4 py-1.5 bg-muted text-muted-foreground rounded-full text-caption font-medium border border-border">
                  <AlertCircle className="w-4 h-4" />
                  <span>INACTIVE</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 space-y-8">
              <h3 className="text-h4 font-heading text-foreground border-b pb-4">Limits & Usage (Free Tier)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {user.role === 'employer' ? (
                  <>
                    {renderUsageItem('Job Postings', 0, 0)}
                    {renderUsageItem('Contact Requests', 0, 0)}
                    {renderUsageItem('Featured Jobs', 0, 0)}
                  </>
                ) : (
                  <>
                    {renderUsageItem('Job Applications', 0, 0)}
                    <div className="space-y-2">
                      <p className="text-body-sm font-medium text-foreground">Job Search Access</p>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-body-sm text-muted-foreground">Disabled</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={() => navigate(`/${user.role}/packages`)}>
                  Choose a Package
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid gap-6">
            <Card className="p-6 md:p-8 border-primary/20 bg-primary/5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-h3 font-heading text-foreground">
                      {subscription.packages?.name}
                    </h2>
                    <p className="text-body-sm text-muted-foreground">
                      Active until {new Date(subscription.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 px-4 py-1.5 bg-green-600/10 text-green-600 rounded-full text-caption font-medium border border-green-600/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{subscription.status.toUpperCase()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 md:p-8 space-y-8">
              <h3 className="text-h4 font-heading text-foreground border-b pb-4">Limits & Usage</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {user.role === 'employer' ? (
                  <>
                    {renderUsageItem('Job Postings', subscription.jobs_used, subscription.packages.limit_jobs)}
                    {renderUsageItem('Contact Requests', subscription.contacts_used, subscription.packages.limit_contacts)}
                    {renderUsageItem('Featured Jobs', subscription.featured_jobs_used, subscription.packages.limit_featured_jobs)}
                  </>
                ) : (
                  <>
                    {renderUsageItem('Job Applications', subscription.applications_used, subscription.packages.limit_applications)}
                    <div className="space-y-2">
                      <p className="text-body-sm font-medium text-foreground">Job Search Access</p>
                      <div className="flex items-center space-x-2">
                        {subscription.packages.can_search_jobs ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-body-sm">Enabled</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="text-body-sm text-muted-foreground">Disabled</span>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <Button variant="outline" onClick={() => navigate(`/${user.role}/packages`)}>
                  Upgrade Package
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Usage;
