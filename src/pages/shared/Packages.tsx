import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import { packagesService } from '@/services/packages.service';
import { stripeService } from '@/services/stripe.service';

const Packages: React.FC = () => {
  const { user } = useUser();
  const { showToast } = useToast();
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        const packagesData = await packagesService.getPackages();

        const filteredPackages = packagesData?.filter((pkg: any) => pkg.role === user.role) || [];
        setPackages(filteredPackages);
      } catch (error) {
        console.error('Error loading packages:', error);
        showToast({
          title: 'Error',
          description: 'Failed to load packages. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, [user.role]);

  const handleSelectPackage = async (pkg: any) => {
    if (pkg.price === 0 || pkg.price === '0') {
      showToast({
        title: 'Free Package',
        description: 'You are already using the free package',
      });
      return;
    }

    try {
      showToast({
        title: 'Processing',
        description: 'Redirecting to payment...',
      });

      await stripeService.createCheckoutSession(pkg.id, user.id);
    } catch (error) {
      console.error('Error initiating purchase:', error);
      showToast({
        title: 'Error',
        description: 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-h1 font-heading text-foreground mb-2">
            {user.role === 'candidate' ? 'Candidate Packages' : 'Employer Packages'}
          </h1>
          <p className="text-body text-muted-foreground mb-8">
            Select the perfect package for your needs
          </p>
        </div>

        {packages.length === 0 ? (
          <Card className="p-12 border border-border bg-card text-center">
            <p className="text-body text-muted-foreground">No packages available</p>
          </Card>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 ${packages.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8 max-w-7xl mx-auto`}>
            {packages.map((pkg) => {
              const features = pkg.features ? JSON.parse(pkg.features) : [];
              const isHighlighted = pkg.tier === 'premium' || pkg.tier === 'standard';
              const priceDisplay = pkg.price === 0 ? '€0' : `€${pkg.price.toLocaleString()}`;
              const isCurrentPackage = user.subscription?.package_id === pkg.id;

              return (
                <Card
                  key={pkg.id}
                  className={`p-8 border ${
                    isHighlighted
                      ? 'border-primary shadow-xl scale-105'
                      : 'border-border'
                  } bg-card relative`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="flex items-center space-x-1 px-4 py-1 bg-primary text-primary-foreground rounded-full text-caption font-medium">
                        <Star className="w-3 h-3" strokeWidth={2} fill="currentColor" />
                        <span>Best Value</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-h3 font-heading text-foreground mb-2">{pkg.name}</h3>
                    <div className="mb-2">
                      <span className="text-h1 font-heading text-foreground">{priceDisplay}</span>
                      <span className="text-body text-muted-foreground ml-2">/ {pkg.billing_period || 'year'}</span>
                    </div>
                    {pkg.description && (
                      <p className="text-body-sm text-muted-foreground">{pkg.description}</p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <span className="text-body-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPackage(pkg)}
                    disabled={isCurrentPackage}
                    className={`w-full font-normal ${
                      isHighlighted
                        ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                        : 'bg-transparent text-foreground border border-border hover:bg-muted hover:text-foreground'
                    }`}
                    variant={isHighlighted ? 'default' : 'outline'}
                  >
                    {isCurrentPackage ? 'Current Plan' : pkg.price === 0 ? 'Get Started' : 'Upgrade Now'}
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
