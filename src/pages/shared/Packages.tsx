import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

type UserType = 'employer' | 'candidate';

interface Package {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
}

const Packages: React.FC = () => {
  const { user } = useUser();
  const [userType, setUserType] = useState<UserType>(user.role === 'candidate' ? 'candidate' : 'employer');

  const employerPackages: Package[] = [
    {
      name: 'Free',
      price: '€0',
      period: 'Forever',
      features: [
        '1 Contact Request',
        '1 Job Posting',
        '30 Days Active',
        'Basic Search Filters',
        'Email Support',
      ],
    },
    {
      name: 'Standard',
      price: '€499',
      period: 'per year',
      features: [
        '10 Contact Requests',
        '10 Job Postings',
        '1 Featured Job',
        'Advanced Search Filters',
        'Application Tracking',
        'Priority Support',
      ],
    },
    {
      name: 'Premium',
      price: '€899',
      period: 'per year',
      features: [
        'Unlimited Contact Requests',
        '25 Job Postings',
        '5 Featured Jobs',
        'Advanced Analytics',
        'Dedicated Account Manager',
        'Company Profile Page',
      ],
      highlighted: true,
    },
    {
      name: 'Premium Plus',
      price: '€1,690',
      period: 'per year',
      features: [
        'Unlimited Contact Requests',
        '100 Job Postings',
        '25 Featured Jobs',
        'Advanced Analytics',
        'Dedicated Account Manager',
        'API Access',
        'Custom Branding',
      ],
    },
  ];

  const candidatePackages: Package[] = [
    {
      name: 'Free',
      price: '€0',
      period: 'Invitation Only',
      features: [
        'By Employer Invitation',
        'Basic Profile',
        'Job Search',
        'Email Notifications',
        'Standard Support',
      ],
    },
    {
      name: 'Starting',
      price: '€59',
      period: 'per year',
      features: [
        '5 Initiated Applications',
        'Unlimited Job Search',
        'Enhanced Profile',
        'Priority in Search Results',
        'Application Tracking',
        'Priority Support',
      ],
      highlighted: true,
    },
    {
      name: 'Standard',
      price: '€89',
      period: 'per year',
      features: [
        '10 Initiated Applications',
        'Unlimited Job Search',
        'Featured Profile',
        'Resume Builder',
        'Career Advice',
        'Priority Support',
      ],
    },
  ];

  const packages = userType === 'employer' ? employerPackages : candidatePackages;

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

        <div className={`grid grid-cols-1 md:grid-cols-2 ${userType === 'employer' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8 max-w-7xl mx-auto`}>
          {packages.map((pkg) => (
            <Card
              key={pkg.name}
              className={`p-8 border ${
                pkg.highlighted
                  ? 'border-primary shadow-xl scale-105'
                  : 'border-border'
              } bg-card relative`}
            >
              {pkg.highlighted && (
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
                  <span className="text-h1 font-heading text-foreground">{pkg.price}</span>
                  <span className="text-body text-muted-foreground ml-2">/ {pkg.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="text-body-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full font-normal ${
                  pkg.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                    : 'bg-transparent text-foreground border border-border hover:bg-muted hover:text-foreground'
                }`}
                variant={pkg.highlighted ? 'default' : 'outline'}
              >
                {pkg.price === '€0' ? 'Get Started' : 'Upgrade Now'}
              </Button>
            </Card>
          ))}
        </div>

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
