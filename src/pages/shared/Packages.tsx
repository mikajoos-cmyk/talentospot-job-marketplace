import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Check, Star, Loader2, CheckCircle2, BarChart3 } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { packagesService } from '../../services/packages.service';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

type UserType = 'employer' | 'candidate';

const Packages: React.FC = () => {
  const { user, refreshUser } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>(user.role === 'candidate' ? 'candidate' : 'employer');
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    loadPackages();
  }, [userType, user.id]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const [pkgs, sub] = await Promise.all([
        packagesService.getPackages(userType),
        user.id ? packagesService.getUserSubscription(user.id) : Promise.resolve(null)
      ]);

      setPackages(pkgs || []);
      setCurrentSubscription(sub);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load packages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (pkg: any) => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    // Für Demo-Zwecke: Wenn Preis > 0, zeige Toast (oder Stripe Start)
    if (pkg.price_yearly > 0) {
      // Hier würde man den Stripe Checkout starten
      showToast({
        title: 'Payment Integration',
        description: 'This would redirect to Stripe Checkout. For this demo, we will assign the package directly.',
      });
      // Fallback for demo: assign anyway
    }

    try {
      setProcessingId(pkg.id);
      await packagesService.assignPackage(user.id, pkg.id);
      
      // Wait a bit for DB to catch up if needed
      await new Promise(resolve => setTimeout(resolve, 500));
      await refreshUser();

      showToast({
        title: 'Success',
        description: `You have successfully subscribed to ${pkg.name}`,
      });
      // Reload to update current subscription
      await loadPackages();
    } catch (error: any) {
      console.error('Error subscribing:', error);
      showToast({
        title: 'Error',
        description: error.message || 'Failed to subscribe',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatFeatures = (pkg: any) => {
    const features = [];

    // Feature Mapping based on Limits
    if (pkg.target_role === 'employer') {
      features.push(pkg.limit_contacts === null ? 'Unlimited Contact Requests' : `${pkg.limit_contacts} Contact Requests`);
      features.push(pkg.limit_jobs === null ? 'Unlimited Job Postings' : `${pkg.limit_jobs} Job Postings`);
      if (pkg.limit_featured_jobs > 0) features.push(`${pkg.limit_featured_jobs} Featured Jobs`);
      features.push(`${pkg.duration_days || 365} Days Active`);
    } else {
      if (pkg.can_search_jobs) {
        features.push('Unlimited Job Search');
      } else {
        features.push('Invitation Only (Passive)');
      }
      features.push(pkg.limit_applications === null ? 'Unlimited Applications' : `${pkg.limit_applications} Applications`);

      if (pkg.price_yearly > 0) {
        features.push('Priority in Search Results');
        features.push('Enhanced Profile Visibility');
      }
    }

    features.push('Email Support');

    return features;
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-h1 font-heading text-foreground mb-2">
            {userType === 'candidate' ? 'Candidate Packages' : 'Employer Packages'}
          </h1>
          <p className="text-body text-muted-foreground mb-4">
            Select the perfect package for your needs
          </p>
          <div className="flex justify-center mb-8">
            <Button
              variant="outline"
              size="lg"
              className="flex items-center space-x-2 border-primary text-primary hover:bg-primary/5"
              onClick={() => navigate(`/${user.role}/usage`)}
            >
              <BarChart3 className="w-5 h-5" />
              <span>View Your Current Usage & Limits</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${packages.length > 3 ? 4 : 3} gap-8 max-w-7xl mx-auto`}>
            {packages.map((pkg) => {
              const isCurrent = currentSubscription?.package_id === pkg.id;
              // Highlight logic
              const isHighlight = !isCurrent && (pkg.name.toLowerCase().includes('premium') || pkg.price_yearly === 499 || pkg.price_yearly === 59);

              return (
                <Card
                  key={pkg.id}
                  className={`p-8 border ${isCurrent
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                    : isHighlight
                      ? 'border-primary shadow-xl scale-105'
                      : 'border-border'
                    } bg-card relative flex flex-col transition-all duration-200`}
                >
                  {isCurrent && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="flex items-center space-x-1 px-4 py-1 bg-green-600 text-white rounded-full text-caption font-medium shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Current Plan</span>
                      </div>
                    </div>
                  )}

                  {!isCurrent && isHighlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="flex items-center space-x-1 px-4 py-1 bg-primary text-primary-foreground rounded-full text-caption font-medium">
                        <Star className="w-3 h-3" strokeWidth={2} fill="currentColor" />
                        <span>Best Value</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6 pt-2">
                    <h3 className="text-h3 font-heading text-foreground mb-2">{pkg.name}</h3>
                    <div className="mb-2">
                      <span className="text-h1 font-heading text-foreground">
                        {pkg.price_yearly === 0 ? 'Free' : `€${pkg.price_yearly}`}
                      </span>
                      {pkg.price_yearly > 0 ? (
                        <span className="text-body text-muted-foreground ml-2">/ year</span>
                      ) : (
                        <span className="text-body text-muted-foreground ml-2">Forever</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {formatFeatures(pkg).map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <span className="text-body-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full font-normal ${isCurrent
                      ? 'bg-muted text-muted-foreground transform-none hover:bg-muted cursor-default'
                      : isHighlight
                        ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                        : 'bg-transparent text-foreground border border-border hover:bg-muted hover:text-foreground'
                      }`}
                    variant={isHighlight && !isCurrent ? 'default' : 'outline'}
                    onClick={() => !isCurrent && handleSubscribe(pkg)}
                    disabled={!!processingId || isCurrent}
                  >
                    {processingId === pkg.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : isCurrent ? (
                      'Active Plan'
                    ) : (
                      pkg.price_yearly === 0 ? 'Get Started' : 'Upgrade Now'
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-body text-muted-foreground mb-4">
            Need a custom solution? Contact our sales team.
          </p>
          <Button
            variant="outline"
            className="bg-transparent text-foreground border-border hover:bg-muted hover:text-foreground font-normal"
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Packages;
